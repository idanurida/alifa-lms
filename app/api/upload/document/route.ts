// app/api/upload/document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'documents');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['mahasiswa', 'dosen'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const documentType = formData.get('document_type') as string;
    const file = formData.get('document_file') as File;
    const expirationDate = formData.get('expiration_date') as string | null;

    if (!documentType || !file) {
      return NextResponse.json({ error: 'Document type and file are required' }, { status: 400 });
    }

    // Validasi file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported. Please upload JPG, PNG, or PDF.' }, { status: 400 });
    }

    // Validasi ukuran file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 5 MB' }, { status: 400 });
    }

    // Dapatkan identity ID
    let identityId: number | null = null;
    if (session.user.role === 'mahasiswa') {
      const [student] = await sql`SELECT id FROM students WHERE user_id = ${session.user.id}`;
      identityId = student?.id ?? null;
    } else if (session.user.role === 'dosen') {
      const [lecturer] = await sql`SELECT id FROM lecturers WHERE user_id = ${session.user.id}`;
      identityId = lecturer?.id ?? null;
    }

    if (!identityId) {
      return NextResponse.json({ error: 'Identity not found' }, { status: 404 });
    }

    // Pastikan direktori upload ada
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Simpan file ke filesystem
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}_${identityId}_${safeFileName}`;
    const filePath = `/uploads/documents/${fileName}`;
    const fullPath = path.join(UPLOAD_DIR, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    // Simpan record ke database
    if (session.user.role === 'mahasiswa') {
      await sql`
        INSERT INTO student_documents (student_id, document_type, file_path, file_name, file_size, status)
        VALUES (${identityId}, ${documentType}, ${filePath}, ${fileName}, ${file.size}, 'pending')
      `;
    } else if (session.user.role === 'dosen') {
      await sql`
        INSERT INTO lecturer_documents (lecturer_id, document_type, file_path, file_name, status, expiration_date)
        VALUES (${identityId}, ${documentType}, ${filePath}, ${fileName}, 'pending', ${expirationDate || null})
      `;
    }

    return NextResponse.json({ 
      message: 'Document uploaded successfully',
      fileName,
      filePath,
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}