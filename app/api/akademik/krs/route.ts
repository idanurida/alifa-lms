// app/api/akademik/krs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    // Dapatkan ID mahasiswa
    const hasilMahasiswa = await sql`
      SELECT id FROM mahasiswa WHERE user_id = ${session.user.id}
    `;
    
    if (!hasilMahasiswa || hasilMahasiswa.length === 0) {
      return NextResponse.json({ error: 'Profil mahasiswa tidak ditemukan' }, { status: 404 });
    }

    const mahasiswaId = hasilMahasiswa[0].id;

    // Ambil riwayat KRS
    const riwayatKRS = await sql`
      SELECT * FROM krs_submissions 
      WHERE mahasiswa_id = ${mahasiswaId}
      ORDER BY submitted_at DESC
    `;

    return NextResponse.json({ 
      success: true, 
      data: riwayatKRS 
    });
  } catch (error) {
    console.error('Error API KRS:', error);
    return NextResponse.json({ 
      error: 'Terjadi kesalahan server' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    const body = await request.json();
    const { semester, mata_kuliah } = body; // Ganti 'courses' menjadi 'mata_kuliah'

    // Dapatkan ID mahasiswa
    const hasilMahasiswa = await sql`
      SELECT id FROM mahasiswa WHERE user_id = ${session.user.id}
    `;
    
    if (!hasilMahasiswa || hasilMahasiswa.length === 0) {
      return NextResponse.json({ error: 'Profil mahasiswa tidak ditemukan' }, { status: 404 });
    }

    const mahasiswaId = hasilMahasiswa[0].id;
    const totalSKS = mata_kuliah.reduce((jumlah: number, mk: any) => jumlah + mk.sks, 0);

    // Cek apakah sudah ada pengajuan untuk semester ini
    const existingSubmission = await sql`
      SELECT id FROM krs_submissions 
      WHERE mahasiswa_id = ${mahasiswaId} AND semester = ${semester} AND status = 'pending'
    `;

    if (existingSubmission && existingSubmission.length > 0) {
      return NextResponse.json({ 
        error: 'Anda sudah memiliki pengajuan KRS yang sedang menunggu persetujuan untuk semester ini' 
      }, { status: 400 });
    }

    // Insert pengajuan KRS
    const hasil = await sql`
      INSERT INTO krs_submissions 
        (mahasiswa_id, semester, courses, total_credits, status)
      VALUES 
        (${mahasiswaId}, ${semester}, ${JSON.stringify(mata_kuliah)}, ${totalSKS}, 'pending')
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      data: hasil[0],
      pesan: 'KRS berhasil diajukan' 
    });
  } catch (error) {
    console.error('Error Pengajuan KRS:', error);
    return NextResponse.json({ 
      error: 'Gagal mengajukan KRS' 
    }, { status: 500 });
  }
}