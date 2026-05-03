// app/(dashboard)/superadmin/users/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, ShieldCheck, Lock } from 'lucide-react';

export default async function SuperAdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_admin') {
    redirect('/login');
  }

  let users: any[] = [];
  try {
    users = await sql`
      SELECT id, email, username, role, is_active, last_login, created_at
      FROM users
      ORDER BY created_at DESC
    `;
  } catch {
    // fallback
  }

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    staff_akademik: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    staff_keuangan: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    dosen: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    mahasiswa: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground text-sm">Kontrol akses dan identitas seluruh pengguna sistem</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Pengguna ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terakhir Login</TableHead>
                <TableHead>Terdaftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role] || ''} variant="outline">
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
