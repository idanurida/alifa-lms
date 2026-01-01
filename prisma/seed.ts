
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    try {
        // Efficient cleanup using deleteMany
        console.log('Cleaning up old records (bulk)...');
        await prisma.studentEnrollment.deleteMany({ where: { student: { user: { role: 'mahasiswa' } } } });
        await prisma.paymentEvidence.deleteMany({ where: { student: { user: { role: 'mahasiswa' } } } });
        await prisma.invoice.deleteMany({ where: { student: { user: { role: 'mahasiswa' } } } });
        await prisma.studentDocument.deleteMany({ where: { student: { user: { role: 'mahasiswa' } } } });

        await prisma.student.deleteMany({ where: { user: { role: 'mahasiswa' } } });
        const deleteResult = await prisma.user.deleteMany({ where: { role: 'mahasiswa' } });

        console.log(`Deleted ${deleteResult.count} old student users.`);

        // 2. Read CSV Data
        const csvFiles = [
            'DATA MHS STIES 2017 sd 2025 - ES.csv',
            'DATA MHS STIES 2017 sd 2025.xlsx - MBS.csv',
            'DATA MHS STIES 2017 sd 2025.xlsx - PS.csv'
        ];

        let totalSuccess = 0;
        let totalFailed = 0;
        let totalSkipped = 0;

        // Cache study programs to avoid repeated DB calls
        const studyPrograms = new Map();

        for (const fileName of csvFiles) {
            const csvPath = path.join(process.cwd(), fileName);
            if (!fs.existsSync(csvPath)) {
                console.warn(`Warning: File not found ${csvPath}, skipping...`);
                continue;
            }

            console.log(`Processing CSV: ${fileName}...`);
            const fileContent = fs.readFileSync(csvPath, 'utf-8');
            const lines = fileContent.split('\n');

            let fileSuccess = 0;
            let fileFailed = 0;
            let fileSkipped = 0;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(',');

                // Detection logic for data lines: 
                // Must have at least 6 parts and part 1 or 2 must look like a NIM (numeric)
                if (parts.length < 5) continue;

                // Simple heuristic to skip header lines
                const nimCandidate = parts[2]?.trim() || parts[1]?.trim();
                const isNumeric = /^\d+$/.test(nimCandidate);
                if (!isNumeric) {
                    // console.log(`Skipping potential header line ${i}: ${line.substring(0, 30)}...`);
                    continue;
                }

                // Identify columns based on whether there's a leading comma
                let nim, nama, statusRaw, prodiName, jenjang;
                if (parts[0] === '') {
                    // Leading comma format: ,No,NIM,Nama,...
                    nim = parts[2]?.trim();
                    nama = parts[3]?.trim();
                    statusRaw = parts[4]?.trim();
                    prodiName = parts[5]?.trim();
                    jenjang = parts[6]?.trim();
                } else {
                    // No leading comma format: No,NIM,Nama,...
                    nim = parts[1]?.trim();
                    nama = parts[2]?.trim();
                    statusRaw = parts[3]?.trim();
                    prodiName = parts[4]?.trim();
                    jenjang = parts[5]?.trim();
                }

                if (!nim || !nama || nim.length < 5) continue;

                // Normalize Status
                let status = 'active';
                const s = statusRaw?.toLowerCase() || '';
                if (s.includes('lulus')) status = 'graduated';
                else if (s.includes('keluar')) status = 'dropped_out';
                else if (s.includes('cuti')) status = 'leave';
                else if (s.includes('non')) status = 'inactive';

                // 3. Handle Study Program
                let prodiId;
                const prodiKey = `${prodiName}-${jenjang}`;

                if (studyPrograms.has(prodiKey)) {
                    prodiId = studyPrograms.get(prodiKey);
                } else {
                    let prodi = await prisma.studyProgram.findFirst({
                        where: {
                            name: prodiName,
                            degree_level: jenjang
                        }
                    });

                    if (!prodi) {
                        prodi = await prisma.studyProgram.create({
                            data: {
                                name: prodiName || 'Unknown',
                                code: `PRODI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                degree_level: jenjang,
                                faculty: "Ekonomi Syari'ah"
                            }
                        });
                        console.log(`Created Study Program: ${prodiName} (${jenjang})`);
                    } else if (prodi.faculty !== "Ekonomi Syari'ah") {
                        await prisma.studyProgram.update({
                            where: { id: prodi.id },
                            data: { faculty: "Ekonomi Syari'ah" }
                        });
                    }
                    prodiId = prodi.id;
                    studyPrograms.set(prodiKey, prodiId);
                }

                // 4. Create User and Student
                try {
                    const email = `${nim}@student.alifa.ac.id`.toLowerCase();

                    const existingUser = await prisma.user.findUnique({ where: { email } });
                    if (existingUser) {
                        fileSkipped++;
                        continue;
                    }

                    const hashedPassword = await bcrypt.hash(nim, 10);

                    await prisma.user.create({
                        data: {
                            email: email,
                            username: nim,
                            password_hash: hashedPassword,
                            role: 'mahasiswa',
                            is_active: true,
                            student: {
                                create: {
                                    name: nama,
                                    nim: nim,
                                    status: status,
                                    year_entry: parseInt(`20${nim.substring(0, 2)}`) || new Date().getFullYear(),
                                    current_semester: 1, // Defaulting to 1 as requested/implied
                                    total_credits: 0,
                                    study_program_num_id: prodiId
                                }
                            }
                        }
                    });
                    fileSuccess++;
                } catch (error: any) {
                    if (error.code === 'P2002') {
                        fileSkipped++;
                    } else {
                        console.error(`Failed to process ${nama} (${nim}):`, error.message);
                        fileFailed++;
                    }
                }
            }
            console.log(`Finished ${fileName}: ${fileSuccess} success, ${fileFailed} failed, ${fileSkipped} skipped.`);
            totalSuccess += fileSuccess;
            totalFailed += fileFailed;
            totalSkipped += fileSkipped;
        }

        console.log(`Seeding finished. Total Success: ${totalSuccess}, Total Failed: ${totalFailed}, Total Skipped: ${totalSkipped}`);

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
