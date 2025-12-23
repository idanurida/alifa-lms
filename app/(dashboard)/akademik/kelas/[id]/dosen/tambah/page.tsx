import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TambahPenugasanForm from './TambahPenugasanForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma'; // Pastikan path ke prisma client singleton Anda benar

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TambahPenugasanDosenPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Verify user has access to this class
  const classId = parseInt(idParam);

  try {
    // Perbaikan Final: Menggunakan camelCase 'kelas' (Sesuai saran Error)
    const kelas = await prisma.kelas.findUnique({
      where: { id: classId },
      include: {
        programStudi: true, // Asumsi model ini juga 'programStudi' (camelCase)
      },
    });

    if (!kelas) {
      redirect('/akademik/kelas');
    }

    // Get available lecturers
    // Perbaikan Final: Menggunakan camelCase 'dosen'
    const availableLecturers = await prisma.dosen.findMany({
      select: {
        id: true,
        nama: true,
        nip: true,
      },
      orderBy: {
        nama: 'asc',
      },
    });

    // Get available classes for reference
    // Perbaikan Final: Menggunakan camelCase 'kelas'
    const availableClasses = await prisma.kelas.findMany({
      where: {
        programStudiId: kelas.programStudiId,
      },
      select: {
        id: true,
        nama: true,
        programStudi: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    const handleFormSubmit = async (formData: any) => {
      'use server';

      try {
        // Create new teaching assignment
        // Perbaikan Final: Menggunakan camelCase 'penugasanDosen'
        await prisma.penugasanDosen.create({
          data: {
            kelasId: classId,
            dosenId: parseInt(formData.lecturerId),
            tanggalMulai: new Date(formData.startDate),
            tanggalSelesai: new Date(formData.endDate),
            bebanMengajar: parseInt(formData.teachingLoad),
            status: 'active',
          },
        });

        redirect(`/akademik/kelas/${classId}/dosen`);
      } catch (error) {
        console.error('Error creating assignment:', error);
        throw new Error('Gagal membuat penugasan');
      }
    };

    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tambah Penugasan Dosen</h1>
          <p className="text-muted-foreground">
            Kelas: {kelas.nama} - {kelas.programStudi.nama}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Penugasan Dosen</CardTitle>
          </CardHeader>
          <CardContent>
            <TambahPenugasanForm
              onSubmit={handleFormSubmit}
              onCancel={() => redirect(`/akademik/kelas/${classId}/dosen`)}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading page data:', error);
    redirect('/akademik/kelas');
  }
}