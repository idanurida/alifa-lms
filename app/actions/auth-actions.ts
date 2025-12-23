'use server';

// app/actions/auth-actions.ts
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const claimSchema = z.object({
    id: z.string().min(1, 'ID wajib diisi'),
    email: z.string().email('Email tidak valid'),
    username: z.string().min(3, 'Username minimal 3 karakter'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function claimAccount(formData: z.infer<typeof claimSchema>) {
    try {
        const validatedData = claimSchema.parse(formData);
        const { id, email, username, password } = validatedData;

        // 1. Cek User apakah sudah ada dengan email atau username ini
        const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
    `;
        if (existingUser) {
            return { success: false, error: 'Email atau Username sudah terdaftar' };
        }

        // 2. Cari di tabel students (Mahasiswa)
        const [student] = await sql`
      SELECT id, user_id, name FROM students WHERE nim = ${id}
    `;

        if (student) {
            if (student.user_id) {
                return { success: false, error: 'Akun mahasiswa ini sudah diaktivasi' };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create User
            const [newUser] = await sql`
        INSERT INTO users (username, email, password, role, is_active)
        VALUES (${username}, ${email}, ${hashedPassword}, 'mahasiswa', true)
        RETURNING id
      `;

            // Link to Student
            await sql`
        UPDATE students SET user_id = ${newUser.id} WHERE id = ${student.id}
      `;

            // Create Profile
            await sql`
        INSERT INTO profiles (user_id, name)
        VALUES (${newUser.id}, ${student.name})
      `;

            return { success: true, message: 'Akun mahasiswa berhasil diaktivasi' };
        }

        // 3. Cari di tabel lecturers (Dosen)
        const [lecturer] = await sql`
      SELECT id, user_id, name FROM lecturers WHERE nidn = ${id}
    `;

        if (lecturer) {
            if (lecturer.user_id) {
                return { success: false, error: 'Akun dosen ini sudah diaktivasi' };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create User
            const [newUser] = await sql`
        INSERT INTO users (username, email, password, role, is_active)
        VALUES (${username}, ${email}, ${hashedPassword}, 'dosen', true)
        RETURNING id
      `;

            // Link to Lecturer
            await sql`
        UPDATE lecturers SET user_id = ${newUser.id} WHERE id = ${lecturer.id}
      `;

            // Create Profile
            await sql`
        INSERT INTO profiles (user_id, name)
        VALUES (${newUser.id}, ${lecturer.name})
      `;

            return { success: true, message: 'Akun dosen berhasil diaktivasi' };
        }

        return { success: false, error: 'Data NIM/NIDN tidak ditemukan di pangkalan data' };
    } catch (error) {
        console.error('Claim Account Error:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: 'Terjadi kesalahan sistem' };
    }
}
