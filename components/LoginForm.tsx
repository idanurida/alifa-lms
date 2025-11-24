'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError('Login gagal. Periksa email, password, dan role Anda.');
      } else {
        // Redirect berdasarkan role
        const redirectPaths = {
          mahasiswa: '/akademik/mahasiswa',
          dosen: '/akademik/dosen',
          staff_akademik: '/akademik',
          staff_keuangan: '/keuangan',
          super_admin: '/superadmin',
        };
        
        const redirectPath = redirectPaths[role as keyof typeof redirectPaths] || '/';
        router.push(redirectPath);
        router.refresh();
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" name="email" required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" required />
      </div>
      <div>
        <label>Role:</label>
        <select name="role" required>
          <option value="">Pilih Role</option>
          <option value="mahasiswa">Mahasiswa</option>
          <option value="dosen">Dosen</option>
          <option value="staff_akademik">Staff Akademik</option>
          <option value="staff_keuangan">Staff Keuangan</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}