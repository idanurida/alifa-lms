import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const role = session.user.role;
  
  const redirectPaths = {
    mahasiswa: '/mahasiswa/dashboard',
    dosen: '/dosen/dashboard',
    staff_akademik: '/akademik',
    staff_keuangan: '/keuangan',
    super_admin: '/super-admin/dashboard'
  };

  const redirectPath = redirectPaths[role as keyof typeof redirectPaths] || '/login';
  redirect(redirectPath);
}