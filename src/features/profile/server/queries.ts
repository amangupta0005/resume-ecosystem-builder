import { prisma } from "@/lib/db";

export type ProfileData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  websiteUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  summary: string;
  languages: string[];
  frameworks: string[];
  tools: string[];
  strengths: string[];
  educations: {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
    order: number;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl: string;
    order: number;
  }[];
};

export async function getProfileData(): Promise<ProfileData> {
  const profile = await prisma.profile.findFirst({
    include: {
      educations: {
        orderBy: { order: "asc" },
      },
      certifications: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (profile) {
    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      websiteUrl: profile.websiteUrl ?? "",
      githubUrl: profile.githubUrl ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
      summary: profile.summary ?? "",
      languages: profile.languages,
      frameworks: profile.frameworks,
      tools: profile.tools,
      strengths: profile.strengths ?? [],
      educations: profile.educations.map((e) => ({
        id: e.id,
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
        grade: e.grade ?? "",
        order: e.order,
      })),
      certifications: profile.certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate ?? "",
        credentialUrl: c.credentialUrl ?? "",
        order: c.order,
      })),
    };
  }

  // Create default starter profile if none exists in database
  const created = await prisma.profile.create({
    data: {
      fullName: "Alex Rivera",
      email: "alex.rivera@example.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      websiteUrl: "https://alexrivera.dev",
      githubUrl: "https://github.com/alexrivera",
      linkedinUrl: "https://linkedin.com/in/alexrivera",
      summary:
        "Results-oriented Software Engineer specializing in scalable full-stack web architectures, production machine learning pipelines, and distributed cloud systems. Proven track record architecting high-throughput microservices and deploying edge AI models.",
      languages: ["TypeScript", "Python", "Go", "SQL", "JavaScript", "C++"],
      frameworks: [
        "Next.js",
        "React",
        "FastAPI",
        "Node.js",
        "PyTorch",
        "Tailwind CSS",
        "Express",
      ],
      tools: [
        "PostgreSQL",
        "Docker",
        "Redis",
        "AWS",
        "Git",
        "Prisma",
        "Kafka",
        "Linux",
      ],
      educations: {
        create: [
          {
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science in Computer Science",
            fieldOfStudy: "Computer Science & Engineering",
            startDate: "2019",
            endDate: "2023",
            grade: "GPA 3.85 / 4.0",
            order: 0,
          },
        ],
      },
      certifications: {
        create: [
          {
            name: "AWS Certified Solutions Architect – Associate",
            issuer: "Amazon Web Services",
            issueDate: "2024",
            credentialUrl: "https://aws.amazon.com/verification",
            order: 0,
          },
          {
            name: "Deep Learning Specialization",
            issuer: "DeepLearning.AI / Coursera",
            issueDate: "2023",
            credentialUrl: "https://coursera.org/verify",
            order: 1,
          },
        ],
      },
    },
    include: {
      educations: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
    },
  });

  return {
    id: created.id,
    fullName: created.fullName,
    email: created.email,
    phone: created.phone ?? "",
    location: created.location ?? "",
    websiteUrl: created.websiteUrl ?? "",
    githubUrl: created.githubUrl ?? "",
    linkedinUrl: created.linkedinUrl ?? "",
    summary: created.summary ?? "",
    languages: created.languages,
    frameworks: created.frameworks,
    tools: created.tools,
    strengths: created.strengths ?? [],
    educations: created.educations.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      grade: e.grade ?? "",
      order: e.order,
    })),
    certifications: created.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate ?? "",
      credentialUrl: c.credentialUrl ?? "",
      order: c.order,
    })),
  };
}
