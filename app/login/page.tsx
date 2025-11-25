'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, User, GraduationCap, Users, Coins, Building, LogIn, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// Data user untuk testing
const TEST_USERS = {
  mahasiswa: {
    email: 'mahasiswa@kampus.ac.id',
    password: 'password123',
    label: 'Mahasiswa',
    icon: User,
    color: 'text-indigo-500'
  },
  dosen: {
    email: 'dosen@kampus.ac.id',
    password: 'password123',
    label: 'Dosen',
    icon: GraduationCap,
    color: 'text-green-500'
  },
  staff_akademik: {
    email: 'admin@kampus.ac.id',
    password: 'password123',
    label: 'Staff Akademik',
    icon: Users,
    color: 'text-blue-500'
  },
  staff_keuangan: {
    email: 'finance@kampus.ac.id',
    password: 'password123',
    label: 'Staff Keuangan',
    icon: Coins,
    color: 'text-yellow-500'
  },
  super_admin: {
    email: 'superadmin@alifa.ac.id',
    password: 'password123',
    label: 'Super Admin',
    icon: Building,
    color: 'text-purple-500'
  }
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'mahasiswa',
  });
  const [loading, setLoading] = useState(false);

  // Set email dan password otomatis berdasarkan role
  const handleRoleSelect = (role: keyof typeof TEST_USERS) => {
    const user = TEST_USERS[role];
    setFormData({
      email: user.email,
      password: user.password,
      role: role
    });
  };

  const RoleIcon = TEST_USERS[formData.role as keyof typeof TEST_USERS]?.icon || User;
  const roleLabel = TEST_USERS[formData.role as keyof typeof TEST_USERS]?.label || 'Pengguna';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Login attempt:', formData);

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      redirect: false,
    });

    console.log('SignIn result:', result);

    if (result?.error) {
      toast.error('Email, kata sandi, atau role salah');
    } else {
      // Redirect berdasarkan role yang dipilih
      const redirectPaths = {
        mahasiswa: '/mahasiswa/dashboard',
        dosen: '/dosen/dashboard',
        staff_akademik: '/akademik',
        staff_keuangan: '/keuangan',
        super_admin: '/super-admin/dashboard',
      };
      
      const redirectPath = redirectPaths[formData.role as keyof typeof redirectPaths] || '/';
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
      router.refresh();
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Pastikan komponen sudah mounted untuk menghindari hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-supabase-green mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Header dengan Theme Toggle */}
      <header className="px-4 py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-supabase-green rounded-full flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-supabase-green to-purple-500 bg-clip-text text-transparent">
              ALIFA Institute
            </h1>
          </div>
          
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full border-border"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Sistem Pembelajaran Terintegrasi
        </p>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-lg border-border bg-card">
          <CardHeader className="text-center">
            <div className={`mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2`}>
              <RoleIcon className="text-supabase-green" size={24} />
            </div>
            <CardTitle className="text-xl">Selamat Datang</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pilih role untuk login otomatis
            </p>
          </CardHeader>

          {/* Quick Role Selection Buttons */}
          <div className="px-6 pb-4">
            <Label className="text-sm font-medium mb-3 block">Pilih User Role:</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TEST_USERS).map(([role, user]) => {
                const UserIcon = user.icon;
                const isSelected = formData.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role as keyof typeof TEST_USERS)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'border-supabase-green bg-green-50 dark:bg-green-900/20 text-foreground' 
                        : 'border-border hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className={`h-4 w-4 ${user.color}`} />
                      <span className="text-xs font-medium">{user.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email akan terisi otomatis"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    readOnly
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password akan terisi otomatis"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  readOnly
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Password: <strong>password123</strong> (sama untuk semua user)
                </p>
              </div>

              {/* Hidden role field untuk form submission */}
              <input type="hidden" name="role" value={formData.role} />

              <Button 
                type="submit" 
                disabled={loading || !formData.email} 
                className="w-full bg-supabase-green hover:bg-green-600 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk sebagai {roleLabel}
                  </>
                )}
              </Button>
            </CardContent>
          </form>

          {/* Current Selection Info */}
          <div className="px-6 pb-4">
            <div className="bg-muted/30 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <RoleIcon className="h-4 w-4 text-supabase-green" />
                <span className="text-sm font-medium">Login sebagai: {roleLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Email: {formData.email || '- belum dipilih -'}
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              Belum punya akun?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/auth/register?role=mahasiswa">
                <Button variant="outline" size="sm" className="border-border">
                  Daftar Mahasiswa
                </Button>
              </Link>
              <Link href="/auth/register?role=dosen">
                <Button variant="outline" size="sm" className="border-border">
                  Daftar Dosen
                </Button>
              </Link>
              <Link href="/auth/register?role=staff_akademik">
                <Button variant="outline" size="sm" className="border-border">
                  Daftar Staff Akademik
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>

      {/* Back Button */}
      <div className="px-4 py-6 text-center border-t border-border">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-sm text-muted-foreground bg-muted/30">
        <p>© 2025 ALIFA Institute. All rights reserved.</p>
        <p className="text-xs mt-1">Demo Version - Password: password123</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-supabase-green mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}