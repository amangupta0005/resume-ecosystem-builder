import { PrismaClient, ProjectStatus } from "@prisma/client";

import { DOMAIN_NAMES, type DomainName } from "../src/lib/constants/domains";
import { projectSchema, type ProjectInput } from "../src/lib/validations/resume";

const prisma = new PrismaClient();

const realProfile = {
  fullName: "Aman Gupta",
  email: "ag7921676@gmail.com",
  phone: "+91 7006450243",
  location: "Bengaluru, India",
  websiteUrl: "",
  githubUrl: "https://github.com/aman-coder-005",
  linkedinUrl: "https://linkedin.com/in/aman-gupta-7b352a2a4",
  summary:
    "Proactive Full-Stack Software Engineer with a strong foundation in Computer Science fundamentals, modern web architectures, and machine learning. Proven track record building high-performance web applications using React, Node.js, Express, and MongoDB, with hands-on experience in AI/ML APIs, data analytics, and cloud tooling.",
  languages: ["C", "C++", "Java", "Python", "JavaScript", "SQL"],
  frameworks: [
    "React",
    "Node.js",
    "Express",
    "FastAPI",
    "EJS",
    "Tailwind CSS",
    "Bootstrap",
    "REST APIs",
    "Vite",
  ],
  tools: [
    "MongoDB Atlas",
    "Git",
    "GitHub",
    "Docker",
    "VS Code",
    "Postman",
    "Jenkins",
    "Tableau",
    "NumPy",
    "Pandas",
    "Matplotlib",
  ],
  strengths: [
    "Data Structures & Algorithms",
    "Object-Oriented Programming (OOP)",
    "RESTful API Design",
    "Database Normalization & Indexing",
    "Problem Solving & Debugging",
    "CI/CD & Containerization",
    "Cross-Functional Team Collaboration",
  ],
  educations: [
    {
      institution: "Global Academy of Technology, Bengaluru",
      degree: "Bachelor of Engineering (B.E.)",
      fieldOfStudy: "Computer Science and Engineering",
      startDate: "2024",
      endDate: "2027",
      grade: "CGPA: 9.42 / 10",
      order: 0,
    },
    {
      institution: "Govt Boys Higher Secondary School, Jammu",
      degree: "Higher Secondary (Class 12) - JKBOSE",
      fieldOfStudy: "Science",
      startDate: "2022",
      endDate: "2023",
      grade: "Percentage: 82%",
      order: 1,
    },
  ],
  certifications: [
    {
      name: "Operating Systems Basics",
      issuer: "Cisco Networking Academy",
      issueDate: "November 2024",
      credentialUrl: "",
      order: 0,
    },
    {
      name: "Python Programming – Basic Certification",
      issuer: "Python Institute / Online Fundamentals",
      issueDate: "July 2023",
      credentialUrl: "",
      order: 1,
    },
  ],
};

