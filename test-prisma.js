const { PrismaClient } = require('@prisma/client'); try { new PrismaClient(); console.log('success'); } catch(e) { console.error(e.message); }
