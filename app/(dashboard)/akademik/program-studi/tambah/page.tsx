// app/(dashboard)/akademik/program-studi/tambah/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgramStudiForm from '@/components/forms/ProgramStudiForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function TambahProgramStudiPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Program Studi</p>
        <p className="text-muted-foreground text-sm">
          Tambah program studi baru.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Tambah Program Studi Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramStudiForm />
        </CardContent>
      </Card>
    </div>
  );
}