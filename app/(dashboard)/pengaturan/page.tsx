// app/(dashboard)/pengaturan/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { User, Mail, Phone, GraduationCap, CreditCard, Settings, Shield, KeyRound } from 'lucide-react';

export default async function PengaturanDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Unauthorized</div>;
  }

  let userProfile = null;
  try {
    // Ambil data profil berdasarkan role
    if (session.user.role === 'mahasiswa') {
      const [result] = await sql`
        SELECT s.id, s.user_id, s.nim, s.name, s.email, s.phone, s.status, s.year_entry,
               c.name as curriculum_name, c.code as curriculum_code
        FROM students s
        JOIN curricula c ON s.curriculum_id = c.id
        WHERE s.user_id = ${session.user.id}
      `;
      userProfile = result;
    } else if (session.user.role === 'dosen') {
      const [result] = await sql`
        SELECT l.id, l.user_id, l.nidn, l.name, l.email, l.phone, l.expertise, l.status
        FROM lecturers l
        WHERE l.user_id = ${session.user.id}
      `;
      userProfile = result;
    } else {
      // Untuk admin/staff, ambil dari profiles
      const [result] = await sql`
        SELECT p.id, p.user_id, p.name, p.phone, p.address
        FROM profiles p
        WHERE p.user_id = ${session.user.id}
      `;
      userProfile = result;
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return <div>Failed to load profile data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Pengaturan Akun</p>
        <p className="text-muted-foreground text-sm">
          Kelola informasi profil, keamanan, dan preferensi akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} />
              Profil Saya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><User size={14} /> Nama</p>
                <p className="font-medium">{userProfile?.name || session.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail size={14} /> Email</p>
                <p>{userProfile?.email || session.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone size={14} /> Telepon</p>
                <p>{userProfile?.phone || '—'}</p>
              </div>
              {session.user.role === 'mahasiswa' && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><GraduationCap size={14} /> NIM</p>
                    <p className="font-mono font-medium">{userProfile?.nim}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><GraduationCap size={14} /> Kurikulum</p>
                    <p>{userProfile?.curriculum_name} ({userProfile?.curriculum_code})</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tahun Masuk</p>
                    <p>{userProfile?.year_entry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={userProfile?.status === 'active' ? 'default' : 'secondary'}>
                      {userProfile?.status}
                    </Badge>
                  </div>
                </>
              )}
              {session.user.role === 'dosen' && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><GraduationCap size={14} /> NIDN</p>
                    <p className="font-mono font-medium">{userProfile?.nidn}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Keahlian</p>
                    <p>{userProfile?.expertise || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={userProfile?.status === 'active' ? 'default' : 'secondary'}>
                      {userProfile?.status}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={18} />
              Pengaturan Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/pengaturan/profil" className="block w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Profil Saya</span>
              </div>
            </a>
            <a href="/pengaturan/keamanan" className="block w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>Keamanan Akun</span>
              </div>
            </a>
            <a href="/pengaturan/identitas" className="block w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <KeyRound size={16} />
                <span>Kelola Identitas</span>
              </div>
            </a>
            <a href="/pengaturan/preferensi" className="block w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Settings size={16} />
                <span>Preferensi</span>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}