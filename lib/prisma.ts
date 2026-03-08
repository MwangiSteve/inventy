import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Singleton pattern to ensure a single instance of Prisma Client
let instance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
    if (!instance) {
        instance = prisma;
    }
    return instance;
};

// Optionally handle cleanup on process exit
process.on('exit', async () => {
    await instance?.$disconnect();
});
