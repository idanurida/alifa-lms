// app/(dashboard)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Home,
  FileText,
  MessageSquare,
  User,
  Menu,
  ChevronLeft,
  Building,
  Coins,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/layout/ModeToggle';

// Definisikan tipe untuk item navigasi
type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

type UserRole = 'super_admin' | 'staff_akademik' | 'staff_keuangan' | 'dosen' | 'mahasiswa';

// Struktur navigasi berdasarkan role
const navigationMap: Record<UserRole, NavItem[]> = {
  super_admin: [
    { name: 'Beranda', href: '/superadmin', icon: Home },
    { name: 'Manajemen Pengguna', href: '/superadmin/manajemen-pengguna', icon: Users },
    { name: 'Manajemen Akademik', href: '/akademik', icon: GraduationCap },
    { name: 'Keuangan', href: '/keuangan', icon: CreditCard },
    { name: 'Laporan', href: '/laporan', icon: BarChart3 },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ],
  staff_akademik: [
    { name: 'Beranda', href: '/akademik', icon: Home },
    { name: 'Program Studi', href: '/akademik/program-studi', icon: GraduationCap },
    { name: 'Kurikulum', href: '/akademik/kurikulum', icon: BookOpen },
    { name: 'Mata Kuliah', href: '/akademik/mata-kuliah', icon: BookOpen },
    { name: 'Kelas', href: '/akademik/kelas', icon: BookOpen },
    { name: 'Mahasiswa', href: '/akademik/mahasiswa', icon: Users },
    { name: 'Dosen', href: '/akademik/dosen', icon: GraduationCap },
    { name: 'Kalender Akademik', href: '/akademik/kalender-akademik', icon: Calendar },
    { name: 'Laporan', href: '/laporan', icon: BarChart3 },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ],
  staff_keuangan: [
    { name: 'Beranda', href: '/keuangan', icon: Home },
    { name: 'Bukti Transfer', href: '/keuangan/bukti-transfer', icon: FileText },
    { name: 'Verifikasi', href: '/keuangan/verifikasi', icon: Settings },
    { name: 'Laporan', href: '/keuangan/laporan', icon: BarChart3 },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ],
  dosen: [
    { name: 'Beranda', href: '/akademik/dosen', icon: Home },
    { name: 'Kelas Saya', href: '/akademik/dosen/kelas', icon: BookOpen },
    { name: 'Penilaian', href: '/akademik/dosen/penilaian', icon: BarChart3 },
    { name: 'Materi', href: '/akademik/dosen/materi', icon: FileText },
    { name: 'Presensi', href: '/akademik/dosen/presensi', icon: Users },
    { name: 'Kalender Akademik', href: '/akademik/kalender-akademik', icon: Calendar },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ],
  mahasiswa: [
    { name: 'Beranda', href: '/mahasiswa/dashboard', icon: Home }, // ← PERBAIKI: ke /mahasiswa/dashboard
    { name: 'KRS Saya', href: '/akademik/mahasiswa/krs', icon: BookOpen },
    { name: 'Kelas Saya', href: '/akademik/mahasiswa/kelas', icon: BookOpen },
    { name: 'Nilai Saya', href: '/akademik/mahasiswa/nilai', icon: BarChart3 },
    { name: 'Kalender Akademik', href: '/akademik/kalender-akademik', icon: Calendar },
    { name: 'Pembayaran', href: '/keuangan/bukti-transfer', icon: CreditCard },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Profil', href: '/pengaturan', icon: User },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession(); // ← PERBAIKI: tambah 'data:'
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug session
  useEffect(() => {
    console.log('=== DASHBOARD LAYOUT SESSION ===');
    console.log('Status:', status);
    console.log('Session:', session);
    console.log('User Role:', session?.user?.role);
  }, [session, status]);

  // Tampilkan loading jika session sedang dicek
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Memuat...
        </div>
      </div>
    );
  }

  // Jika tidak login, redirect ke login
  if (status === 'unauthenticated' || !session) {
    console.log('No session, redirecting to login');
    router.push('/login');
    return null;
  }

  // Pastikan session.user dan role ada
  if (!session.user || !session.user.role) {
    console.log('Session user or role missing');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div>Error: Session data incomplete</div>
      </div>
    );
  }

  const user = session.user;
  const role = user.role as UserRole;
  const userNavigation = navigationMap[role] || [];

  // Fungsi untuk membuat greeting
  const getGreeting = () => {
    const time = new Date().getHours();
    let timeGreet = 'Halo';
    if (time < 11) timeGreet = 'Selamat Pagi';
    else if (time < 15) timeGreet = 'Selamat Siang';
    else if (time < 18) timeGreet = 'Selamat Sore';
    else timeGreet = 'Selamat Malam';

    const roleMap: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      staff_akademik: 'Staff Akademik',
      staff_keuangan: 'Staff Keuangan',
      dosen: 'Dosen',
      mahasiswa: 'Mahasiswa',
    };

    const roleName = roleMap[role] || 'Pengguna';
    return `${timeGreet}, ${user.name || 'Pengguna'} (${roleName})`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="rounded-full">
            <Menu size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent 
            user={user} 
            role={role} 
            navItems={userNavigation} 
            greeting={getGreeting()} 
            setSidebarOpen={setSidebarOpen} 
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-50 md:border-r bg-card text-foreground border-border">
        <SidebarContent 
          user={user} 
          role={role} 
          navItems={userNavigation} 
          greeting={getGreeting()} 
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              {!['/', '/dashboard', '/akademik', '/keuangan', '/superadmin', '/pengaturan'].includes(pathname) && (
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-muted transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
              )}
              <h1 className="font-semibold tracking-tight hidden md:block text-foreground">
                ALIFA Institute LMS
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ModeToggle />
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-foreground">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-foreground">{user.name}</span>
              </div>
              <Badge variant="outline" className="hidden md:inline text-foreground">
                {role}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-foreground"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-foreground">{getGreeting()}</h2>
            <p className="text-sm text-muted-foreground">Selamat datang di dashboard Anda.</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

// Komponen Sidebar untuk Desktop dan Mobile
function SidebarContent({ user, role, navItems, greeting, setSidebarOpen }: { 
  user: any; 
  role: UserRole; 
  navItems: NavItem[]; 
  greeting: string; 
  setSidebarOpen?: (open: boolean) => void; 
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card text-foreground border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-supabase-green flex items-center justify-center">
            <GraduationCap className="text-white" size={16} />
          </div>
          <span className="font-medium text-foreground">ALIFA LMS</span>
        </div>
        <p className="text-xs text-muted-foreground">{greeting}</p>
        <Badge variant="outline" className="mt-1 text-foreground">{role}</Badge>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? 
            pathname === '/' : 
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-muted font-medium text-primary' : 'hover:bg-muted/50 text-foreground'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-primary' : 'text-foreground'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        © 2025 Alifa Institute
      </div>
    </div>
  );
}