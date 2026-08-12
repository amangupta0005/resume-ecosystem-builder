import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  
  const acadSecure = projects.find(p => p.title.includes("AcadSecure"));
  if (acadSecure) {
    await prisma.project.update({
      where: { id: acadSecure.id },
      data: { githubUrl: "https://github.com/aman-coder-005/acadSecure" }
    });
    console.log("Updated AcadSecure GitHub URL");
  }

  const aeroDefect = projects.find(p => p.title.includes("Aero Defect"));
  if (aeroDefect) {
    await prisma.project.update({
      where: { id: aeroDefect.id },
      data: { githubUrl: "https://github.com/aman-coder-005/flight-disaster-aeronautics" }
    });
    console.log("Updated Aero Defect AI GitHub URL");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
