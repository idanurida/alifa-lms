'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Course, AcademicPeriod } from '@/types/akademik';
import { kelasSchema } from '@/lib/validations/akademik';
import { z } from 'zod';
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  MapPin,
  Send,
  X,
  GraduationCap,
  Users2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KelasFormProps {
  initialData?: any; // Class
  courses: Course[];
  academicPeriods: AcademicPeriod[];
  lecturers: any[];
}

export default function KelasForm({ initialData, courses, academicPeriods, lecturers }: KelasFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    course_id: initialData?.course_id || '',
    academic_period_id: initialData?.academic_period_id || '',
    class_code: initialData?.class_code || '',
    lecturer_id: initialData?.lecturer_id || '',
    schedule: initialData?.schedule || { day: '', time: '', room: '' },
    max_students: initialData?.max_students || 40,
    is_active: initialData?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = (name === 'course_id' || name === 'academic_period_id' || name === 'lecturer_id' || name === 'max_students')
      ? (value === '' ? '' : parseInt(value))
      : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, [name]: value }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const parsedData = kelasSchema.parse(formData);
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/akademik/kelas?id=${initialData.id}` : '/api/akademik/kelas';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan kelas');

      toast.success(`✅ Kelas ${initialData ? 'diperbarui' : 'ditambahkan'}!`);
      router.push('/akademik/kelas');
      router.refresh();

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const path = err.path.join('.');
            fieldErrors[path] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Silakan perbaiki kesalahan input.');
      } else {
        toast.error(`❌ ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Informasi Dasar */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg">Informasi Akademik</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="course_id" className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <GraduationCap className="h-3 w-3" /> Mata Kuliah
                  </Label>
                  <select
                    id="course_id"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-11 px-4 border-2 rounded-xl bg-background transition-all focus:ring-4 focus:ring-primary/10 outline-none",
                      errors.course_id ? "border-red-500" : "border-muted-foreground/20 focus:border-primary"
                    )}
                  >
                    <option value="">Pilih Mata Kuliah</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                  {errors.course_id && <p className="text-xs text-red-500 font-medium px-1">{errors.course_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academic_period_id" className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Periode Akademik
                  </Label>
                  <select
                    id="academic_period_id"
                    name="academic_period_id"
                    value={formData.academic_period_id}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-11 px-4 border-2 rounded-xl bg-background transition-all focus:ring-4 focus:ring-primary/10 outline-none",
                      errors.academic_period_id ? "border-red-500" : "border-muted-foreground/20 focus:border-primary"
                    )}
                  >
                    <option value="">Pilih Periode</option>
                    {academicPeriods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name} {period.is_active && "(Aktif)"}
                      </option>
                    ))}
                  </select>
                  {errors.academic_period_id && <p className="text-xs text-red-500 font-medium px-1">{errors.academic_period_id}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="class_code" className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <BookOpen className="h-3 w-3" /> Kode Kelas
                  </Label>
                  <Input
                    id="class_code"
                    name="class_code"
                    value={formData.class_code}
                    onChange={handleChange}
                    placeholder="Contoh: A, B1, atau REG-A"
                    className={cn(
                      "h-11 border-2 rounded-xl focus:ring-4 focus:ring-primary/10",
                      errors.class_code ? "border-red-500" : "border-muted-foreground/20"
                    )}
                  />
                  {errors.class_code && <p className="text-xs text-red-500 font-medium px-1">{errors.class_code}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lecturer_id" className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <Users2 className="h-3 w-3" /> Dosen Pengampu
                  </Label>
                  <select
                    id="lecturer_id"
                    name="lecturer_id"
                    value={formData.lecturer_id}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-11 px-4 border-2 rounded-xl bg-background transition-all focus:ring-4 focus:ring-primary/10 outline-none",
                      errors.lecturer_id ? "border-red-500" : "border-muted-foreground/20 focus:border-primary"
                    )}
                  >
                    <option value="">Pilih Dosen</option>
                    {lecturers.map((dosen) => (
                      <option key={dosen.id} value={dosen.id}>
                        {dosen.name}
                      </option>
                    ))}
                  </select>
                  {errors.lecturer_id && <p className="text-xs text-red-500 font-medium px-1">{errors.lecturer_id}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="bg-sky-500/5 px-6 py-4 border-b border-sky-500/10 flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-600" />
              <h3 className="font-bold text-lg">Jadwal & Lokasi</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="day" className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Hari
                  </Label>
                  <select
                    id="day"
                    name="day"
                    value={formData.schedule.day}
                    onChange={handleScheduleChange}
                    className="w-full h-11 px-4 border-2 rounded-xl bg-background border-muted-foreground/20 focus:border-sky-500 outline-none"
                  >
                    <option value="">Pilih Hari</option>
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3 w-3" /> Waktu
                  </Label>
                  <Input
                    id="time"
                    name="time"
                    value={formData.schedule.time}
                    onChange={handleScheduleChange}
                    placeholder="Contoh: 08:00 - 10:30"
                    className="h-11 border-2 rounded-xl focus:border-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room" className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Ruangan
                  </Label>
                  <Input
                    id="room"
                    name="room"
                    value={formData.schedule.room}
                    onChange={handleScheduleChange}
                    placeholder="Contoh: R. Laboratorium 1"
                    className="h-11 border-2 rounded-xl focus:border-sky-500"
                  />
                </div>
              </div>
              {errors['schedule'] && <p className="text-xs text-red-500 font-medium mt-3">{errors['schedule']}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Pengaturan Tambahan */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/5 shadow-xl shadow-primary/5">
            <CardHeader className="bg-amber-500/5 border-b border-amber-500/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" /> Pengaturan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max_students" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Kapasitas Mahasiswa
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="max_students"
                    name="max_students"
                    type="number"
                    min="1"
                    value={formData.max_students}
                    onChange={handleChange}
                    className="h-11 pl-10 border-2 rounded-xl"
                  />
                </div>
                {errors.max_students && <p className="text-xs text-red-500 font-medium">{errors.max_students}</p>}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <Label htmlFor="is_active" className="font-bold cursor-pointer">
                  Status Aktif
                </Label>
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-6 w-6 rounded-md border-2 border-primary accent-primary cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-white/20 border-t-white rounded-full" />
                  Memproses...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  {initialData ? 'Perbarui Kelas' : 'Buka Kelas Sekarang'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-14 rounded-2xl font-bold border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
            >
              <X className="mr-2 h-5 w-5" />
              Batalkan
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
