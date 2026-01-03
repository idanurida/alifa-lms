
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FILES = [
    {
        path: 'DATA MHS STIES 2017 sd 2025(2)(1) - ES.csv',
        defaultProdi_Name: "Ekonomi Syari'ah",
        defaultProdi_Code: 'ES'
    },
    {
        path: 'DATA MHS STIES 2017 sd 2025(2)(1) - MBS.csv',
        defaultProdi_Name: "Manajemen Bisnis Syari'ah",
        defaultProdi_Code: 'MBS'
    },
    {
        path: 'DATA MHS STIES 2017 sd 2025(2)(1) - PS.csv',
        defaultProdi_Name: "Perbankan Syari'ah",
        defaultProdi_Code: 'PS'
    }
];

// Helper to determine entry year from NIM
function getYearFromNim(nim: string): number {
    // Common patterns:
    // 25... -> 2025
    // 18... -> 2018
    // 101019... -> 2019 (Assumption based on pattern)
    // 2220... -> 2022

    const cleanNim = nim.trim();

    // Special case for 101019...
    if (cleanNim.startsWith('101019')) {
        return 2019;
    }

    // Standard case: First 2 digits are year
    // Valid years 2017-2025 implies prefixes 17, 18, 19, 20, 21, 22, 23, 24, 25
    const prefix = cleanNim.substring(0, 2);
    const year = parseInt(`20${prefix}`);

    if (year >= 2010 && year <= 2030) {
        return year;
    }

    // Fallback if unsure, maybe use current year or parse differently
    // Example: 2220600027 -> 2022
    return year;
}

// Normalize Status
function normalizeStatus(statusRaw: string): string {
    if (!statusRaw) return 'active';
    const s = statusRaw.toLowerCase().trim();
    if (s === 'aktif') return 'active';
    if (s === 'lulus') return 'graduated';
    if (s === 'cuti') return 'leave';
    if (s === 'dikeluarkan' || s === 'drop out') return 'dropped_out';
    if (s === 'mutasi') return 'transferred';
    if (s === 'mengajukan pengunduran diri') return 'resigned';
    return 'inactive'; // Default fallback
}

// Normalize Name (Title Case)
function normalizeName(name: string): string {
    if (!name) return '';
    // Fix quotes
    name = name.replace(/"/g, '');
    // Simple Title Case
    return name.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

async function main() {
    console.log('🚀 Starting Student Data Import...');

    for (const fileInfo of FILES) {
        const filePath = path.join(process.cwd(), fileInfo.path);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${filePath}, skipping...`);
            continue;
        }

        console.log(`Processing ${fileInfo.path}...`);

        // Create/Ensure Study Program exists
        const prodi = await prisma.studyProgram.upsert({
            where: { code: fileInfo.defaultProdi_Code },
            update: {},
            create: {
                name: fileInfo.defaultProdi_Name,
                code: fileInfo.defaultProdi_Code,
                faculty: 'Fakultas Ekonomi dan Bisnis Islam', // Default generic
                degree_level: 'S1',
                is_active: true
            }
        });

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        // Skip empty lines and non-data lines.
        // Data starts around line 5 in the generic format. 
        // Header is usually line 4.

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV split (handling standard csv structure)
            // Note: The file has leading commas ",No,NIM..."
            const cols = line.split(',');

            // Structure based on view_file:
            // Col 0: Empty
            // Col 1: No
            // Col 2: NIM
            // Col 3: Name
            // Col 4: Status
            // Col 5: Prodi
            // Col 6: Jenjang

            // Validation: Col 2 must look like a NIM
            const nimRaw = cols[2];

            if (!nimRaw || nimRaw.toLowerCase() === 'nim' || nimRaw.length < 5) {
                continue; // Header or invalid
            }

            const nim = nimRaw.trim();
            const nameRaw = cols[3];
            const statusRaw = cols[4];
            // const prodiRaw = cols[5]; // We use the file-level prodi mostly, but can check

            const name = normalizeName(nameRaw);
            const status = normalizeStatus(statusRaw);
            const yearEntry = getYearFromNim(nim);

            try {
                await prisma.student.upsert({
                    where: { nim: nim },
                    update: {
                        name: name,
                        status: status,
                        study_program_num_id: prodi.id,
                        year_entry: yearEntry
                    },
                    create: {
                        nim: nim,
                        name: name,
                        status: status,
                        study_program_num_id: prodi.id,
                        year_entry: yearEntry,
                        // Default values
                        current_semester: 1,
                        total_credits: 0
                    }
                });
                successCount++;
            } catch (err) {
                console.error(`❌ Failed import for NIM ${nim}:`, err);
                failCount++;
            }
        }
        console.log(`✅ Finished ${fileInfo.path}: ${successCount} imported/updated, ${failCount} failed.`);
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
