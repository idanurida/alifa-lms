// app/(dashboard)/chat/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import ChatClient from './ChatClient';

const GROUP_CHATS = [
  { id: 'umum', name: '💬 Chat Umum', description: 'Obrolan bebas seluruh civitas' },
  { id: 'akademik', name: '📚 Diskusi Akademik', description: 'Tanya jawab seputar kuliah' },
  { id: 'tugas', name: '📝 Tugas & Proyek', description: 'Kolaborasi tugas kelompok' },
  { id: 'info', name: '📢 Informasi', description: 'Pengumuman penting' },
];

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <div className="p-8 text-center">Unauthorized</div>;

  // Get users for DM
  let users: any[] = [];
  try {
    users = await sql`
      SELECT id, username, role, email FROM users WHERE id != ${parseInt(session.user.id)} AND is_active = true ORDER BY role, username
    `;
  } catch {}

  // Dapatkan role yang user-friendly
  const roleLabels: Record<string, string> = {
    super_admin: 'Admin',
    staff_akademik: 'Staf Akademik',
    staff_keuangan: 'Staf Keuangan',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa',
  };

  return (
    <ChatClient
      userId={parseInt(session.user.id)}
      userName={session.user.name || session.user.username || 'User'}
      userRole={session.user.role}
      groups={GROUP_CHATS}
      users={users.map(u => ({ ...u, role_label: roleLabels[u.role] || u.role }))}
    />
  );
}
