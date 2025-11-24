// app/api/upload/document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

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
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported. Please upload JPG, PNG, or PDF.' }, { status: 400 });
    }

    // Dapatkan identity ID
    let identityId = null;
    if (session.user.role === 'mahasiswa') {
      const [student] = await sql`SELECT id FROM students WHERE user_id = ${session.user.id}`;
      identityId = student?.id;
    } else if (session.user.role === 'dosen') {
      const [lecturer] = await sql`SELECT id FROM lecturers WHERE user_id = ${session.user.id}`;
      identityId = lecturer?.id;
    }

    if (!identityId) {
      return NextResponse.json({ error: 'Identity not found' }, { status: 404 });
    }

    // Simpan ke database (simulasi - file disimpan sebagai path)
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `/uploads/documents/${fileName}`;

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

    return NextResponse.json({ message: 'Document uploaded successfully' });
    
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}