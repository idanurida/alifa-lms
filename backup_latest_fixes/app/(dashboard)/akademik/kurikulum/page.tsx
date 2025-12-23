// app/(dashboard)/akademik/kurikulum/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import KurikulumTable from '@/components/akademik/KurikulumTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function KurikulumPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data: any[] = [];
  try {
    const result = await sql`
      SELECT 
        c.id, c.name, c.code, c.is_active, c.created_at,
        sp.id as study_program_id, sp.name as study_program_name, sp.code as study_program_code
      FROM curricula c
      JOIN study_programs sp ON c.study_program_id = sp.id
      ORDER BY c.created_at DESC
    `;
    data = result;
  } catch (error) {
    console.error('Failed to fetch curricula:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Manajemen Kurikulum</p>
          <p className="text-muted-foreground text-sm">
            Kelola kurikulum berdasarkan program studi.
          </p>
        </div>
        <Button asChild>
          <Link href="/akademik/kurikulum/tambah">
            <Plus size={16} />
            Tambah Kurikulum
          </Link>
        </Button>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Daftar Kurikulum</CardTitle>
        </CardHeader>
        <CardContent>
          <KurikulumTable data={data as any} />
        </CardContent>
      </Card>
    </div>
  );
}
