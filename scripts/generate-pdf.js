import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const margin = 15;
const pageWidth = doc.internal.pageSize.getWidth();
const contentWidth = pageWidth - margin * 2;
let y = 15;

const checkAddPage = (neededSpace) => {
  if (y + neededSpace > 275) {
    doc.addPage();
    y = 15;
  }
};

const addHeader = () => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Suresh Kumar Mukhiya', margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Curriculum Vitae', pageWidth - margin, y, { align: 'right' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Tjørnhaugen, 158, Bergen 5154, Norway  |  (+47) 94430044', margin, y);
  y += 4;
  doc.text('Email: itsmeskm99@gmail.com  |  Web: www.skmukhiya.com.np', margin, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 136, 34);
  doc.text('Core Focus: Adaptive Systems | Scalable & Secured Systems | Cyber Security | AI & Agentic Engineering', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Backend Stack: Python, Node.js, Rust, Java, SQL, PostgreSQL, Redis', margin, y);
  y += 5;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
};

const addSectionHeader = (title) => {
  checkAddPage(14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 136, 34); // #008822
  doc.text(title.toUpperCase(), margin, y);
  y += 2;
  doc.setDrawColor(0, 136, 34);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 40, y);
  y += 5;
};

// --- Page 1 ---
addHeader();

// Education Section
addSectionHeader('Education');

const eduItems = [
  {
    period: '2018–2021',
    degree: 'PhD',
    school: 'Western Norway University of Applied Sciences, Norway',
    detail: 'Thesis: A Software Framework for Adaptive and Interoperable Internet-Delivered Psychological Treatments. Doctoral degree awarded on 21st September, 2021.'
  },
  {
    period: '2014–2016',
    degree: 'Masters In Information System',
    school: 'Norwegian University of Science and Technology, Norway',
    detail: 'Thesis: Predicting The Next Click With Web Log Process Mining. Average Grade: B.'
  },
  {
    period: '2008–2013',
    degree: 'Bachelor In Computer Science and Information Technology',
    school: 'Kathford International College of Engineering and Management, Nepal',
    detail: 'Grade: 91.6%. Recognized with Vice-Chancellor\'s Award for academic excellence (top score).'
  }
];

eduItems.forEach(item => {
  checkAddPage(18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`${item.period}   ${item.degree}, ${item.school}`, margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const splitText = doc.splitTextToSize(item.detail, contentWidth - 5);
  doc.text(splitText, margin + 5, y);
  y += splitText.length * 3.5 + 3;
});

// Work Experience Section
addSectionHeader('Work Experience');

const workItemsPage1 = [
  {
    period: '2026(Jan)-Current',
    role: 'Tech Lead',
    company: 'Lerøy Seafood Group, https://www.leroyseafood.com/',
    desc: 'I lead the design and development of internal digital solutions across frontend, backend, cloud, and AI-driven systems. My role includes defining technical architecture, guiding developers, improving code quality, managing Azure-based infrastructure, and ensuring secure, scalable, and maintainable solutions that support business needs across the organization.',
    tags: ['ReactJS', 'Tailwind', 'TypeScript', 'Azure', 'Azure SQL', 'FastAPI', 'SonarQube', 'FE Security', 'CI/CD', 'TDD', 'Agentic AI', 'Microfrontend architecture', 'Python']
  },
  {
    period: '2024(August)-2025',
    role: 'Tech Lead',
    company: 'Tryg Norway, https://www.tryg.no/',
    desc: 'I am responsible for leading and architecting the design and development of customer-facing applications.',
    tags: ['VueJS', 'SCSS', 'TypeScript', 'Stencil JS', 'Oracle', 'PL/SQL', 'SonarQube', 'FE Security', 'CI/CD', 'TDD', 'Universal Design', 'Microfrontend architecture', 'JAVA/Kotlin']
  },
  {
    period: '2021(August)-2024(Jan)',
    role: 'Senior System Developer',
    company: 'Tryg Norway, https://www.tryg.no/',
    desc: 'I am responsible for designing and developing a web application that allows insurance agents to access various risks associated with any property. The system provides the best possible personalized quotes to enterprise customers based on the risk assessment.',
    tags: ['ReactJS', 'GraphQL', 'Apollo Client', 'TypeScript', 'Material UI', 'Cypress', 'JEST', 'Python', 'Azure', 'SAFe Agile Methodologies', 'GitLab', 'SonarQube', 'Miro.com', 'CI/CD', 'BDD', 'TDD', 'JIRA']
  }
];

const renderWorkItem = (item) => {
  checkAddPage(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`${item.period}   ${item.role}, ${item.company}`, margin, y);
  y += 4.5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(item.desc, contentWidth - 5);
  doc.text(descLines, margin + 5, y);
  y += descLines.length * 3.6 + 2.5;

  // Tags
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 136, 34);
  const tagStr = item.tags.join('   •   ');
  const tagLines = doc.splitTextToSize(tagStr, contentWidth - 5);
  doc.text(tagLines, margin + 5, y);
  y += tagLines.length * 3.5 + 4;
};