const realProjects: ProjectInput[] = [
  {
    title: "Resume Ecosystem Builder – Multi-Variant ATS Engine",
    description:
      "Production-grade multi-variant resume builder and ATS intelligence platform featuring real-time keyword parsing, drag-and-drop curation, Redis caching, and automated cloud deployment.",
    techStack: [
      "Next.js 14",
      "React 18",
      "TypeScript",
      "Tailwind CSS",
      "Prisma ORM",
      "PostgreSQL",
      "Redis",
      "Docker",
      "AWS EC2",
      "DuckDNS",
      "Systemd",
      "Zod",
    ],
    status: "completed",
    githubUrl: "https://github.com/aman-coder-005/resume-ecosystem-builder",
    liveUrl: "http://aman-resumes.duckdns.org",
    domainNames: ["Full-Stack", "AI/ML", "Company Full-Stack"],
    bullets: [
      {
        text: "Architected a multi-variant resume platform with Next.js 14 App Router, TypeScript, and Tailwind CSS, featuring drag-and-drop project curation (@hello-pangea/dnd), real-time ATS keyword auditing, and instant 1-click Markdown export for LLMs",
        order: 0,
      },
      {
        text: "Engineered an atomic PostgreSQL backend via Prisma ORM with negative-index transaction reordering, paired with an in-memory Redis 7 cache and sliding-window rate limiter, reducing query latency by 80%+ and preventing brute-force access",
        order: 1,
      },
      {
        text: "Containerized the full stack into an ultra-lean multi-stage Docker image (~130MB Next.js standalone) and deployed on AWS EC2 Free Tier with 2GB swap, configuring zero-touch systemd boot automation for dynamic DuckDNS domain synchronization",
        order: 2,
      },
    ],
  },
  {
    title: "QuickGPT – AI Chatbot Platform",
    description:
      "Production-ready full-stack AI chatbot platform built with Gemini 2.5 Flash, featuring JWT authentication, session history, and cloud image processing.",
    techStack: [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "Gemini 2.5 Flash",
      "ImageKit",
      "Stripe",
      "Docker",
      "GitHub Actions",
      "JWT",
    ],
    status: "completed",
    githubUrl: "https://github.com/aman-coder-005/QuickGpt",
    liveUrl: "https://quick-gpt-smoky.vercel.app",
    domainNames: ["Full-Stack", "AI/ML", "Computer Vision"],
    bullets: [
      {
        text: "Architected a full-stack AI chatbot platform using Gemini 2.5 Flash API, implementing JWT authentication, chat sessions, and community image sharing",
        order: 0,
      },
      {
        text: "Integrated ImageKit SDK for automated AI image processing and cloud media storage, reducing client load times and optimizing media delivery",
        order: 1,
      },
      {
        text: "Engineered secure Stripe payment processing, Docker containerization, and GitHub Actions CI/CD pipelines for automated testing and zero-downtime deployment",
        order: 2,
      },
    ],
  },
  {
    title: "CryptoStack – Real-Time Crypto Tracker",
    description:
      "Full-stack MERN cryptocurrency intelligence application delivering real-time price tracking and interactive historical market charts.",
    techStack: [
      "React",
      "Vite",
      "TailwindCSS",
      "Node.js",
      "Express",
      "MongoDB",
      "CoinMarketCap API",
      "Recharts",
    ],
    status: "completed",
    githubUrl: "https://github.com/aman-coder-005/crypto-project",
    liveUrl: "https://frontend-phi-ten-11.vercel.app",
    domainNames: ["Full-Stack"],
    bullets: [
      {
        text: "Developed CryptoStack, a full-stack MERN application delivering real-time cryptocurrency price tracking and historical trend analysis",
        order: 0,
      },
      {
        text: "Integrated CoinMarketCap REST APIs and Recharts data visualization to render interactive market charts and responsive pricing tables",
        order: 1,
      },
      {
        text: "Optimized client-side rendering with Vite and TailwindCSS, achieving sub-second page transitions and seamless cross-device performance",
        order: 2,
      },
    ],
  },
  {
    title: "CollabTrack – Student Collaboration Platform",
    description:
      "Full-stack student collaboration portal allowing users to post projects, assign roles, and track team milestones in real time.",
    techStack: ["MongoDB", "Express", "React", "Node.js", "JWT", "TailwindCSS"],
    status: "completed",
    githubUrl: "https://github.com/aman-coder-005/Collab_Track",
    liveUrl: "",
    domainNames: ["Full-Stack"],
    bullets: [
      {
        text: "Architected CollabTrack, a centralized student collaboration portal facilitating project recruitment, role delegation, and workflow management",
        order: 0,
      },
      {
        text: "Implemented secure JWT authentication and role-based access control (RBAC) across Express REST APIs and MongoDB Atlas collections",
        order: 1,
      },
      {
        text: "Designed a clean, responsive dashboard in React and TailwindCSS, streamlining team formation and milestone tracking for student teams",
        order: 2,
      },
    ],
  },
  {
    title: "AcadSecure – AI Plagiarism & Collusion Detection",
    description:
      "AI-powered academic integrity and collusion detection system analyzing submissions for plagiarism, AI-generated content, and collusion rings.",
    techStack: [
      "FastAPI",
      "React",
      "Vite",
      "TF-IDF",
      "RoBERTa",
      "DBSCAN",
      "Ethereum",
      "Ganache",
      "NLTK",
      "spaCy",
    ],
    status: "completed",
    githubUrl: "",
    liveUrl: "",
    domainNames: ["AI/ML"],
    bullets: [
      {
        text: "Engineered an AI-powered academic integrity engine detecting plagiarism, synthetic AI content, and student collusion rings",
        order: 0,
      },
      {
        text: "Implemented TF-IDF cosine similarity, fine-tuned RoBERTa transformer, and DBSCAN clustering for multi-document semantic analysis",
        order: 1,
      },
      {
        text: "Integrated Ethereum blockchain smart contracts with Ganache to record tamper-proof audit certificates of analysis reports",
        order: 2,
      },
    ],
  },
  {
    title: "NeuroShield – AI Cognitive Fatigue Monitor",
    description:
      "Real-time AI fatigue and cognitive load monitoring system tracking user telemetry via a browser extension to deliver predictive wellness analytics.",
    techStack: [
      "React 19",
      "Vite",
      "TailwindCSS",
      "Node.js",
      "Express",
      "Python",
      "XGBoost",
      "Scikit-Learn",
      "Chrome Extension V3",
    ],
    status: "completed",
    githubUrl: "",
    liveUrl: "",
    domainNames: ["AI/ML", "IoT+ML"],
    bullets: [
      {
        text: "Developed a real-time cognitive load monitoring system capturing keystroke dynamics and telemetry via a Chrome extension",
        order: 0,
      },
      {
        text: "Trained XGBoost and Scikit-Learn classification pipelines to predict developer fatigue thresholds with high precision",
        order: 1,
      },
      {
        text: "Built an interactive telemetry dashboard with React 19 and Express, streaming live fatigue indicators and break reminders",
        order: 2,
      },
    ],
  },
  {
    title: "Aero Defect AI – Automated Defect Inspection",
    description:
      "AI-powered computer vision system automating aircraft surface inspections by detecting, localizing, and classifying defects from high-resolution imagery.",
    techStack: [
      "Python",
      "Ultralytics YOLOv8",
      "PyTorch",
      "OpenCV",
      "Streamlit",
      "Pandas",
      "NumPy",
      "Matplotlib",
    ],
    status: "completed",
    githubUrl: "",
    liveUrl: "",
    domainNames: ["Computer Vision"],
    bullets: [
      {
        text: "Engineered an automated aircraft surface inspection pipeline detecting cracks, dents, and corrosion from high-resolution imagery",
        order: 0,
      },
      {
        text: "Trained and deployed Ultralytics YOLOv8 and PyTorch models with OpenCV preprocessing for defect localization and bounding box segmentation",
        order: 1,
      },
      {
        text: "Created an interactive Streamlit diagnostic console generating automated severity classification reports and maintenance logs",
        order: 2,
      },
    ],
  },
  {
    title: "SmartLogger – Python Logging & Diagnostic Library",
    description:
      "A lightweight, modular Python logging library published to PyPI, featuring colorized console logs, structured JSON formatting, and automatic file rotation.",
    techStack: ["Python 3", "Setuptools", "Twine", "Unittest", "PyPI"],
    status: "completed",
    githubUrl: "",
    liveUrl: "",
    domainNames: ["Computer Vision", "IoT+ML"],
    bullets: [
      {
        text: "Authored and published a modular Python logging package (smartlogger-aman) to the official PyPI registry",
        order: 0,
      },
      {
        text: "Architected structured JSON formatting, ANSI colorized console logging, and automated size-based file rotation",
        order: 1,
      },
      {
        text: "Engineered comprehensive unit test suites achieving high code coverage and zero-dependency runtime footprint",
        order: 2,
      },
    ],
  },
  {
    title: "Sky2Soil – Precision Agriculture Telemetry",
    description:
      "End-to-end precision agriculture platform collecting real-time environmental and soil telemetry, predicting crop yields using ML regression models.",
    techStack: [
      "ESP32",
      "Arduino/C++",
      "DHT22",
      "React 18",
      "Vite",
      "Recharts",
      "Node.js",
      "Express.js",
      "Python",
      "Scikit-Learn",
      "XGBoost",
      "Pandas",
    ],
    status: "in-progress",
    githubUrl: "",
    liveUrl: "",
    domainNames: ["IoT+ML"],
    bullets: [
      {
        text: "Constructed an IoT precision agriculture system aggregating soil telemetry from ESP32 microcontrollers and DHT22 sensors",
        order: 0,
      },
      {
        text: "Deployed Scikit-Learn and XGBoost regression models predicting localized crop yields from environmental time-series data",
        order: 1,
      },
      {
        text: "Built a full-stack telemetry monitoring dashboard with React, Recharts, and Express for real-time farm visualization",
        order: 2,
      },
    ],
  },
];

