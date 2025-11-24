// components/forum/ForumThreadList.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Clock, Eye, ThumbsUp } from 'lucide-react';
import Link from 'next/link';

// Definisikan tipe untuk thread
interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: {
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  isPinned: boolean;
  isLocked: boolean;
}

interface ForumThreadListProps {
  threads: ForumThread[];
  categorySlug: string;
}

export default function ForumThreadList({ threads, categorySlug }: ForumThreadListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    
    return formatDate(dateString);
  };

  return (
    <div className="space-y-4">
      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Thread</h3>
            <p className="text-muted-foreground mb-6">
              Jadilah yang pertama memulai diskusi di kategori ini.
            </p>
            <Button asChild>
              <Link href={`/forum/${categorySlug}/buat-thread`}>
                Buat Thread Pertama
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        threads.map((thread) => (
          <Card key={thread.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Author Avatar & Stats */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {thread.author.name}
                  </div>
                </div>

                {/* Thread Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                        <Link href={`/forum/thread/${thread.id}`}>
                          {thread.title}
                        </Link>
                      </h3>
                      {thread.isPinned && (
                        <Badge variant="default" className="bg-yellow-500">
                          Disematkan
                        </Badge>
                      )}
                      {thread.isLocked && (
                        <Badge variant="secondary">Terkunci</Badge>
                      )}
                    </div>
                    <Badge variant="outline">
                      {thread.category.name}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {thread.content}
                  </p>

                  {/* Thread Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(thread.createdAt)}</span>
                      </div>
                      {thread.updatedAt !== thread.createdAt && (
                        <div className="flex items-center gap-1">
                          <span>Diedit {formatTimeAgo(thread.updatedAt)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{thread.replyCount} balasan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{thread.viewCount} dilihat</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{thread.likeCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}