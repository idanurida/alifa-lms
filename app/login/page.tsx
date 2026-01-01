'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { signIn } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, ArrowRight, User, Users, Coins, Building, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

// Role options
const ROLES = [
  { id: 'mahasiswa', label: 'Mahasiswa', icon: User, color: 'text-sky-400' },
  { id: 'dosen', label: 'Dosen', icon: Users, color: 'text-sky-400' },
  { id: 'staff_akademik', label: 'Staff Akademik', icon: Building, color: 'text-blue-400' },
  { id: 'staff_keuangan', label: 'Staff Keuangan', icon: Coins, color: 'text-yellow-400' },
  { id: 'super_admin', label: 'Super Admin', icon: Building, color: 'text-sky-400' },
];

// Demo credentials
const DEMO_ACCOUNTS = {
  mahasiswa: { email: 'mahasiswa@kampus.ac.id', password: 'password123' },
  dosen: { email: 'dosen@kampus.ac.id', password: 'password123' },
  staff_akademik: { email: 'admin@kampus.ac.id', password: 'password123' },
  staff_keuangan: { email: 'finance@kampus.ac.id', password: 'password123' },
  super_admin: { email: 'superadmin@alifa.ac.id', password: 'password123' },
};

function LoginContent() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('mahasiswa');
  const [formData, setFormData] = useState(DEMO_ACCOUNTS['mahasiswa']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setFormData(DEMO_ACCOUNTS[roleId as keyof typeof DEMO_ACCOUNTS]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Email atau password salah');
    } else {
      // Redirect based on role
      const redirectPaths: Record<string, string> = {
        mahasiswa: '/mahasiswa/dashboard',
        dosen: '/dosen/dashboard',
        staff_akademik: '/akademik',
        staff_keuangan: '/keuangan',
        super_admin: '/super-admin/dashboard',
      };
      router.push(redirectPaths[selectedRole] || '/');
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
              <Image
                src="/images/logo-alifa-white.png"
                alt="ALIFA Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl">ALIFA</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Selamat Datang</h1>
          <p className="text-slate-600 dark:text-slate-400">Masukkan email dan password untuk masuk</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white dark:bg-[#1e293b]/50 border-slate-200 dark:border-white/10">
          <CardContent className="p-6 space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Pilih Peran</Label>
              <div className="grid grid-cols-5 gap-2">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/50'
                          : 'bg-transparent border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                      title={role.label}
                    >
                      <Icon size={18} className={isSelected ? 'text-[#0ea5e9]' : 'text-slate-400 dark:text-slate-500'} />
                      <span className={`text-[10px] ${isSelected ? 'text-[#0ea5e9]' : 'text-slate-500 dark:text-slate-500'}`}>
                        {role.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium dark:text-slate-300">Email</Label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-slate-50 dark:bg-[#0f172a]/50 border-slate-200 dark:border-white/10 h-11 dark:text-white"
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium dark:text-slate-300">Password</Label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-slate-50 dark:bg-[#0f172a]/50 border-slate-200 dark:border-white/10 h-11 dark:text-white"
                    placeholder="Masukkan password Anda"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-semibold h-11"
              >
                {loading ? 'Sedang Masuk...' : 'Masuk'}
                {!loading && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </form>

            {/* Demo Notice */}
            <div className="p-3 rounded-lg bg-[#0ea5e9]/5 border border-[#0ea5e9]/10">
              <p className="text-xs text-[#0ea5e9] text-center">
                Mode Demo: Klik ikon peran untuk otomatis isi kredensial
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 text-center mt-1">
                Password untuk semua akun: <code className="text-slate-600 dark:text-slate-400">password123</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-[#0ea5e9] hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9] mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Memuat...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
