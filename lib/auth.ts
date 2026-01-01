// lib/auth.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

        // Backdoor telah dihapus

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log('📊 Database result:', user);

          if (!user) {
            console.error('User tidak ditemukan di database');
            return null;
          }
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

          const isValid = await bcrypt.compare(credentials.password, user.password_hash);
          console.log('✅ Password validation result:', isValid);

          if (!isValid) {
            console.error('Password tidak match');
            return null;
          }

          console.log('🎉 Authentication successful!');

          // Update last_login dengan error handling
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { last_login: new Date() }
            });
          } catch (error) {
            console.warn('⚠️ Failed to update last_login:', error);
          }

          // Ambil data profil tambahan dengan error handling
          let profileData: any = {};
          try {
            if (user.role === 'mahasiswa') {
              const student = await prisma.student.findFirst({
                where: { user_id: user.id },
                select: { name: true, nim: true }
              });
              if (student) {
                profileData = { ...profileData, ...student };
              }
            } else if (user.role === 'dosen') {
              const lecturer = await prisma.lecturer.findFirst({
                where: { user_id: user.id },
                select: { name: true, email: true, nidn: true, expertise: true }
              });
              console.log('📊 Lecturer data:', lecturer);
              if (lecturer) {
                profileData = { ...profileData, ...lecturer };
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
            id: user.id.toString(),
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
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('🔄 JWT callback - Received User:', JSON.stringify(user, null, 2));
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
      console.log('🔄 Session callback - Token content:', JSON.stringify(token, null, 2));
      if (token && session.user) {
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
  cookies: {
    sessionToken: {
      name: process.env.SESSION_NAME || 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);