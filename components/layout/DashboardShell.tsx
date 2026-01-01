// components/layout/DashboardShell.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  Coins,
  Building,
  User,
  Menu,
  ChevronLeft,
  LogOut,
  Home,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/layout/ModeToggle'; // Pastikan komponen ini ada
import { UserRole } from '@/types/user';

interface DashboardShellProps {
  user: any;
  role: UserRole;
  greeting: string;
  children: React.ReactNode;
}

export function DashboardShell({ user, role, greeting, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = getNavItems(role);

  return (
    <div className="flex min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="rounded-full premium-glass">
            <Menu size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 premium-glass border-r-0">
          <SidebarContent user={user} role={role} navItems={navItems} setSidebarOpen={setSidebarOpen} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 md:z-50 border-r premium-glass">
        <SidebarContent user={user} role={role} navItems={navItems} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-72 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
        <header className="sticky top-0 z-40 border-b premium-glass backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-6 md:px-8">
            <div className="flex items-center gap-4">
              {!pathname.includes('/dashboard') && pathname !== '/' && (
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all bg-muted/30 px-3 py-1.5 rounded-full"
                >
                  <ChevronLeft size={14} />
                  <span>Kembali</span>
                </button>
              )}
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 relative bg-primary/10 rounded-xl flex items-center justify-center p-1.5 border border-primary/20">
                  <img src="/images/logo-alifa-white.png" alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="font-bold text-lg tracking-tight leading-tight">Alifa Institute</h1>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Learning Management System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 mr-2 px-3 py-1.5 bg-muted/40 rounded-full border border-border/50">
                <ModeToggle />
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{user.name}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-tighter mt-1">{role.replace('_', ' ')}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm ring-2 ring-background ring-offset-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive group transition-all duration-300">
                <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10 max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{greeting}</h2>
            </div>
          </motion.div>

          <div className="relative">
            {children}
          </div>
        </main>

        <footer className="px-8 pb-10 pt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 p-8 premium-glass rounded-3xl border-dashed">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <img src="/images/logo-alifa-white.png" alt="" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-xl tracking-tight">Alifa Institute</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Elevating education through modern technology and integrated learning management solutions.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-primary mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/akademik" className="hover:text-primary transition-colors flex items-center gap-2"><span>→</span> Akademik</Link></li>
                <li><Link href="/keuangan" className="hover:text-primary transition-colors flex items-center gap-2"><span>→</span> Keuangan</Link></li>
                <li><Link href="/forum" className="hover:text-primary transition-colors flex items-center gap-2"><span>→</span> Forum Diskusi</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-primary mb-6">Support</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-2"><span>→</span> FAQ</Link></li>
                <li><Link href="/bantuan" className="hover:text-primary transition-colors flex items-center gap-2"><span>→</span> Pusat Bantuan</Link></li>
              </ul>
            </div>
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <h3 className="font-bold text-sm uppercase tracking-widest text-primary mb-4">Official Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><span>📍</span> <span>Jl. Merdeka No. 123, Jakarta</span></li>
                <li className="flex items-center gap-2"><span>✉️</span> <span>info@alifa.ac.id</span></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-10 text-center text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold opacity-40">
            <p>© 2025 Alifa Institute. Reserved Proprietary System.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarContent({ user, role, navItems, setSidebarOpen }: any) {
  const pathname = usePathname();
  const IconMap: Record<string, any> = {
    home: Home,
    akademik: GraduationCap,
    keuangan: Coins,
    superadmin: Building,
    pengguna: Users,
    profil: User,
    pengaturan: Settings,
    kelas: BookOpen,
    kalender: Calendar,
    laporan: FileText,
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/5">
      <div className="p-8 border-b border-border/40">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 relative p-2 bg-primary/10 rounded-2xl border border-primary/20">
            <img src="/images/logo-alifa-white.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tighter leading-none block">ALIFA</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Institute</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate leading-none mb-1">{user.name}</p>
            <Badge variant="outline" className="text-[8px] h-4 py-0 border-primary/30 text-primary-foreground bg-primary/80">
              {role.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map((item: any) => {
          const Icon = IconMap[item.icon] || Home;
          const isActive = item.href === '/' ?
            pathname === '/' :
            pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen?.(false)}
              className={isActive ? 'premium-sidebar-link-active' : 'premium-sidebar-link'}
            >
              <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'} />
              <span className="text-sm tracking-tight">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 mt-auto group cursor-pointer hover:bg-primary/5 transition-colors border-t border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
            <Settings size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">System Settings</p>
            <p className="text-[10px] text-muted-foreground tracking-tight">v2.4.0-premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNavItems(role: UserRole) {
  const baseItems = [
    { name: 'Beranda', href: '/', icon: 'home' },
  ];

  switch (role) {
    case 'super_admin':
      return [
        ...baseItems,
        { name: 'Manajemen Pengguna', href: '/superadmin/users', icon: 'pengguna' },
        { name: 'Manajemen Akademik', href: '/akademik', icon: 'akademik' },
        { name: 'Keuangan', href: '/keuangan', icon: 'keuangan' },
        { name: 'Pengaturan', href: '/pengaturan', icon: 'pengaturan' },
      ];
    case 'staff_akademik':
      return [
        ...baseItems,
        { name: 'Program Studi', href: '/akademik/program-studi', icon: 'akademik' },
        { name: 'Kurikulum', href: '/akademik/kurikulum', icon: 'akademik' },
        { name: 'Mahasiswa', href: '/akademik/mahasiswa', icon: 'akademik' },
        { name: 'Dosen', href: '/akademik/dosen', icon: 'akademik' },
        { name: 'Kelas', href: '/akademik/kelas', icon: 'akademik' },
        { name: 'Kalender Akademik', href: '/akademik/kalender-akademik', icon: 'kalender' },
        { name: 'Laporan', href: '/laporan', icon: 'laporan' },
      ];
    case 'staff_keuangan':
      return [
        ...baseItems,
        { name: 'Bukti Transfer', href: '/keuangan/bukti-transfer', icon: 'keuangan' },
        { name: 'Verifikasi', href: '/keuangan/verifikasi', icon: 'keuangan' },
        { name: 'Laporan', href: '/keuangan/laporan', icon: 'keuangan' },
      ];
    case 'dosen':
      return [
        ...baseItems,
        { name: 'Kelas Saya', href: '/akademik/dosen/kelas', icon: 'kelas' },
        { name: 'Penilaian', href: '/akademik/dosen/penilaian', icon: 'akademik' },
        { name: 'Materi', href: '/akademik/dosen/materi', icon: 'akademik' },
      ];
    case 'mahasiswa':
      return [
        ...baseItems,
        { name: 'KRS', href: '/akademik/mahasiswa/krs', icon: 'akademik' },
        { name: 'Kelas Saya', href: '/akademik/mahasiswa/kelas', icon: 'kelas' },
        { name: 'Nilai', href: '/akademik/mahasiswa/nilai', icon: 'akademik' },
        { name: 'Pembayaran', href: '/keuangan/bukti-transfer', icon: 'keuangan' },
        { name: 'Profil', href: '/pengaturan', icon: 'profil' },
      ];
    default:
      return baseItems;
  }
}