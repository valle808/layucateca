import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const posts = await prisma.post.findMany({ take: 1 });
    console.log("Success! Posts found:", posts.length);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
