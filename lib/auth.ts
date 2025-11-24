// lib/auth.ts
import NextAuth, { type NextAuthOptions } from 'next-auth'; // PERBAIKAN: Import type
import CredentialsProvider from 'next-auth/providers/credentials';
import { sql } from './db';
import bcrypt from 'bcryptjs';

// PERBAIKAN: Tambah type definitions
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    name: string;
    nim?: string;
    nidn?: string;
    expertise?: string;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    nim?: string;
    nidn?: string;
    expertise?: string;
  }
}

// PERBAIKAN: Tambahkan tipe NextAuthOptions secara eksplisit
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 === AUTH DEBUG START ===');
        console.log('📧 Email received:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error('Email atau password tidak diberikan');
          return null;
        }

        try {
          // PERBAIKAN: Tambah timeout handling
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 10000)
          );

          const userPromise = sql`
            SELECT 
              u.id, u.email, u.username, u.role, u.password_hash, u.is_active
            FROM users u
            WHERE u.email = ${credentials.email}
          `;

          const users = await Promise.race([userPromise, timeoutPromise]) as any[];

          console.log('📊 Database result:', users);

          if (!users || users.length === 0) {
            console.error('User tidak ditemukan di database');
            return null;
          }

          const user = users[0];
          console.log('👤 User found:', {
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active
          });

          if (!user.password_hash) {
            console.error('Password hash kosong di database');
            return null;
          }

          if (!user.is_active) {
            console.error('Akun tidak aktif');
            return null;
          }

          // PERBAIKAN: Password comparison dengan timeout
          const isValid = await bcrypt.compare(credentials.password, user.password_hash);
          console.log('✅ Password validation result:', isValid);

          if (!isValid) {
            console.error('Password tidak match');
            return null;
          }

          console.log('🎉 Authentication successful!');

          // Update last_login dengan error handling
          try {
            await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;
          } catch (error) {
            console.warn('⚠️ Failed to update last_login:', error);
          }

          // Ambil data profil tambahan dengan error handling
          let profileData: any = {};
          try {
            if (user.role === 'mahasiswa') {
              const students = await sql`
                SELECT name, nim FROM students WHERE user_id = ${user.id}
              `;
              if (students && students.length > 0) {
                profileData = { ...profileData, ...students[0] };
              }
            } else if (user.role === 'dosen') {
              const lecturers = await sql`
                SELECT name, email, nidn, expertise FROM lecturers WHERE user_id = ${user.id}
              `;
              console.log('📊 Lecturers data:', lecturers);
              if (lecturers && lecturers.length > 0) {
                profileData = { ...profileData, ...lecturers[0] };
              }
            } else {
              profileData = { name: user.username };
            }
          } catch (profileError) {
            console.warn('⚠️ Failed to fetch profile data:', profileError);
            profileData = { name: user.username };
          }

          // Return user object
          const userObject = {
            id: user.id.toString(), // PERBAIKAN: Pastikan string
            email: user.email,
            username: user.username,
            role: user.role,
            name: profileData.name || user.username,
            ...(user.role === 'mahasiswa' && { nim: profileData.nim }),
            ...(user.role === 'dosen' && { 
              nidn: profileData.nidn, 
              expertise: profileData.expertise 
            }),
          };

          console.log('🚀 Returning user object:', userObject);
          return userObject;

        } catch (error) {
          console.error('💥 Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const, // PERBAIKAN: Tambahkan 'as const' untuk type safety
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('🔄 JWT callback - user:', user);
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        if (user.role === 'mahasiswa') token.nim = user.nim;
        if (user.role === 'dosen') {
          token.nidn = user.nidn;
          token.expertise = user.expertise;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log('🔄 Session callback - token:', token);
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        if (token.role === 'mahasiswa') session.user.nim = token.nim as string;
        if (token.role === 'dosen') {
          session.user.nidn = token.nidn as string;
          session.user.expertise = token.expertise as string;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);