import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const domainName = "AI Content Evaluation";

  const domain = await prisma.domain.findUnique({
    where: { name: domainName },
  });

  if (!domain) {
    throw new Error(`Domain ${domainName} not found`);
  }

  const title = "AI TRAINING & CONTENT EVALUATION | AI/ML Background";
  
  const summary = "Detail-oriented AI/ML engineering student with hands-on experience building and evaluating AI systems — including AI-generated content detection, model output quality assessment, and computer-vision-based defect classification. Strong analytical skills, precise attention to detail, and clear written English, developed through technical documentation and evaluation-focused project work.";

  const skills = [
    {
      category: "Core Competencies",
      skills: "Attention to Detail, Analytical & Critical Thinking, Quality Assurance & Compliance Review, Technical Documentation, Cross-Functional Communication, Problem Solving"
    },
    {
      category: "AI/ML & Data",
      skills: "Python, NLP (RoBERTa, spaCy, NLTK), Computer Vision (YOLOv8, OpenCV, PyTorch), TF-IDF, DBSCAN, Pandas, NumPy, Matplotlib"
    },
    {
      category: "Web & Tools",
      skills: "React, Node.js, Express, MongoDB, Git, Docker"
    }
  ];

  const resumeConfig = await prisma.resumeConfig.findFirst({
    where: { domainId: domain.id },
  });

  if (!resumeConfig) {
    throw new Error(`ResumeConfig for domain ${domainName} not found`);
  }

  await prisma.resumeConfig.update({
    where: { id: resumeConfig.id },
    data: {
      title,
      summary,
      skills,
    }
  });

  console.log("Successfully updated AI Content Evaluation metadata (title, summary, skills).");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
