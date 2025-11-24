'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, XCircle, ShieldOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Import Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ===============================================
// TIPE DATA
// ===============================================

interface DosenData {
  id: number;
  user_id: string; // ID Pengguna (string karena UUID/custom token ID)
  nidn: string;
  name: string;
  email: string;
  phone: string | null;
  expertise: string | null;
  status: string;
  is_active: boolean;
}

// ===============================================
// CLIENT COMPONENT: PAGE UTAMA + FORM
// ===============================================

export default function EditDosenPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [dosen, setDosen] = useState<DosenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [userRole, setUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Pilihan Status Dosen
  const statusOptions = [
    { value: 'dosen_tetap', label: 'Dosen Tetap' },
    { value: 'dosen_tidak_tetap', label: 'Dosen Tidak Tetap' },
    { value: 'dosen_pensiun', label: 'Dosen Pensiun' },
    { value: 'dosen_cuti', label: 'Dosen Cuti' }
  ];

  // ===============================================
  // FETCH DATA DOSEN DAN USER SESSION (SIMULASI API)
  // ===============================================

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Asumsi: Anda menggunakan API Route Handler untuk mengambil data
        const response = await fetch(`/api/akademik/dosen/${params.id}/edit`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data or unauthorized');
        }
        
        const data = await response.json();
        
        setDosen(data.dosen);
        setUserRole(data.userRole);
        setCurrentUserId(data.currentUserId);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatusMessage({ 
          type: 'error', 
          text: 'Gagal memuat data dosen' 
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  // ===============================================
  // HANDLERS
  // ===============================================

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDosen(prev => prev ? { ...prev, [name]: value } : null);
    setStatusMessage({ type: '', text: '' });
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setDosen(prev => prev ? { 
      ...prev, 
      [name]: name === 'is_active' ? (value === 'true') : value 
    } : null);
    setStatusMessage({ type: '', text: '' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dosen) return;

    setIsSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    // Validasi dasar
    if (!dosen.nidn || !dosen.name || !dosen.email) {
      setStatusMessage({ type: 'error', text: 'NIDN, Nama, dan Email wajib diisi.' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Asumsi: API Route Handler untuk PUT (update) sudah dibuat di /api/akademik/dosen/[id]
      const response = await fetch(`/api/akademik/dosen/${dosen.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dosen),
      });

      if (response.ok) {
        setStatusMessage({ 
          type: 'success', 
          text: 'Data dosen berhasil diperbarui! Mengalihkan...' 
        });
        
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push('/akademik/dosen');
        }, 2000);
        
      } else {
        const errorData = await response.json();
        setStatusMessage({ 
          type: 'error', 
          text: errorData.message || 'Terjadi kesalahan saat memperbarui data.' 
        });
      }
    } catch (error) {
      console.error('Gagal memperbarui data:', error);
      setStatusMessage({ 
        type: 'error', 
        text: 'Terjadi kesalahan jaringan atau server tidak merespons.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===============================================
  // RENDER LOADING
  // ===============================================

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </div>
    );
  }

  // ===============================================
  // RENDER ERROR / NOT FOUND
  // ===============================================

  if (!dosen) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
          <XCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold">Data Tidak Ditemukan</h2>
          <p className="text-muted-foreground">Data dosen tidak dapat dimuat atau tidak ada.</p>
          <Link href="/akademik/dosen" passHref>
            <Button variant="outline">Kembali ke Daftar Dosen</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ===============================================
  // CHECK AUTHORIZATION
  // ===============================================

  const isAdmin = userRole === 'super_admin';
  // Dosen.user_id diasumsikan sebagai string (UUID/UID dari Firebase/Auth), sama dengan currentUserId
  const isSelfProfile = userRole === 'dosen' && dosen.user_id === currentUserId;

  if (!isAdmin && !isSelfProfile) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
          <ShieldOff className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold">Akses Ditolak</h2>
          <p className="text-muted-foreground">Anda tidak diizinkan mengedit profil dosen ini.</p>
          <Link href="/akademik/dosen" passHref>
            <Button variant="outline">Kembali ke Daftar Dosen</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ===============================================
  // RENDER FORM
  // ===============================================

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/akademik/dosen" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Edit Data Dosen: {dosen.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Perbarui informasi profil dosen
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Formulir Edit Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Bagian Status dan Active (Hanya Super Admin) */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                {/* Status Dosen */}
                <div className="space-y-2">
                  <Label htmlFor="status-select">Status Dosen</Label>
                  <Select 
                    value={dosen.status} 
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    {/* FIX: Menghapus id dari SelectTrigger */}
                    <SelectTrigger>
                      {/* Memindahkan id ke SelectValue untuk kaitan label, meskipun Radix biasanya menangani ini secara internal */}
                      <SelectValue placeholder="Pilih Status" id="status-select"/>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Akun Aktif/Non-Aktif */}
                <div className="space-y-2">
                  <Label htmlFor="active-select">Status Akun Pengguna</Label>
                  <Select 
                    value={String(dosen.is_active)} 
                    onValueChange={(value) => handleSelectChange('is_active', value)}
                  >
                    {/* FIX: Menghapus id dari SelectTrigger */}
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status Akun" id="active-select"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Aktif</SelectItem>
                      <SelectItem value="false">Non-Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIDN */}
              <div className="space-y-2">
                <Label htmlFor="nidn">NIDN</Label>
                <Input 
                  id="nidn"
                  name="nidn"
                  value={dosen.nidn}
                  onChange={handleInputChange}
                  maxLength={10}
                  required
                />
              </div>

              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name"
                  name="name"
                  value={dosen.name}
                  onChange={handleInputChange}
                  required
                  // Nama hanya bisa diubah oleh Super Admin atau dosen yang melihat profilnya sendiri
                  disabled={!isAdmin && !isSelfProfile}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={dosen.email}
                  onChange={handleInputChange}
                  required
                  // Email hanya bisa diubah oleh Super Admin
                  disabled={!isAdmin}
                />
              </div>
              
              {/* Telepon */}
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input 
                  id="phone"
                  name="phone"
                  type="tel"
                  value={dosen.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>

            {/* Bidang Keahlian */}
            <div className="space-y-2">
              <Label htmlFor="expertise">Bidang Keahlian</Label>
              <Textarea 
                id="expertise"
                name="expertise"
                value={dosen.expertise || ''}
                onChange={handleInputChange}
                placeholder="Contoh: Kecerdasan Buatan, Basis Data Lanjut, Jaringan Komputer"
                rows={3}
              />
            </div>

            {/* Pesan Status */}
            {statusMessage.text && (
              <div 
                className={`p-3 rounded-lg flex items-center ${
                  statusMessage.type === 'error' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                }`}
              >
                {statusMessage.type === 'error' ? 
                  <XCircle className="h-5 w-5 mr-2" /> : 
                  <Save className="h-5 w-5 mr-2" />
                }
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link href="/akademik/dosen" passHref>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}