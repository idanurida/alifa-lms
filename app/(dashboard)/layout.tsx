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
    { name: 'Manajemen Pengguna', href: '/superadmin/users', icon: Users },
    { name: 'Manajemen Akademik', href: '/akademik', icon: GraduationCap },
    { name: 'Keuangan', href: '/keuangan', icon: CreditCard },
    { name: 'Laporan', href: '/laporan', icon: BarChart3 },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
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
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
  ],
  staff_keuangan: [
    { name: 'Beranda', href: '/keuangan', icon: Home },
    { name: 'Bukti Transfer', href: '/keuangan/bukti-transfer', icon: FileText },
    { name: 'Verifikasi', href: '/keuangan/verifikasi', icon: Settings },
    { name: 'Laporan', href: '/keuangan/laporan', icon: BarChart3 },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
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
    { name: 'Chat', href: '/chat', icon: MessageSquare },
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
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Profil', href: '/pengaturan', icon: User },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    router.push('/login');
    return null;
  }

  // Pastikan session.user dan role ada
  if (!session.user || !session.user.role) {
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
      super_admin: 'Admin Utama',
      staff_akademik: 'Staf Akademik',
      staff_keuangan: 'Staf Keuangan',
      dosen: 'Dosen',
      mahasiswa: 'Mahasiswa',
    };

    const roleName = roleMap[role] || 'Pengguna';
    return `${timeGreet}, ${user.name || 'Pengguna'} • ${roleName}`;
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
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-50 border-r bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border-slate-200 dark:border-white/5 shadow-2xl transition-colors duration-300">
        <SidebarContent
          user={user}
          role={role}
          navItems={userNavigation}
          greeting={getGreeting()}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 bg-slate-50 dark:bg-[#0f172a]/50">
        <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl transition-colors duration-300">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              {!['/', '/dashboard', '/akademik', '/keuangan', '/superadmin', '/pengaturan'].includes(pathname) && (
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all font-medium"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
              )}
              <h1 className="font-bold tracking-tight hidden md:block text-slate-800 dark:text-white">
                ALIFA <span className="text-[#0ea5e9]">Institute</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ModeToggle />
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors duration-300">
                <Avatar className="h-7 w-7 border-2 border-[#0ea5e9]/20">
                  <AvatarFallback className="bg-[#0ea5e9] text-white text-[10px] font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start leading-none">
                  <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">{user.name}</span>
                  <span className="hidden md:inline text-[9px] font-bold text-[#0ea5e9] uppercase tracking-widest mt-0.5">{role.replace('_', ' ')}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Keluar"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
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

  const roleLabels: Record<string, string> = {
    super_admin: 'Admin Utama',
    staff_akademik: 'Staf Akademik',
    staff_keuangan: 'Staf Keuangan',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-[#0ea5e9]/5">
            <GraduationCap className="text-[#0ea5e9]" size={22} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tighter leading-none text-slate-900 dark:text-white transition-colors duration-300">ALIFA</span>
            <span className="text-[10px] font-bold text-[#0ea5e9] tracking-[0.2em] uppercase mt-1">LMS Portal</span>
          </div>
        </Link>

        <div className="space-y-1 px-1">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors duration-300">{greeting.split(',')[0]}</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[180px] transition-colors duration-300">{user.name}</p>
          <div className="pt-2">
            <Badge className="bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#0ea5e9] border-[#0ea5e9]/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5">
              {roleLabels[role] || role}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
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
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 group",
                isActive
                  ? "bg-[#0ea5e9] text-white font-bold shadow-lg shadow-[#0ea5e9]/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-[#0ea5e9] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
              )}
            >
              <Icon size={18} className={cn(
                "transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-[#0ea5e9]"
              )} />
              <span className="tracking-tight">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-colors duration-300">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Institusi</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors duration-300">ALIFA Institute</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 transition-colors">© 2025</span>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase">Sistem Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}