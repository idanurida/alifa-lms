// app/(dashboard)/page.tsx - REDIRECT
export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const role = session.user.role;
  
  switch (role) {
    case 'mahasiswa':
      redirect('/mahasiswa/dashboard'); // ← PATH YANG SAMA
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