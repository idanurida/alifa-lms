// app/(dashboard)/pengaturan/identitas/upload/page.tsx - VERSI BENAR
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadDokumenPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  if (!session || !['mahasiswa', 'dosen'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!documentType || !file) {
      toast.error('Harap pilih jenis dokumen dan unggah file.');
      setIsLoading(false);
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Jenis file tidak didukung. Harap unggah file JPG, PNG, atau PDF.');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('document_file', file);
      
      if (session.user.role === 'dosen' && expirationDate) {
        formData.append('expiration_date', expirationDate);
      }

      const response = await fetch('/api/upload/document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Dokumen berhasil diunggah dan menunggu verifikasi.');
        router.push('/pengaturan/identitas');
      } else {
        toast.error(`❌ ${result.error || 'Gagal mengunggah dokumen.'}`);
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('❌ Gagal mengunggah dokumen.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tentukan jenis dokumen berdasarkan role
  const documentTypes = session.user.role === 'mahasiswa' 
    ? [
        { value: 'ktp', label: 'Kartu Tanda Penduduk (KTP)' },
        { value: 'kk', label: 'Kartu Keluarga (KK)' },
        { value: 'ijazah_sma', label: 'Ijazah SMA/SMK' },
        { value: 'skhu', label: 'SKHU/SKL' },
        { value: 'pas_foto', label: 'Pas Foto' },
        { value: 'lainnya', label: 'Dokumen Lainnya' },
      ]
    : [ // Dosen
        { value: 'ktp', label: 'Kartu Tanda Penduduk (KTP)' },
        { value: 'npwp', label: 'Nomor Pokok Wajib Pajak (NPWP)' },
        { value: 'ijazah', label: 'Ijazah Terakhir' },
        { value: 'sertifikat_kompetensi', label: 'Sertifikat Kompetensi' },
        { value: 'lainnya', label: 'Dokumen Lainnya' },
      ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Upload Dokumen</h1>
        <p className="text-muted-foreground">
          Upload dokumen identitas baru.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={18} />
            Upload Dokumen Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="document_type">Jenis Dokumen *</Label>
              <Select value={documentType} onValueChange={setDocumentType} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Jenis Dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {session.user.role === 'dosen' && (
              <div>
                <Label htmlFor="expiration_date">Tanggal Kadaluarsa (Opsional)</Label>
                <Input
                  id="expiration_date"
                  name="expiration_date"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="document_file">File Dokumen *</Label>
              <Input
                id="document_file"
                name="document_file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Mengunggah...' : 'Upload Dokumen'}
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}