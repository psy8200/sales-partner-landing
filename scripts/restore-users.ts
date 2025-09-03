import { PrismaClient, Role } from '@prisma/client';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

function getLatestBackup(): string | null {
	const backupDir = join(process.cwd(), 'backups');
	try {
		const files = readdirSync(backupDir)
			.filter((f) => f.startsWith('users-') && f.endsWith('.json'))
			.sort();
		if (files.length === 0) return null;
		return join(backupDir, files[files.length - 1]);
	} catch {
		return null;
	}
}

async function restoreUsers() {
	console.log('♻️ Restoring users (non-destructive)...');
	const latest = getLatestBackup();
	if (!latest) {
		console.error('❌ No user backup found in backups/. Run backup-users first.');
		return;
	}

	const data = JSON.parse(readFileSync(latest, 'utf-8')) as { users: any[] };
	const users = data.users || [];
	console.log(`📦 Loaded ${users.length} users from backup.`);

	try {
		await prisma.$connect();
		for (const u of users) {
			await prisma.user.upsert({
				where: { email: u.email },
				update: {
					name: u.name,
					role: u.role as Role,
					level: u.level,
					points: u.points,
					partnerStatus: u.partnerStatus,
				},
				create: {
					name: u.name,
					email: u.email,
					password: u.password || '',
					role: u.role as Role,
					level: u.level ?? 0,
					points: u.points ?? 0,
					partnerStatus: u.partnerStatus ?? 'NONE',
				},
			});
		}
		console.log('✅ Users restored/upserted successfully (no deletions performed).');
	} catch (e) {
		console.error('❌ Restore failed:', e);
	} finally {
		await prisma.$disconnect();
	}
}

restoreUsers();









