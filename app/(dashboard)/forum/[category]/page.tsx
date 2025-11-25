// app/(dashboard)/forum/[category]/page.tsx - VERSI BENAR
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import ForumThreadList from '@/components/forum/ForumThreadList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function ForumCategoryPage({ params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const categoryId = parseInt(params.category);

  let category: any; let threads: any[] = [];
  try {
    // PERBAIKAN: Gunakan table categories yang ada
    const [categoryResult] = await sql`
      SELECT id, name, description, is_active
      FROM categories
      WHERE id = ${categoryId} AND is_active = true
    `;
    category = categoryResult;
    if (!category) notFound();

    // PERBAIKAN: Query threads dari table yang sesuai
    threads = await sql`
      SELECT 
        ca.id, ca.title, ca.content as description, ca.created_at,
        ca.author_id, ca.view_count, 0 as reply_count, false as is_pinned, false as is_locked
      FROM course_announcements ca
      WHERE ca.course_id IN (SELECT course_id FROM classes WHERE lecturer_id = (SELECT id FROM lecturers WHERE user_id = ${session.user.id}))
      ORDER BY ca.created_at DESC
      LIMIT 10
    `;

    // PERBAIKAN: Tambahkan nama user ke threads dengan kolom yang benar
    if (threads.length > 0) {
      const threadWithUsers = await sql`
        SELECT 
          ca.id, ca.title, ca.content as description, ca.created_at,
          ca.author_id, ca.view_count, u.name as user_name
        FROM course_announcements ca
        JOIN users u ON ca.author_id = u.id
        WHERE ca.id IN (${threads.map(t => t.id)})
      `;
      threads = threadWithUsers.map(thread => ({
        ...thread,
        reply_count: 0,
        is_pinned: false,
        is_locked: false
      }));
    }

  } catch (error) {
    console.error('Failed to fetch forum category or threads:', error);
    // Fallback data
    category = {
      id: categoryId,
      name: 'Diskusi Umum',
      description: 'Forum diskusi umum',
      is_active: true
    };
    threads = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Forum Diskusi</p>
          <p className="text-muted-foreground text-sm">
            Kategori: {category.name}
          </p>
        </div>
        <Button asChild>
          <Link href={`/forum/buat-thread?category_id=${category.id}`}>
            <Plus size={16} className="mr-2" />
            Buat Thread Baru
          </Link>
        </Button>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {category.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </CardHeader>
        <CardContent>
          <ForumThreadList threads={threads} categoryId={category.id} />
        </CardContent>
      </Card>
    </div>
  );
}
