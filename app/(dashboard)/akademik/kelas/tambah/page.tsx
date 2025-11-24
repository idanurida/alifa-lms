// app/(dashboard)/akademik/kelas/tambah/page.tsx
import React from 'react';
// import TambahKelasForm from '@/components/forms/TambahKelasForm'; // Asumsikan Anda memiliki komponen form terpisah

/**
 * Halaman Server Component untuk menambah data Kelas baru.
 */
export default function TambahKelasPage() {
  // Dalam Server Component, Anda dapat melakukan fetching data server-side
  // Contoh: Fetch daftar program studi yang tersedia untuk dropdown.
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 border-b pb-3">
          Formulir Penambahan Kelas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Masukkan detail lengkap untuk kelas yang akan dibuka pada semester ini.
        </p>

        {/* // Di sini Anda akan meletakkan komponen form client side Anda.
          // Contoh: <TambahKelasForm />
        */}
        <div className="border border-dashed border-gray-400 p-8 rounded-lg text-center text-gray-500 dark:text-gray-400">
            {/* Placeholder Form: Ganti dengan komponen form nyata Anda (Client Component) */}
            <p className="mb-4">Komponen Formulir Tambah Kelas akan diletakkan di sini.</p>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-center">
                <span className="text-sm">Contoh: &lt;TambahKelasForm /&gt;</span>
            </div>
        </div>

      </div>
    </div>
  );
}