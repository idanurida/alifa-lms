'use client';
import React from 'react';
import { Curriculum } from '@/types/akademik'; // Import tipe yang dibutuhkan

// DEFINISI PROPS
interface MataKuliahFormProps {
  curricula: Curriculum[];
}

// Komponen sekarang menerima props MataKuliahFormProps
const MataKuliahForm = ({ curricula }: MataKuliahFormProps) => {
  // Anda bisa menggunakan data kurikulum di sini, misalnya untuk dropdown.
  console.log("Loaded curricula for form, count:", curricula.length); 

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Formulir Tambah Mata Kuliah</h2>
      <p className="text-sm text-muted-foreground">
        *Form Mata Kuliah akan diimplementasikan di sini. Tersedia {curricula.length} kurikulum aktif.
      </p>
      {/* Tambahkan logika dan input form di sini */}
    </div>
  );
};

export default MataKuliahForm;