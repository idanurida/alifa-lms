// app/(dashboard)/akademik/skala-nilai/[kurikulumId]/tambah/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import TambahSkalaNilaiForm from '@/components/akademik/TambahSkalaNilaiForm';

export default async function TambahSkalaNilaiPage({
  params
}: {
  params: Promise<{ kurikulumId: string }>
}) {
  const { kurikulumId: kurikulumIdParam } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Unauthorized</h2>
          <p className="text-muted-foreground mt-2">
            Anda tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </div>
    );
  }

  const kurikulumId = parseInt(kurikulumIdParam);
  if (isNaN(kurikulumId)) notFound();

  let kurikulum;
  try {
    const [result] = await sql`
      SELECT id, name, code FROM curricula WHERE id = ${kurikulumId}
    `;
    kurikulum = result;
    if (!kurikulum) notFound();
  } catch (error) {
    console.error('Failed to fetch curriculum:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href={`/akademik/skala-nilai/${kurikulumId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Tambah Skala Nilai</h1>
          <p className="text-muted-foreground">
            Tambah skala penilaian untuk kurikulum {kurikulum.name}
          </p>
        </div>
      </div>

      <TambahSkalaNilaiForm
        kurikulumId={kurikulumId}
        kurikulumName={kurikulum.name}
      />
    </div>
  );
}