import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.resumeConfig.updateMany({
    data: {
      isDefault: true,
      variantName: "Default"
    }
  });
  console.log("Updated all existing configs to be default variants.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
