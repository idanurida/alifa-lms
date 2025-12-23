// app/(dashboard)/forum/thread/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, Pin, Lock, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export default async function ForumThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  const threadId = parseInt(id);
  if (isNaN(threadId)) notFound();

  let thread, posts = [];
  try {
    // Ambil detail thread
    const [threadResult] = await sql`
      SELECT 
        ft.id, ft.user_id, ft.title, ft.is_pinned, ft.is_locked,
        ft.view_count, ft.created_at,
        p.name as user_name, u.role as user_role,
        ft.category as category_name
      FROM forum_threads ft
      JOIN users u ON ft.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE ft.id = ${threadId}
    `;
    thread = threadResult;
    if (!thread) notFound();

    // Update view count
    await sql`UPDATE forum_threads SET view_count = view_count + 1 WHERE id = ${threadId}`;

    // Ambil semua post dalam thread ini
    posts = await sql`
      SELECT 
        fp.id, fp.thread_id, fp.user_id, fp.content, fp.is_first_post, fp.created_at, fp.updated_at,
        p.name as user_name, u.role as user_role
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE fp.thread_id = ${threadId}
      ORDER BY fp.created_at ASC
    `;
  } catch (error) {
    console.error('Failed to fetch forum thread or posts:', error);
    notFound();
  }

  // Server Action untuk submit post baru
  const submitPost = async (formData: FormData) => {
    'use server'
    const currentSession = await getServerSession(authOptions);
    if (!currentSession || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(currentSession.user.role as string)) {
      // Handle unauthorized access
      return;
    }

    const content = formData.get('content') as string;
    if (!content || content.trim() === '') {
      // Handle validation error
      return;
    }

    // Cek apakah thread terkunci
    const [threadCheck] = await sql`SELECT is_locked FROM forum_threads WHERE id = ${threadId}`;
    if (threadCheck.is_locked) {
      // Handle error: thread locked
      return;
    }

    try {
      const [lecturer] = await sql`SELECT id FROM lecturers WHERE user_id = ${currentSession.user.id}`;
      const [student] = await sql`SELECT id FROM students WHERE user_id = ${currentSession.user.id}`;
      const userId = lecturer?.id || student?.id; // Ambil id dari lecturer atau student

      if (!userId) {
        // Handle error: user profile not found
        return;
      }

      await sql`
        INSERT INTO forum_posts (thread_id, user_id, content, is_first_post)
        VALUES (${threadId}, ${userId}, ${content}, false)
      `;

      // Redirect ke thread yang sama setelah submit
      // Karena ini server action, redirect harus dilakukan di client atau dengan Response
      // Misalnya, Anda bisa setelah action selesai, lalu refresh halaman
    } catch (error) {
      console.error('Failed to submit post:', error);
      // Handle error
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Forum Diskusi</p>
        <p className="text-muted-foreground text-sm">
          <Link href={`/forum/${thread.category_slug}`} className="hover:underline">
            {thread.category_name}
          </Link>
          {' > '}
          {thread.title}
        </p>
      </div>

      {/* Thread Header */}
      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {thread.is_pinned && <Pin className="text-supabase-green" size={18} />}
                {thread.is_locked && <Lock className="text-destructive" size={18} />}
                {thread.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <User size={14} />
                <span>{thread.user_name}</span>
                <span>•</span>
                <span>{formatDate(thread.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {session.user.role === 'super_admin' && (
                <>
                  <Button size="sm" variant="outline">
                    {thread.is_pinned ? 'Batal Pin' : 'Pin'}
                  </Button>
                  <Button size="sm" variant="outline">
                    {thread.is_locked ? 'Buka Kunci' : 'Kunci'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post: any) => (
          <Card key={post.id} className="glass-effect dark:glass-effect-dark">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  <span className="font-medium">{post.user_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {post.user_role}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {!thread.is_locked && (
        <Card className="glass-effect dark:glass-effect-dark">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare size={16} />
              Tulis Balasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={submitPost} className="space-y-4">
              <textarea
                name="content"
                placeholder="Tulis balasan Anda di sini..."
                required
                className="w-full p-3 border rounded-md bg-background text-foreground min-h-[100px]"
              ></textarea>
              <div className="flex justify-end">
                <Button type="submit">
                  <Send size={16} className="mr-2" />
                  Kirim Balasan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Thread Locked Message */}
      {thread.is_locked && (
        <Card className="glass-effect dark:glass-effect-dark">
          <CardContent className="text-center py-4">
            <Lock className="mx-auto text-destructive mb-2" size={24} />
            <p className="text-destructive">Thread ini telah dikunci. Balasan tidak diperbolehkan.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
