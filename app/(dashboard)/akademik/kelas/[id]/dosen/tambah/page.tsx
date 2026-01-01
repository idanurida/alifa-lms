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
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: {
          include: {
            curriculum: {
              include: {
                study_program: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      redirect('/akademik/kelas');
    }

    // Get available lecturers
    const availableLecturers = await prisma.lecturer.findMany({
      select: {
        id: true,
        name: true,
        nidn: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const handleFormSubmit = async (formData: any) => {
      'use server';

      try {
        // Create new teaching assignment
        await prisma.lecturerAssignment.create({
          data: {
            class_id: classId,
            lecturer_id: parseInt(formData.lecturerId),
            start_date: new Date(formData.startDate),
            end_date: new Date(formData.endDate),
            teaching_load: parseInt(formData.teachingLoad),
            assignment_type: 'mengajar', // Default or from form if available
            is_active: true,
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
            Kelas: {classData.class_code} - {classData.course.name} ({classData.course.curriculum?.study_program.name})
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