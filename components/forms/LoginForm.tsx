// components/forms/LoginForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserRole } from '@/types/user';

interface LoginFormProps {
  defaultRole?: UserRole;
}

export default function LoginForm({ defaultRole = 'mahasiswa' }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: defaultRole,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login gagal');

      toast.success('✅ Login berhasil!');
      // Redirect berdasarkan role
      if (formData.role === 'mahasiswa') router.push('/akademik/mahasiswa');
      else if (formData.role === 'dosen') router.push('/akademik/dosen');
      else if (formData.role === 'staff_akademik') router.push('/akademik');
      else if (formData.role === 'staff_keuangan') router.push('/keuangan');
      else if (formData.role === 'super_admin') router.push('/superadmin');

    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Masuk ke ALIFA LMS</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@alifa.ac.id"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role">Sebagai</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 bg-background text-foreground"
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
              <option value="staff_akademik">Staff Akademik</option>
              <option value="staff_keuangan">Staff Keuangan</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Lupa kata sandi? <a href="/lupa-password" className="text-primary hover:underline">Klik di sini</a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}