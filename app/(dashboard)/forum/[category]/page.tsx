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

export default async function ForumCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryParam } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const categoryId = parseInt(categoryParam);

  let category: any; let threads: any[] = [];
  try {
    // PERBAIKAN: Gunakan table forum_categories yang ada
    const [categoryResult] = await sql`
      SELECT id, name, description, is_active
      FROM public.forum_categories
      WHERE id = ${categoryId} AND is_active = true
    `;
    category = categoryResult;
    if (!category) notFound();

    // PERBAIKAN: Query threads dari table yang sesuai dengan join author
    threads = await sql`
      SELECT 
        ft.id, 
        ft.title, 
        fp.content as description, 
        ft.created_at,
        ft.user_id as author_id, 
        COALESCE(s.name, l.name, u.username) as user_name,
        (SELECT COUNT(*) FROM public.forum_posts WHERE thread_id = ft.id) - 1 as reply_count,
        ft.is_pinned, 
        ft.is_locked
      FROM public.forum_threads ft
      JOIN public.forum_posts fp ON ft.id = fp.thread_id AND fp.is_first_post = true
      JOIN public.users u ON ft.user_id = u.id
      LEFT JOIN public.students s ON u.id = s.user_id
      LEFT JOIN public.lecturers l ON u.id = l.user_id
      WHERE ft.category_id = ${categoryId}
      ORDER BY ft.is_pinned DESC, ft.created_at DESC
      LIMIT 20
    `;

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
          <ForumThreadList threads={threads} categorySlug={categoryParam} />
        </CardContent>
      </Card>
    </div>
  );
}
