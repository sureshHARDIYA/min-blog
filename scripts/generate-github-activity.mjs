import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const username = process.env.GITHUB_ACTIVITY_USER || 'sureshHARDIYA';
const token = process.env.GH_ACTIVITY_TOKEN;

if (!token) {
  throw new Error('GH_ACTIVITY_TOKEN is required to refresh GitHub activity.');
}
const windowDays = 90;
const maxRepositories = 40;
const apiBase = 'https://api.github.com';
const outputPath = path.join(process.cwd(), 'src', 'generated', 'github-activity.json');
const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
const weekMs = 7 * 24 * 60 * 60 * 1000;
const activityWeeks = Array.from({ length: 13 }, (_, index) => {
  const start = new Date(Date.now() - (12 - index) * weekMs);
  return {
    start: start.toISOString().slice(0, 10),
    label: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(start),
    commits: 0,
  };
});

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'skmukhiya-tech-map',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function github(pathname, { optional = false } = {}) {
  const response = await fetch(`${apiBase}${pathname}`, { headers });

  if (optional && (response.status === 403 || response.status === 404)) return null;
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${pathname}`);
  }

  return response.json();
}

async function repositoryFile(repository, filePath) {
  const result = await github(
    `/repos/${repository}/contents/${filePath}`,
    { optional: true },
  );

  if (!result || Array.isArray(result) || !result.content) return '';
  return Buffer.from(result.content.replaceAll('\n', ''), 'base64').toString('utf8');
}

function addTechnology(technologies, name, category, repository, commits) {
  const current = technologies.get(name) || {
    name,
    category,
    repositories: new Set(),
    recentCommits: 0,
  };

  current.repositories.add(repository);
  current.recentCommits += commits;
  technologies.set(name, current);
}

function detectTechnologies({ repository, languages, manifests, commits }, technologies) {
  const languageCategories = {
    TypeScript: 'Frontend',
    JavaScript: 'Frontend',
    CSS: 'Frontend',
    HTML: 'Frontend',
    Python: 'Backend',
    Rust: 'Backend',
    Java: 'Backend',
    Kotlin: 'Backend',
    PHP: 'Backend',
    'Jupyter Notebook': 'Data & AI',
    Shell: 'Platform',
    Dockerfile: 'Platform',
  };

  for (const language of Object.keys(languages)) {
    const category = languageCategories[language];
    if (category) addTechnology(technologies, language, category, repository, commits);
  }

  const packageJson = manifests.packageJson.toLowerCase();
  const python = `${manifests.pyproject}\n${manifests.requirements}`.toLowerCase();
  const cargo = manifests.cargo.toLowerCase();

  const signatures = [
    [packageJson, '"scripts"', 'Node.js', 'Platform'],
    [packageJson, '"react"', 'React', 'Frontend'],
    [packageJson, '"next"', 'Next.js', 'Frontend'],
    [packageJson, '"vue"', 'Vue', 'Frontend'],
    [packageJson, 'tailwindcss', 'Tailwind CSS', 'Frontend'],
    [python, 'fastapi', 'FastAPI', 'Backend'],
    [python, 'django', 'Django', 'Backend'],
    [python, 'pandas', 'Pandas', 'Data & AI'],
    [python, 'scikit-learn', 'scikit-learn', 'Data & AI'],
    [cargo, '[package]', 'Rust', 'Backend'],
    [cargo, 'axum', 'Axum', 'Backend'],
    [cargo, 'actix-web', 'Actix Web', 'Backend'],
    [cargo, 'sqlx', 'SQLx', 'Data'],
  ];

  for (const [source, signature, name, category] of signatures) {
    if (source.includes(signature)) {
      addTechnology(technologies, name, category, repository, commits);
    }
  }
}

const [profile, repositories] = await Promise.all([
  github(`/users/${username}`),
  github('/user/repos?affiliation=owner,collaborator,organization_member&visibility=all&sort=pushed&direction=desc&per_page=100'),
]);

const selected = repositories
  .filter(
    (repository) =>
      !repository.fork && !repository.archived && repository.size > 0,
  )
  .slice(0, maxRepositories);

const technologies = new Map();
const languageTotals = new Map();
const activityGroups = new Map();

for (const repository of selected) {
  const fullName = repository.full_name;
  const [languagesResult, commitsResult, packageJson, pyproject, requirements, cargo] = await Promise.all([
    github(`/repos/${fullName}/languages`, { optional: true }),
    github(`/repos/${fullName}/commits?author=${username}&since=${cutoff}&per_page=100`, { optional: true }),
    repositoryFile(fullName, 'package.json'),
    repositoryFile(fullName, 'pyproject.toml'),
    repositoryFile(fullName, 'requirements.txt'),
    repositoryFile(fullName, 'Cargo.toml'),
  ]);

  if (!languagesResult && !commitsResult) continue;
  const languages = languagesResult || {};
  const commits = commitsResult || [];

  for (const [language, bytes] of Object.entries(languages)) {
    languageTotals.set(language, (languageTotals.get(language) || 0) + bytes);
  }

  detectTechnologies(
    {
      repository: fullName,
      languages,
      manifests: { packageJson, pyproject, requirements, cargo },
      commits: commits.length,
    },
    technologies,
  );

  for (const commit of commits) {
    const commitDate = new Date(commit.commit?.author?.date || commit.commit?.committer?.date);
    const weeksAgo = Math.floor((Date.now() - commitDate.getTime()) / weekMs);
    if (weeksAgo >= 0 && weeksAgo < activityWeeks.length) {
      activityWeeks[activityWeeks.length - 1 - weeksAgo].commits += 1;
    }
  }

  const scope = repository.owner?.login === username
    ? (repository.private ? 'Private personal work' : 'Public personal work')
    : 'Organization work';
  const currentGroup = activityGroups.get(scope) || {
    name: scope,
    recentCommits: 0,
    repositories: 0,
    languages: new Set(),
  };
  currentGroup.recentCommits += commits.length;
  currentGroup.repositories += 1;
  for (const language of Object.keys(languages)) currentGroup.languages.add(language);
  activityGroups.set(scope, currentGroup);
}

const totalLanguageBytes = [...languageTotals.values()].reduce((sum, bytes) => sum + bytes, 0);
const outputGeneratedAt = new Date().toISOString();
const output = {
  generatedAt: outputGeneratedAt,
  username,
  profile: {
    name: profile.name || username,
    avatarUrl: profile.avatar_url,
    profileUrl: profile.html_url,
    publicRepositories: profile.public_repos,
    joinedAt: profile.created_at,
  },
  publicOnly: false,
  windowDays,
  repositoriesAnalyzed: selected.length,
  recentCommits: [...activityGroups.values()].reduce((sum, group) => sum + group.recentCommits, 0),
  activityWeeks,
  technologies: [...technologies.values()]
    .map((technology) => ({
      name: technology.name,
      category: technology.category,
      repositories: technology.repositories.size,
      recentCommits: technology.recentCommits,
    }))
    .sort(
      (left, right) =>
        right.repositories - left.repositories ||
        right.recentCommits - left.recentCommits ||
        left.name.localeCompare(right.name),
    ),
  languages: [...languageTotals.entries()]
    .map(([name, bytes]) => ({
      name,
      percentage: totalLanguageBytes ? Math.round((bytes / totalLanguageBytes) * 1000) / 10 : 0,
    }))
    .sort((left, right) => right.percentage - left.percentage)
    .slice(0, 8),
  repositories: [...activityGroups.values()].map((group) => ({
    name: group.name,
    url: profile.html_url,
    description: null,
    pushedAt: outputGeneratedAt,
    recentCommits: group.recentCommits,
    repositoryCount: group.repositories,
    languages: [...group.languages].slice(0, 4),
  })),
  methodology:
    'Authorized, non-fork, non-archived repositories ordered by recent push activity. Private and organization work is published only as aggregate counts; repository names, descriptions, URLs, source, branches, file paths and commit messages are excluded. Technology size reflects repository presence and recent commits, not proficiency.',
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

console.log(`Wrote public GitHub activity for ${selected.length} repositories.`);