// Curated 3 top projects per domain
const DOMAIN_PROJECT_MAPPING: Record<DomainName, string[]> = {
  "All Domains": [
    "Resume Ecosystem Builder – Multi-Variant ATS Engine",
    "QuickGPT – AI Chatbot Platform",
    "AcadSecure – AI Plagiarism & Collusion Detection",
  ],
  "Full-Stack": [
    "Resume Ecosystem Builder – Multi-Variant ATS Engine",
    "QuickGPT – AI Chatbot Platform",
    "CryptoStack – Real-Time Crypto Tracker",
  ],
  "AI/ML": [
    "QuickGPT – AI Chatbot Platform",
    "AcadSecure – AI Plagiarism & Collusion Detection",
    "NeuroShield – AI Cognitive Fatigue Monitor",
  ],
  "Computer Vision": [
    "Aero Defect AI – Automated Defect Inspection",
    "QuickGPT – AI Chatbot Platform",
    "SmartLogger – Python Logging & Diagnostic Library",
  ],
  "IoT+ML": [
    "Sky2Soil – Precision Agriculture Telemetry",
    "NeuroShield – AI Cognitive Fatigue Monitor",
    "SmartLogger – Python Logging & Diagnostic Library",
  ],
  "AI Content Evaluation": [
    "AcadSecure – AI Plagiarism & Collusion Detection",
    "QuickGPT – AI Chatbot Platform",
    "Aero Defect AI – Automated Defect Inspection",
  ],
  "Company Full-Stack": [
    "Resume Ecosystem Builder – Multi-Variant ATS Engine",
    "QuickGPT – AI Chatbot Platform",
    "CryptoStack – Real-Time Crypto Tracker",
  ],
};

