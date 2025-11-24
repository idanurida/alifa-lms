// components/akademik/TambahPenugasanForm.tsx - DENGAN VALIDASI REAL-TIME
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePenugasanValidation } from '@/hooks/usePenugasanValidation'; // Opsional

// ... interface dan props tetap sama

export default function TambahPenugasanForm({
  classId,
  availableLecturers,
  availableClasses,
}: TambahPenugasanFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    lecturer_id: '',
    assignment_type: 'main',
    teaching_load: 3,
  });
  const [loading, setLoading] = useState(false);
  // const { errors, validateForm, clearErrors } = usePenugasanValidation(); // Opsional

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi client-side
    if (!formData.lecturer_id) {
      toast.error('Pilih dosen terlebih dahulu');
      return;
    }

    if (formData.teaching_load < 1 || formData.teaching_load > 6) {
      toast.error('Beban mengajar harus antara 1-6 SKS');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/akademik/kelas/${classId}/dosen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecturer_id: parseInt(formData.lecturer_id),
          assignment_type: formData.assignment_type,
          teaching_load: formData.teaching_load,
          is_active: true
        }),
      });

      const result = await res.json();
      
      // Handle response berdasarkan validasi Zod
      if (!res.ok) {
        if (result.details) {
          // Tampilkan error validasi dari Zod
          const errorMessages = result.details.map((err: any) => 
            `• ${err.message}`
          ).join('\n');
          throw new Error(`Validasi gagal:\n${errorMessages}`);
        }
        throw new Error(result.error || 'Gagal menugaskan dosen');
      }

      if (result.success) {
        toast.success(result.message || 'Dosen berhasil ditugaskan ke kelas');
        router.push(`/akademik/kelas/${classId}`);
        router.refresh();
      } else {
        throw new Error(result.error || 'Gagal menugaskan dosen');
      }

    } catch (error: any) {
      console.error('Assignment error:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentClass = availableClasses.find(c => c.id === classId);

  return (
    <Card className="glass-effect dark:glass-effect-dark">
      <CardHeader>
        <CardTitle>Form Penugasan Dosen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-md text-sm">
          <p><strong>Kelas:</strong> {currentClass?.course.name} ({currentClass?.class_code})</p>
          <p><strong>Periode:</strong> {currentClass?.academic_period.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Dosen *</label>
            <Select
              value={formData.lecturer_id}
              onValueChange={(value) => setFormData({ ...formData, lecturer_id: value })}
              required
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih dosen..." />
              </SelectTrigger>
              <SelectContent className="dark:bg-card">
                {availableLecturers.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        NIDN: {d.nidn} • {d.expertise}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Peran *</label>
            <Select
              value={formData.assignment_type}
              onValueChange={(value) => setFormData({ ...formData, assignment_type: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-card">
                <SelectItem value="main">Dosen Utama</SelectItem>
                <SelectItem value="assistant">Asisten Dosen</SelectItem>
                <SelectItem value="guest">Dosen Tamu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Beban Mengajar (SKS) *
            </label>
            <Input
              type="number"
              min="1"
              max="6"
              value={formData.teaching_load}
              onChange={(e) =>
                setFormData({ ...formData, teaching_load: parseInt(e.target.value) || 1 })
              }
              className="text-sm"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Beban mengajar dalam Satuan Kredit Semester (1-6 SKS)
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading || !formData.lecturer_id} className="px-6">
              {loading ? 'Menugaskan...' : 'Tugaskan Dosen'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6"
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}