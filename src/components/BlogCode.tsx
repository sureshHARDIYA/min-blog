import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode
} from 'react'

const KEYWORDS: Record<string, ReadonlySet<string>> = {
  javascript: new Set([
    'async',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'default',
    'else',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'null',
    'return',
    'static',
    'switch',
    'throw',
    'true',
    'try',
    'typeof',
    'undefined',
    'while',
    'yield'
  ]),
  python: new Set([
    'and',
    'as',
    'async',
    'await',
    'break',
    'class',
    'continue',
    'def',
    'elif',
    'else',
    'except',
    'False',
    'finally',
    'for',
    'from',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'None',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'True',
    'try',
    'while',
    'with',
    'yield'
  ]),
  rust: new Set([
    'as',
    'async',
    'await',
    'break',
    'const',
    'continue',
    'crate',
    'dyn',
    'else',
    'enum',
    'extern',
    'false',
    'fn',
    'for',
    'if',
    'impl',
    'in',
    'let',
    'loop',
    'match',
    'mod',
    'move',
    'mut',
    'pub',
    'ref',
    'return',
    'self',
    'Self',
    'static',
    'struct',
    'super',
    'trait',
    'true',
    'type',
    'unsafe',
    'use',
    'where',
    'while'
  ])
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rs: 'rust',
  ts: 'javascript',
  tsx: 'javascript'
}

const TOKEN_PATTERN =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|`(?:\\.|[^`])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g

function tokenClass(token: string, language: string) {
  if (
    token.startsWith('//') ||
    token.startsWith('/*') ||
    token.startsWith('#')
  ) {
    return 'blog-token-comment'
  }
  if (/^[`"']/.test(token)) return 'blog-token-string'
  if (/^\d/.test(token)) return 'blog-token-number'
  if (KEYWORDS[language]?.has(token)) return 'blog-token-keyword'
  if (/^[A-Z]/.test(token)) return 'blog-token-type'
  return undefined
}

function highlight(code: string, language: string) {
  const output: ReactNode[] = []
  let cursor = 0

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0
    if (index > cursor) output.push(code.slice(cursor, index))
    const token = match[0]
    const className = tokenClass(token, language)
    output.push(
      className ? (
        <span className={className} key={`${index}-${token}`}>
          {token}
        </span>
      ) : (
        token
      )
    )
    cursor = index + token.length
  }

  if (cursor < code.length) output.push(code.slice(cursor))
  return output
}

export function BlogCode({
  children,
  className
}: ComponentPropsWithoutRef<'code'>) {
  const code = String(children).replace(/\n$/, '')
  const languageName = /language-([\w-]+)/.exec(className ?? '')?.[1]

  if (!languageName && !code.includes('\n')) {
    return <code className='blog-inline-code'>{children}</code>
  }

  const language =
    LANGUAGE_ALIASES[languageName ?? ''] ?? languageName ?? 'text'

  return (
    <figure className='blog-code-block'>
      <figcaption>{languageName ?? 'text'}</figcaption>
      <pre tabIndex={0}>
        <code>{highlight(code, language)}</code>
      </pre>
    </figure>
  )
}

function textContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textContent).join('')
  if (!isValidElement<{ children?: ReactNode }>(node)) return ''
  return textContent(node.props.children)
}

function taskDetails(children: ReactNode) {
  const text = textContent(children)
  const match = /^\s*\[([ xX])\]\s+/.exec(text)
  if (!match) return null
  return {
    checked: match[1].toLowerCase() === 'x',
    label: text.slice(match[0].length)
  }
}

export function BlogList({ children }: ComponentPropsWithoutRef<'ul'>) {
  const items = Children.toArray(children)
  const isTaskList = items.some(
    (item) =>
      isValidElement<{ children?: ReactNode }>(item) &&
      taskDetails(item.props.children)
  )

  return (
    <ul className={isTaskList ? 'blog-task-list' : 'blog-bullet-list'}>
      {children}
    </ul>
  )
}

export function BlogListItem({ children }: ComponentPropsWithoutRef<'li'>) {
  const task = taskDetails(children)
  if (!task) return <li>{children}</li>

  return (
    <li className='blog-task-item'>
      <input
        aria-label={task.label}
        checked={task.checked}
        disabled
        readOnly
        type='checkbox'
      />
      <span>{task.label}</span>
    </li>
  )
}
