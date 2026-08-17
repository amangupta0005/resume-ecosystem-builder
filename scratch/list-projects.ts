import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.project.findMany();
  console.log(projects.map(p => ({ id: p.id, title: p.title })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
