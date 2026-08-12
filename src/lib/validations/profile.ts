import { z } from "zod";

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().trim().min(1, "Institution is required"),
  degree: z.string().trim().min(1, "Degree is required"),
  fieldOfStudy: z.string().trim().optional().default(""),
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
  grade: z.string().trim().optional().default(""),
  order: z.number().int().default(0),
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Certification name is required"),
  issuer: z.string().trim().min(1, "Issuer is required"),
  issueDate: z.string().trim().optional().default(""),
  credentialUrl: z.string().trim().optional().default(""),
  order: z.number().int().default(0),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  websiteUrl: z.string().trim().optional().default(""),
  githubUrl: z.string().trim().optional().default(""),
  linkedinUrl: z.string().trim().optional().default(""),
  summary: z.string().trim().optional().default(""),
  languages: z.array(z.string().trim().min(1)).default([]),
  frameworks: z.array(z.string().trim().min(1)).default([]),
  tools: z.array(z.string().trim().min(1)).default([]),
  strengths: z.array(z.string().trim().min(1)).default([]),
  educations: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
});

export type EducationInput = z.infer<typeof educationSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

export type ProfileFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};
