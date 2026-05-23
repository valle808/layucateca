const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  try {
    const alerts = await prisma.emergencyAlert.findMany();
    console.log("Success! Found", alerts.length, "alerts.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
