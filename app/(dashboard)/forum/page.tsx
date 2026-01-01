// app/(dashboard)/forum/page.tsx - VERSI BENAR
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { MessageSquare, Search, Users, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ForumDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Unauthorized</div>;
  }

  let categories: any[] = [];
  let recentThreads: any[] = [];

  try {
    // PERBAIKAN: Query yang benar untuk forum_categories
    categories = await sql`
      SELECT 
        id,
        name,
        description,
        is_active
      FROM public.forum_categories 
      WHERE is_active = true
      ORDER BY name
      LIMIT 6
    `;

    // PERBAIKAN: Query yang benar untuk forum_threads & posts
    recentThreads = await sql`
      SELECT 
        ft.id,
        ft.title,
        fp.content,
        ft.created_at,
        fc.name as category_name,
        COALESCE(s.name, l.name, u.username) as author_name,
        (SELECT COUNT(*) FROM public.forum_posts WHERE thread_id = ft.id) - 1 as reply_count
      FROM public.forum_threads ft
      JOIN public.forum_categories fc ON ft.category_id = fc.id
      JOIN public.forum_posts fp ON ft.id = fp.thread_id AND fp.is_first_post = true
      JOIN public.users u ON ft.user_id = u.id
      LEFT JOIN public.students s ON u.id = s.user_id
      LEFT JOIN public.lecturers l ON u.id = l.user_id
      ORDER BY ft.created_at DESC
      LIMIT 5
    `;

    // Tambahkan thread_count asli dari database ke categories
    const counts = await sql`
      SELECT category_id, COUNT(*) as count 
      FROM public.forum_threads 
      GROUP BY category_id
    `;

    const countMap = Object.fromEntries(counts.map((c: any) => [c.category_id, Number(c.count)]));

    categories = categories.map(cat => ({
      ...cat,
      thread_count: countMap[cat.id] || 0
    }));

  } catch (error) {
    console.error('Failed to fetch forum data:', error);

    // Fallback data untuk development
    categories = [
      {
        id: 1,
        name: 'Umum',
        description: 'Diskusi umum seputar kampus',
        thread_count: 24,
        is_active: true
      },
      {
        id: 2,
        name: 'Akademik',
        description: 'Diskusi mata kuliah dan pembelajaran',
        thread_count: 56,
        is_active: true
      }
    ];

    recentThreads = [
      {
        id: 1,
        title: 'Tips belajar efektif untuk UTS',
        content: 'Bagaimana cara belajar yang efektif...',
        author_name: 'Budi Santoso',
        category_name: 'Akademik',
        created_at: new Date().toISOString(),
        reply_count: 8,
        view_count: 45
      }
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Forum Diskusi</h1>
          <p className="text-muted-foreground">
            Berdiskusi dengan dosen dan mahasiswa lainnya
          </p>
        </div>
        <Button asChild>
          <Link href="/forum/buat-thread" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Thread
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Cari diskusi..."
          className="pl-10"
        />
      </div>

      {/* Kategori Forum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kategori Forum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: any) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <Badge variant="secondary">{category.thread_count}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{category.thread_count} thread</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Aktif</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                    <Link href={`/forum/${category.id}`}>
                      Lihat Kategori
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thread Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Diskusi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentThreads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada diskusi</p>
              <Button asChild className="mt-4">
                <Link href="/forum/buat-thread">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Diskusi Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentThreads.map((thread: any) => (
                <div key={thread.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium hover:text-primary transition-colors">
                        <Link href={`/forum/thread/${thread.id}`}>
                          {thread.title}
                        </Link>
                      </h3>
                      <Badge variant="outline">{thread.category_name}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {thread.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{thread.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{thread.reply_count} balasan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(thread.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
