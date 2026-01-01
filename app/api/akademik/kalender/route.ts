import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const where: any = {};
    if (isActive !== null) where.is_active = isActive === 'true';
    if (year) where.year = parseInt(year);
    if (semester) where.semester = parseInt(semester);

    const periods = await prisma.academicPeriod.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { semester: 'desc' }
      ]
    });

    return NextResponse.json({ data: periods });
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

    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);

    if (startDate >= endDate) {
      return NextResponse.json({ error: 'Tanggal mulai harus sebelum tanggal selesai' }, { status: 400 });
    }

    // Cek apakah code sudah ada
    const existing = await prisma.academicPeriod.findUnique({
      where: { code: body.code }
    });

    if (existing) {
      return NextResponse.json({ error: 'Kode periode akademik sudah digunakan' }, { status: 400 });
    }

    const newPeriod = await prisma.academicPeriod.create({
      data: {
        name: body.name,
        code: body.code,
        year: parseInt(body.year),
        semester: parseInt(body.semester),
        start_date: startDate,
        end_date: endDate,
        uts_week: body.uts_week ? parseInt(body.uts_week) : 8,
        uas_week: body.uas_week ? parseInt(body.uas_week) : 16,
        is_active: body.is_active || false,
      }
    });

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

    // Validasi code unik jika diubah
    if (body.code) {
      const existing = await prisma.academicPeriod.findFirst({
        where: { code: body.code, NOT: { id: periodId } }
      });
      if (existing) {
        return NextResponse.json({ error: 'Kode periode akademik sudah digunakan' }, { status: 400 });
      }
    }

    // Persiapkan data update
    const updateData: any = { ...body };
    delete updateData.id;
    if (updateData.start_date) updateData.start_date = new Date(updateData.start_date);
    if (updateData.end_date) updateData.end_date = new Date(updateData.end_date);
    if (updateData.year) updateData.year = parseInt(updateData.year);
    if (updateData.semester) updateData.semester = parseInt(updateData.semester);
    if (updateData.uts_week) updateData.uts_week = parseInt(updateData.uts_week);
    if (updateData.uas_week) updateData.uas_week = parseInt(updateData.uas_week);

    const updatedPeriod = await prisma.academicPeriod.update({
      where: { id: periodId },
      data: updateData
    });

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
    const period = await prisma.academicPeriod.findUnique({
      where: { id: periodId }
    });

    if (!period) {
      return NextResponse.json({ error: 'Periode akademik tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah periode aktif
    if (period.is_active) {
      return NextResponse.json({ error: 'Tidak dapat menghapus periode akademik yang sedang aktif' }, { status: 400 });
    }

    await prisma.academicPeriod.delete({
      where: { id: periodId }
    });

    return NextResponse.json({
      success: true,
      message: 'Periode akademik berhasil dihapus'
    });
  } catch (error) {
    console.error('DELETE Academic Period Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus periode akademik' }, { status: 500 });
  }
}
