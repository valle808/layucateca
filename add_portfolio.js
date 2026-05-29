const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const item = await prisma.portfolioItem.create({
    data: {
      title: 'WhatsApp Automation Studio',
      slug: 'whatsapp-automation-studio',
      description: 'Professional WhatsApp Web automation for seamless messaging. Desktop application with a beautiful GUI built in Python to automate messaging, use presets, simulate human typing, and more.',
      imageUrl: '/whatsapp-automation.png',
      liveUrl: 'https://github.com/SohanRaidev/WhatsApp-Automation-Studio',
      price: null,
      published: true
    }
  })
  console.log('Created portfolio item:', item)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
