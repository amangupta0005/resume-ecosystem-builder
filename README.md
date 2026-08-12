# Resume Ecosystem Builder

A dynamic, domain-specific resume builder and content management system built with Next.js, Prisma, and Tailwind CSS. 

This tool allows you to maintain a single repository of projects, skills, and profile information, and dynamically assemble targeted, ATS-optimized `.docx` resumes for different professional domains (e.g., AI/ML, Full-Stack, Computer Vision).

## Features

- **Centralized Data Management:** Store your projects, bullet points, and core profile metadata in a PostgreSQL database via Prisma.
- **Domain Targeting:** Tag projects to specific domains and conditionally include/exclude them based on the target role.
- **Content Overrides:** Override specific project bullet points, technical skills, and professional summaries for a specific domain without duplicating the entire project data.
- **ATS-Optimized Export:** Instantly generate clean, ATS-compliant `.docx` resumes utilizing the `docx` library.
- **Live Preview:** Real-time preview of the generated resume in a beautiful Next.js frontend.
- **ATS Scorecard:** Built-in analysis to evaluate bullet point length, action verb usage, and overall ATS readiness.

## Getting Started

First, install dependencies:

```bash
npm install
```

Configure your `.env` file (ignored by git to protect personal data):

```bash
DATABASE_URL="postgresql://user:password@host:port/database"
```

Sync the database schema:

```bash
npx prisma db push
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard.
