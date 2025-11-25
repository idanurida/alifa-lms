'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TambahPenugasanFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function TambahPenugasanForm({ onSubmit, onCancel }: TambahPenugasanFormProps) {
  const [formData, setFormData] = useState({
    classId: '',
    lecturerId: '',
    startDate: '',
    endDate: '',
    teachingLoad: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Penugasan Dosen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="classId">Kelas</Label>
            <Input
              id="classId"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              placeholder="Pilih kelas"
              required
            />
          </div>

          <div>
            <Label htmlFor="lecturerId">Dosen</Label>
            <Input
              id="lecturerId"
              name="lecturerId"
              value={formData.lecturerId}
              onChange={handleChange}
              placeholder="Pilih dosen"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="teachingLoad">Beban Mengajar (SKS)</Label>
            <Input
              id="teachingLoad"
              name="teachingLoad"
              type="number"
              value={formData.teachingLoad}
              onChange={handleChange}
              placeholder="Jumlah SKS"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">
              Simpan Penugasan
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}