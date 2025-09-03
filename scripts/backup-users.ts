import { PrismaClient } from '@prisma/client';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function backupUsers() {
	console.log('🔐 Backing up users...');
	try {
		await prisma.$connect();

		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'asc' }
		});

		const backupDir = join(process.cwd(), 'backups');
		mkdirSync(backupDir, { recursive: true });
		const timestamp = new Date()
			.toISOString()
			.replace(/[:.]/g, '-');
		const filePath = join(backupDir, `users-${timestamp}.json`);
		writeFileSync(filePath, JSON.stringify({ users }, null, 2), 'utf-8');

		console.log(`✅ Users backup saved: ${filePath}`);
	} catch (error) {
		console.error('❌ Users backup failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

backupUsers();









