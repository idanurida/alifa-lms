import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const role = session.user.role;
  
  switch (role) {
    case 'mahasiswa':
      redirect('/mahasiswa/dashboard');
    case 'dosen':
      redirect('/akademik/dosen/dashboard');
    case 'staff_akademik':
      redirect('/akademik/dashboard');
    case 'staff_keuangan':
      redirect('/keuangan/dashboard');
    case 'super_admin':
      redirect('/superadmin/dashboard');
    default:
      redirect('/login');
  }
}