// Script untuk membuat system users saja (tanpa hapus mahasiswa)
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating system users...');

    const systemUsers = [
        { email: 'superadmin@alifa.ac.id', username: 'superadmin', role: 'super_admin', label: 'Super Admin' },
        { email: 'admin@kampus.ac.id', username: 'admin', role: 'staff_akademik', label: 'Staff Akademik' },
        { email: 'finance@kampus.ac.id', username: 'finance', role: 'staff_keuangan', label: 'Staff Keuangan' },
        { email: 'dosen@kampus.ac.id', username: 'dosen', role: 'dosen', label: 'Dosen' },
        { email: 'mahasiswa@kampus.ac.id', username: 'mahasiswa', role: 'mahasiswa', label: 'Mahasiswa' },
    ];

    for (const userData of systemUsers) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (existingUser) {
                // Update role if different
                if (existingUser.role !== userData.role) {
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: { role: userData.role }
                    });
                    console.log(`  ✅ Updated role for ${userData.email} to ${userData.role}`);
                } else {
                    console.log(`  ✓ User ${userData.email} already exists with correct role`);
                }
                continue;
            }

            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: userData.email,
                    username: userData.username,
                    password_hash: hashedPassword,
                    role: userData.role,
                    is_active: true
                }
            });
            console.log(`  ✅ Created ${userData.label}: ${userData.email}`);
        } catch (error) {
            console.error(`  ❌ Error creating ${userData.email}:`, error);
        }
    }

    console.log('\nDone! System users created/updated.');
    console.log('\nLogin credentials (password: password123):');
    console.log('  Super Admin: superadmin@alifa.ac.id');
    console.log('  Staff Akademik: admin@kampus.ac.id');
    console.log('  Staff Keuangan: finance@kampus.ac.id');
    console.log('  Dosen: dosen@kampus.ac.id');
    console.log('  Mahasiswa: mahasiswa@kampus.ac.id');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
