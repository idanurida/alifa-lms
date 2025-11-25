import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock data untuk academic periods
const mockAcademicPeriods = [
  {
    id: 1,
    name: 'Semester Ganjil 2024/2025',
    code: '20241',
    year: 2024,
    semester: 1,
    start_date: '2024-09-02',
    end_date: '2025-01-31',
    uts_week: 8,
    uas_week: 16,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Semester Genap 2023/2024',
    code: '20232',
    year: 2023,
    semester: 2,
    start_date: '2024-02-05',
    end_date: '2024-06-28',
    uts_week: 8,
    uas_week: 16,
    is_active: false,
    created_at: '2023-12-01T00:00:00Z'
  }
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('is_active');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    let filteredData = mockAcademicPeriods;

    if (isActive !== null) {
      const active = isActive === 'true';
      filteredData = filteredData.filter(period => period.is_active === active);
    }

    if (year) {
      const yearNum = parseInt(year);
      filteredData = filteredData.filter(period => period.year === yearNum);
    }

    if (semester) {
      const semesterNum = parseInt(semester);
      filteredData = filteredData.filter(period => period.semester === semesterNum);
    }

    filteredData = filteredData.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.semester !== b.semester) return b.semester - a.semester;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({ data: filteredData });
  } catch (error) {
    console.error('GET Academic Periods Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data periode akademik' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    
    // Validasi sederhana
    if (!body.name || !body.code || !body.year || !body.semester || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (new Date(body.start_date) >= new Date(body.end_date)) {
      return NextResponse.json({ error: 'Tanggal mulai harus sebelum tanggal selesai' }, { status: 400 });
    }

    // Cek apakah code sudah ada
    const existing = mockAcademicPeriods.find(period => period.code === body.code);
    if (existing) {
      return NextResponse.json({ error: 'Kode periode akademik sudah digunakan' }, { status: 400 });
    }

    const newPeriod = {
      id: Math.max(...mockAcademicPeriods.map(p => p.id)) + 1,
      name: body.name,
      code: body.code,
      year: parseInt(body.year),
      semester: parseInt(body.semester),
      start_date: body.start_date,
      end_date: body.end_date,
      uts_week: body.uts_week || 8,
      uas_week: body.uas_week || 16,
      is_active: body.is_active || false,
      created_at: new Date().toISOString()
    };

    // Dalam implementasi nyata, ini akan menyimpan ke database
    // mockAcademicPeriods.push(newPeriod);

    return NextResponse.json({ 
      success: true, 
      data: newPeriod,
      message: 'Periode akademik berhasil ditambahkan'
    });
  } catch (error) {
    console.error('POST Academic Period Error:', error);
    return NextResponse.json({ error: 'Gagal menambah periode akademik' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID periode akademik tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    const periodId = parseInt(id);

    // Cari periode yang akan diupdate
    const periodIndex = mockAcademicPeriods.findIndex(period => period.id === periodId);
    if (periodIndex === -1) {
      return NextResponse.json({ error: 'Periode akademik tidak ditemukan' }, { status: 404 });
    }

    // Validasi code unik
    if (body.code) {
      const existing = mockAcademicPeriods.find(period => period.code === body.code && period.id !== periodId);
      if (existing) {
        return NextResponse.json({ error: 'Kode periode akademik sudah digunakan' }, { status: 400 });
      }
    }

    // Update data
    const updatedPeriod = {
      ...mockAcademicPeriods[periodIndex],
      ...body,
      id: periodId // Pastikan ID tidak berubah
    };

    // Dalam implementasi nyata, ini akan update ke database
    // mockAcademicPeriods[periodIndex] = updatedPeriod;

    return NextResponse.json({ 
      success: true, 
      data: updatedPeriod,
      message: 'Periode akademik berhasil diperbarui'
    });
  } catch (error) {
    console.error('PUT Academic Period Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui periode akademik' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID periode akademik tidak ditemukan' }, { status: 400 });
    }

    const periodId = parseInt(id);
    const periodIndex = mockAcademicPeriods.findIndex(period => period.id === periodId);

    if (periodIndex === -1) {
      return NextResponse.json({ error: 'Periode akademik tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah periode aktif
    if (mockAcademicPeriods[periodIndex].is_active) {
      return NextResponse.json({ error: 'Tidak dapat menghapus periode akademik yang sedang aktif' }, { status: 400 });
    }

    // Dalam implementasi nyata, ini akan menghapus dari database
    // mockAcademicPeriods.splice(periodIndex, 1);

    return NextResponse.json({ 
      success: true,
      message: 'Periode akademik berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Academic Period Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus periode akademik' }, { status: 500 });
  }
}