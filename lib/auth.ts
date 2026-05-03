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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password_hash || !user.is_active) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isValid) {
            return null;
          }

          // Update last_login
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { last_login: new Date() }
            });
          } catch {
            // Silently fail — not critical
          }

          // Ambil data profil tambahan
          let profileData: { name?: string; nim?: string; nidn?: string; expertise?: string } = {};
          try {
            if (user.role === 'mahasiswa') {
              const student = await prisma.student.findFirst({
                where: { user_id: user.id },
                select: { name: true, nim: true }
              });
              if (student) {
                profileData = student;
              }
            } else if (user.role === 'dosen') {
              const lecturer = await prisma.lecturer.findFirst({
                where: { user_id: user.id },
                select: { name: true, email: true, nidn: true, expertise: true }
              });
              if (lecturer) {
                profileData = lecturer;
              }
            } else {
              profileData = { name: user.username };
            }
          } catch {
            profileData = { name: user.username };
          }

          return {
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

        } catch {
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