export const dynamic = 'force-dynamic'

// app/api/akademik/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Contoh: Kembalikan ringkasan data akademik untuk dashboard
    // Ini bisa diisi dengan query ke berbagai tabel tergantung role
    const role = session.user.role;

    let summaryData = {};

    if (role === 'mahasiswa') {
      // Ambil data ringkasan untuk mahasiswa
      // Contoh: jumlah kelas aktif, IPK, dll
      summaryData = {
        enrolled_classes: 5,
        current_gpa: 3.25,
        upcoming_deadlines: 2,
      };
    } else if (role === 'dosen') {
      // Ambil data ringkasan untuk dosen
      // Contoh: jumlah kelas yang diajar, jumlah nilai yang belum diinput, dll
      summaryData = {
        teaching_classes: 3,
        pending_grades: 12,
        pending_attendance: 5,
      };
    } else {
      // Untuk staff_akademik dan super_admin
      summaryData = {
        total_students: 1200,
        total_lecturers: 80,
        active_classes: 150,
        pending_verifications: 5,
      };
    }

    return NextResponse.json({ summary: summaryData });
  } catch (error) {
    console.error('GET Akademik Root Error:', error);
    return NextResponse.json({ error: 'Failed to fetch akademik summary' }, { status: 500 });
  }
}