workItemsPage1.forEach(renderWorkItem);

// Force Page 2
doc.addPage();
y = 15;

const workItemsPage2 = [
  {
    period: '2018-2021 (July)',
    role: 'PhD Researcher',
    company: 'HVL, Norway, https://www.hvl.no',
    desc: 'The study attempted to use Model-based Software Engineering (MBSE), design thinking, and AI approaches to create adaptive and interoperable Internet-Delivered Psychological Treatments (IDPT) systems.',
    tags: ['Python', 'ReactJS', 'GraphQL', 'TypeScript', 'Ant Design System', 'Node JS', 'MongoDB', 'GitHub', 'Circle CI', 'draw.io', 'Agile methodologies', 'R&D']
  },
  {
    period: '2017 – 2018',
    role: 'Software Developer',
    company: 'Lokincubator, Inc., Kansas City (Remote), https://lokincubator.com/',
    desc: 'Lokincubator provides modern web and mobile solutions, from idea to launch. I contributed to their festival aggregator web application, which recommends global festivals to users based on their preferences. My role included modeling, designing, and developing end-to-end features.',
    tags: ['ReactJS', 'Redux', 'JavaScript', 'Ant Design', 'NodeJS', 'MySQL', 'GitHub', 'CircleCI', 'draw.io', 'Agile methodologies']
  },
  {
    period: '2016 - 2018',
    role: 'Fullstack Developer',
    company: 'Landed, Inc, San Francisco, (Remote), https://www.landed.com/',
    desc: 'Landed is a company with the mission to help essential professionals build financial security near the communities they serve. I was responsible for developing and maintaining the web application to create and maintain financial applications workflows.',
    tags: ['ReactJS', 'Redux', 'Redux-Saga', 'JavaScript', 'Node JS', 'PostgreSQL', 'GitHub', 'Circle CI', 'draw.io', 'SCRUM', 'AWS/S3']
  },
  {
    period: '2016(June)–2017(July)',
    role: 'Frontend Developer',
    company: 'Sincos Software AS, Norway, https://www.24nettbutikk.no/',
    desc: '24estore is a Norwegian company that develops e-commerce solutions for customers around the world. I was responsible for both the front-end and back-end work.',
    tags: ['ReactJS', 'Redux', 'UIKIT', 'Laravel', 'MySQL', 'Circle CI', 'SCRUM']
  },
  {
    period: '2010–2018',
    role: 'Fullstack developer',
    company: 'UPWORK.COM (Remote, freelancer), www.upwork.com',
    desc: 'I worked as a freelancer in Upwork and provided services related to designing and developing web applications.',
    tags: ['WordPress', 'PHP', 'ReactJS', 'Redux', 'NextJS', 'Node JS', 'MySQL', 'Circle CI', 'MongoDB', 'AWS', 'CI/CD', 'Web Security', 'Python', 'SCRUM']
  }
];

workItemsPage2.forEach(renderWorkItem);

// Technical Book publication
addSectionHeader('Technical Book publication');

const books = [
  {
    cat: 'Data analytics, Python',
    title: 'Statistics for Data Scientists and Analysts',
    info: '2025 Edition, BPB Online, Dipendra Pant, Suresh Kumar Mukhiya.'
  },
  {
    cat: 'Data analytics, Python',
    title: 'Hands-on Exploratory Data Analysis',
    info: '2020, Packt Publishing Limited, Suresh Kumar Mukhiya, Usman Ahmed.'
  },
  {
    cat: 'Big Data & Machine Learning',
    title: 'Hands-on Big Data Modeling',
    info: '2018, Packt Publishing Limited, Co-authors: James Lee, Tao Wei, Suresh Kumar Mukhiya.'
  },
  {
    cat: 'React, Redux',
    title: 'Redux Quick Start Guide',
    info: '2019, Packt Publishing Limited, Co-authors: James Lee, Tao Wei, Suresh Kumar Mukhiya.'
  }
];

books.forEach(b => {
  checkAddPage(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${b.cat}: `, margin, y);
  const catWidth = doc.getTextWidth(`${b.cat}: `);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 136, 34);
  doc.text(b.title, margin + catWidth, y);
  y += 4;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(b.info, margin + 5, y);
  y += 5.5;
});

// Write PDF file
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(path.join(publicDir, 'Suresh_Kumar_Mukhiya_CV.pdf'), pdfBuffer);
fs.writeFileSync(path.join(publicDir, 'cv.pdf'), pdfBuffer);

console.log('PDF generated successfully at public/Suresh_Kumar_Mukhiya_CV.pdf and public/cv.pdf');
