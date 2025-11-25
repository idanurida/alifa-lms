export const dynamic = 'force-dynamic'

// app/api/akademik/mata-kuliah/tersedia/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    // Ambil mata kuliah yang tersedia
    const mataKuliah = await sql`
      SELECT 
        mk.id,
        mk.kode as code,
        mk.nama as name,
        mk.sks as credits,
        mk.semester,
        mk.is_active as is_active,
        mk.kurikulum_id as curriculum_id
      FROM mata_kuliah mk
      WHERE mk.is_active = true
      ORDER BY mk.semester, mk.kode
    `;

    // Jika table mata_kuliah tidak ada, fallback ke courses
    if (!mataKuliah || mataKuliah.length === 0) {
      const coursesFallback = await sql`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.credits,
          c.semester,
          c.is_active,
          c.curriculum_id
        FROM courses c
        WHERE c.is_active = true
        ORDER BY c.semester, c.code
      `;
      return NextResponse.json({ 
        success: true, 
        data: coursesFallback 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: mataKuliah 
    });
  } catch (error) {
    console.error('Error API Mata Kuliah:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Gagal mengambil data mata kuliah' 
    }, { status: 500 });
  }
}
