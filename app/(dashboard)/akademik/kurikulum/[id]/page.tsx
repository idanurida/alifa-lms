// app/(dashboard)/akademik/kurikulum/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function DetailKurikulumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  let kurikulum;
  try {
    const [result] = await sql`
      SELECT 
        c.id, c.name, c.code, c.is_active, c.created_at, c.total_credits,
        sp.name as study_program_name, sp.code as study_program_code, sp.faculty
      FROM curricula c
      JOIN study_programs sp ON c.study_program_id = sp.id
      WHERE c.id = ${id}
    `;
    kurikulum = result;
    if (!kurikulum) notFound();
  } catch (error) {
    console.error('Failed to fetch kurikulum:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Manajemen Kurikulum</p>
          <p className="text-muted-foreground text-sm">
            Detail kurikulum: {kurikulum.name}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/akademik/kurikulum/${id}/edit`}>
            <Pencil size={16} className="mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Detail Kurikulum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-medium">{kurikulum.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kode</p>
              <p className="font-mono font-medium">{kurikulum.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Program Studi</p>
              <p>{kurikulum.study_program_name} ({kurikulum.study_program_code})</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fakultas</p>
              <p>{kurikulum.faculty}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total SKS</p>
              <p className="font-medium">{kurikulum.total_credits || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={kurikulum.is_active ? 'default' : 'secondary'}>
                {kurikulum.is_active ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contoh: Tabel Mata Kuliah di Kurikulum ini */}
      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={18} />
            Mata Kuliah dalam Kurikulum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Daftar mata kuliah akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