async function resetSeededData(): Promise<void> {
  await prisma.resumeBulletOverride.deleteMany();
  await prisma.resumeProject.deleteMany();
  await prisma.resumeConfig.deleteMany();
  await prisma.projectDomain.deleteMany();
  await prisma.bullet.deleteMany();
  await prisma.project.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.education.deleteMany();
  await prisma.profile.deleteMany();
}

async function seedProfile(): Promise<void> {
  await prisma.profile.create({
    data: {
      fullName: realProfile.fullName,
      email: realProfile.email,
      phone: realProfile.phone,
      location: realProfile.location,
      websiteUrl: realProfile.websiteUrl,
      githubUrl: realProfile.githubUrl,
      linkedinUrl: realProfile.linkedinUrl,
      summary: realProfile.summary,
      languages: realProfile.languages,
      frameworks: realProfile.frameworks,
      tools: realProfile.tools,
      strengths: realProfile.strengths,
      educations: {
        create: realProfile.educations.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate,
          grade: edu.grade,
          order: edu.order,
        })),
      },
      certifications: {
        create: realProfile.certifications.map((cert) => ({
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate,
          credentialUrl: cert.credentialUrl,
          order: cert.order,
        })),
      },
    },
  });
  console.log("Seeded profile with Core Competencies & Strengths for Aman Gupta.");
}

async function seedDomains(): Promise<void> {
  for (const name of DOMAIN_NAMES) {
    const domain = await prisma.domain.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    const existingConfig = await prisma.resumeConfig.findFirst({
      where: { domainId: domain.id, isDefault: true },
    });

    if (!existingConfig) {
      await prisma.resumeConfig.create({
        data: {
          domainId: domain.id,
          variantName: "Default",
          isDefault: true,
        },
      });
    }
  }
}

async function seedProjects(projects: ProjectInput[]): Promise<void> {
  for (const rawProject of projects) {
    const project = projectSchema.parse(rawProject);
    const createdProject = await prisma.project.create({
      data: {
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        status:
          project.status === "in-progress"
            ? ProjectStatus.in_progress
            : ProjectStatus.completed,
        githubUrl: project.githubUrl || null,
        liveUrl: project.liveUrl || null,
        bullets: {
          create: project.bullets.map((bullet) => ({
            text: bullet.text,
            order: bullet.order,
          })),
        },
        domains: {
          create: project.domainNames.map((name) => ({
            domain: {
              connect: { name },
            },
          })),
        },
      },
    });

    console.log(`Seeded project: ${createdProject.title}`);
  }
}

async function configureDomainResumes(): Promise<void> {
  const domains = await prisma.domain.findMany({
    include: {
      resumeConfigs: true,
    },
  });

  const allProjects = await prisma.project.findMany();
  const projectMap = new Map<string, string>();
  allProjects.forEach((p) => projectMap.set(p.title, p.id));

  for (const domain of domains) {
    const config = domain.resumeConfigs[0];
    if (!config) continue;

    const domainName = domain.name as DomainName;
    const targetProjectTitles = DOMAIN_PROJECT_MAPPING[domainName] || [];

    for (let i = 0; i < targetProjectTitles.length; i++) {
      const title = targetProjectTitles[i];
      const projectId = projectMap.get(title);
      if (projectId) {
        await prisma.resumeProject.create({
          data: {
            resumeConfigId: config.id,
            projectId,
            included: true,
            order: i,
          },
        });
      }
    }

    console.log(
      `Configured exactly 3 top projects for domain resume: ${domain.name}`,
    );
  }
}

async function main(): Promise<void> {
  await resetSeededData();
  await seedProfile();
  await seedDomains();
  await seedProjects(realProjects);
  await configureDomainResumes();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
