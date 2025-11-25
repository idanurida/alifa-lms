'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // Memastikan impor Switch sudah benar
import { StudyProgram } from '@/types/akademik';

export default function ProgramStudiForm() {
    // Definisi StudyProgram (Mock untuk memastikan tipe StudyProgram ada)
    // Jika tipe ini tidak ada di '@/types/akademik', ini akan menjadi masalah berikutnya.
    const initialFormData: Partial<StudyProgram> = {
        name: '',
        code: '',
        faculty: '',
        
    };

    const [formData, setFormData] = useState<Partial<StudyProgram>>(initialFormData);
    const [idCounter, setIdCounter] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simulasikan penambahan ID dan tanggal, mengisi nilai default jika hilang
        const newProgram: StudyProgram = {
            ...formData,
            id: idCounter + 1, // Simulasikan ID baru
            created_at: new Date().toISOString(),
            name: formData.name ?? '', 
            code: formData.code ?? '',
            faculty: formData.faculty ?? '',
            is_active: formData.is_active !== undefined ? formData.is_active : true,
            
        };

        console.log('Submitting Program Studi:', newProgram);
        setIdCounter(prev => prev + 1);
        
        // Reset form
        setFormData(initialFormData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="code">Kode Program Studi</Label>
                <Input 
                    id="code" 
                    placeholder="Contoh: SI" 
                    value={formData.code || ''} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Nama Program Studi</Label>
                <Input 
                    id="name" 
                    placeholder="Contoh: Sistem Informasi" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="faculty">Fakultas</Label>
                <Input 
                    id="faculty" 
                    placeholder="Contoh: Fakultas Ilmu Komputer" 
                    value={formData.faculty || ''} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="flex items-center justify-between space-x-4 pt-4">
                <Label htmlFor="is_active" className="text-sm font-medium leading-none">
                    Status Aktif
                    <p className="text-xs text-muted-foreground mt-1">
                        Jika diaktifkan, program studi dapat digunakan untuk enrollment.
                    </p>
                </Label>
                <Switch 
                    id="is_active" 
                    checked={true} 
                    onCheckedChange={handleSwitchChange} 
                />
            </div>

            <Button type="submit" className="w-full">
                Simpan Program Studi
            </Button>
        </form>
    );
}
