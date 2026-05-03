// app/(dashboard)/redirect/page.tsx
// Server-side redirect based on session role
// Redirect dari login ke dashboard yang sesuai
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const ROLE_HOME: Record<string, string> = {
  super_admin: '/superadmin',
  staff_akademik: '/akademik',
  staff_keuangan: '/keuangan',
  dosen: '/dosen/dashboard',
  mahasiswa: '/mahasiswa/dashboard',
};

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role) {
    redirect('/login');
  }

  const home = ROLE_HOME[session.user.role] || '/akademik';
  redirect(home);
}
