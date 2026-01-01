import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import KelasForm from '@/components/forms/KelasForm';
import { DashboardHeading } from '@/components/dashboard/DashboardComponents';

/**
 * Halaman Server Component untuk menambah data Kelas baru.
 */
export default async function TambahKelasPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Harap login kembali.</div>;
  }

  // Fetch data secara paralel untuk dropdown
  const [courses, lecturers, academicPeriods] = await Promise.all([
    prisma.course.findMany({
      where: { is_active: true },
      orderBy: { code: 'asc' },
    }),
    prisma.lecturer.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.academicPeriod.findMany({
      orderBy: [
        { year: 'desc' },
        { semester: 'desc' },
      ],
    }),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeading
        title="Tambah Kelas Baru"
        subtitle="Buka kelas baru untuk mata kuliah pada periode akademik tertentu."
        badge="Akademik"
      />

      <div className="max-w-4xl mx-auto">
        <KelasForm
          courses={courses as any}
          lecturers={lecturers as any}
          academicPeriods={academicPeriods as any}
        />
      </div>
    </div>
  );
}