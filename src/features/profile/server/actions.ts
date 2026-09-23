"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { profileSchema, type ProfileFormState } from "@/lib/validations/profile";

export async function saveProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  try {
    const rawDataJson = formData.get("profileData") as string;
    if (!rawDataJson) {
      return {
        status: "error",
        message: "No profile data payload was provided.",
      };
    }

    const parsedJson = JSON.parse(rawDataJson);
    const parsedData = profileSchema.safeParse(parsedJson);

    if (!parsedData.success) {
      const flattened = parsedData.error.flatten();
      return {
        status: "error",
        message: "Validation failed. Please review the highlighted fields.",
        fieldErrors: flattened.fieldErrors,
      };
    }

    const data = parsedData.data;

    // Find existing profile or create new
    const existing = await prisma.profile.findFirst({
      select: { id: true },
    });

    if (existing) {
      // Transaction to update profile and synchronize educations & certifications
      await prisma.$transaction(async (tx) => {
        await tx.profile.update({
          where: { id: existing.id },
          data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            websiteUrl: data.websiteUrl,
            githubUrl: data.githubUrl,
            linkedinUrl: data.linkedinUrl,
            summary: data.summary,
            languages: data.languages,
            frameworks: data.frameworks,
            tools: data.tools,
            strengths: data.strengths,
          },
        });

        // Replace educations
        await tx.education.deleteMany({
          where: { profileId: existing.id },
        });

        if (data.educations.length > 0) {
          await tx.education.createMany({
            data: data.educations.map((edu, idx) => ({
              profileId: existing.id,
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || null,
              startDate: edu.startDate || null,
              endDate: edu.endDate || null,
              grade: edu.grade || null,
              order: idx,
            })),
          });
        }

        // Replace certifications
        await tx.certification.deleteMany({
          where: { profileId: existing.id },
        });

        if (data.certifications.length > 0) {
          await tx.certification.createMany({
            data: data.certifications.map((cert, idx) => ({
              profileId: existing.id,
              name: cert.name,
              issuer: cert.issuer,
              issueDate: cert.issueDate || null,
              credentialUrl: cert.credentialUrl || null,
              order: idx,
            })),
          });
        }
      });
    } else {
      await prisma.profile.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          location: data.location,
          websiteUrl: data.websiteUrl,
          githubUrl: data.githubUrl,
          linkedinUrl: data.linkedinUrl,
          summary: data.summary,
          languages: data.languages,
          frameworks: data.frameworks,
          tools: data.tools,
          strengths: data.strengths,
          educations: {
            create: data.educations.map((edu, idx) => ({
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || null,
              startDate: edu.startDate || null,
              endDate: edu.endDate || null,
              grade: edu.grade || null,
              order: idx,
            })),
          },
          certifications: {
            create: data.certifications.map((cert, idx) => ({
              name: cert.name,
              issuer: cert.issuer,
              issueDate: cert.issueDate || null,
              credentialUrl: cert.credentialUrl || null,
              order: idx,
            })),
          },
        },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/resumes", "layout");
    revalidatePath("/links");

    return {
      status: "success",
      message: "Profile and resume sections updated successfully!",
    };
  } catch (error) {
    console.error("Error saving profile:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while saving profile.",
    };
  }
}
