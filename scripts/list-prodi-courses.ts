
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const prodis = await prisma.studyProgram.findMany({
        orderBy: { name: 'asc' },
        include: {
            curricula: {
                where: { is_active: true }, // Asumsi user ingin melihat yang aktif atau relevan
                include: {
                    courses: {
                        orderBy: { semester: 'asc' }
                    }
                }
            }
        }
    });

    console.log('\n========= DAFTAR PROGRAM STUDI DAN MATA KULIAH =========\n');

    if (prodis.length === 0) {
        console.log('Belum ada data Program Studi.');
        return;
    }

    for (const prodi of prodis) {
        console.log(`📘 PRODI: ${prodi.name} (${prodi.code})`);

        if (prodi.curricula.length === 0) {
            console.log('   ⚠️ Belum ada kurikulum aktif.');
            console.log('------------------------------------------------------------\n');
            continue;
        }

        for (const cur of prodi.curricula) {
            console.log(`   📂 Kurikulum: ${cur.name} | Total Credit: ${cur.total_credits} SKS`);

            if (cur.courses.length === 0) {
                console.log('      (Tidak ada mata kuliah)');
            } else {
                // Simple manual table format for clarity in raw output
                console.log(`      --------------------------------------------------------`);
                console.log(`      | ${'Kode'.padEnd(10)} | ${'Mata Kuliah'.padEnd(30)} | SKS | Sem |`);
                console.log(`      --------------------------------------------------------`);

                for (const c of cur.courses) {
                    console.log(`      | ${c.code.padEnd(10)} | ${c.name.padEnd(30)} |  ${c.credits}  |  ${c.semester || '?'}  |`);
                }
                console.log(`      --------------------------------------------------------`);
            }
        }
        console.log('\n');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
