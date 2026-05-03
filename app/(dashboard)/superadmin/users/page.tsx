// app/(dashboard)/superadmin/users/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap, UserCheck, UserX, ShieldCheck } from 'lucide-react';

export default async function SuperAdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_admin') redirect('/login');

  let users: any[] = [];
  let students: any[] = [];
  let lecturers: any[] = [];

  try {
    users = await sql`
      SELECT id, email, username, role, is_active, last_login, created_at
      FROM users ORDER BY role, username
    `;

    students = await sql`
      SELECT s.id, s.nim, s.name, s.email, s.status, s.year_entry, s.user_id,
             sp.name as prodi_name
      FROM students s
      LEFT JOIN study_programs sp ON s.study_program_num_id = sp.id
      ORDER BY s.nim
    `;

    lecturers = await sql`
      SELECT l.id, l.nidn, l.name, l.email, l.status, l.user_id, l.expertise,
             sp.name as prodi_name
      FROM lecturers l
      LEFT JOIN study_programs sp ON l.study_program_id = sp.id
      ORDER BY l.nidn
    `;
  } catch {}

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    staff_akademik: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    staff_keuangan: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    dosen: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    mahasiswa: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    graduated: 'bg-blue-100 text-blue-700',
    dropout: 'bg-red-100 text-red-700',
    leave: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground text-sm">Semua akun, mahasiswa, dan dosen dalam sistem.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary opacity-50" />
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Akun Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-emerald-500 opacity-50" />
            <div>
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-xs text-muted-foreground">Mahasiswa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-blue-500 opacity-50" />
            <div>
              <p className="text-2xl font-bold">{students.filter((s: any) => s.user_id).length}</p>
              <p className="text-xs text-muted-foreground">Sudah Aktivasi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserX className="h-8 w-8 text-orange-500 opacity-50" />
            <div>
              <p className="text-2xl font-bold">{students.filter((s: any) => !s.user_id).length}</p>
              <p className="text-xs text-muted-foreground">Belum Aktivasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">👤 Akun ({users.length})</TabsTrigger>
          <TabsTrigger value="students">🎓 Mahasiswa ({students.length})</TabsTrigger>
          <TabsTrigger value="lecturers">👨‍🏫 Dosen ({lecturers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Akun Pengguna</CardTitle></CardHeader>
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
                  {users.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[u.role] || ''} variant="outline">{u.role.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? 'default' : 'secondary'}>{u.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.last_login ? new Date(u.last_login).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader><CardTitle>Data Mahasiswa</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                🟢 Sudah aktivasi = sudah punya akun login | 🟠 Belum aktivasi = harus daftar lewat <code className="bg-muted px-1 rounded">/auth/register</code>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIM</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Prodi</TableHead>
                    <TableHead>Angkatan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akun</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.slice(0, 200).map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.nim}</TableCell>
                      <TableCell className="font-medium">{s.name || '-'}</TableCell>
                      <TableCell className="text-sm">{s.prodi_name || '-'}</TableCell>
                      <TableCell>{s.year_entry}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[s.status] || ''} variant="outline">{s.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {s.user_id ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">Aktivasi</Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">Belum</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {students.length > 200 && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Menampilkan 200 dari {students.length} mahasiswa.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lecturers">
          <Card>
            <CardHeader><CardTitle>Data Dosen</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIDN</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Keahlian</TableHead>
                    <TableHead>Prodi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akun</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lecturers.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-sm">{l.nidn}</TableCell>
                      <TableCell className="font-medium">{l.name || '-'}</TableCell>
                      <TableCell className="text-sm">{l.expertise || '-'}</TableCell>
                      <TableCell className="text-sm">{l.prodi_name || '-'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[l.status] || ''} variant="outline">{l.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {l.user_id ? (
                          <Badge variant="default" className="bg-green-100 text-green-700">Aktivasi</Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">Belum</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
