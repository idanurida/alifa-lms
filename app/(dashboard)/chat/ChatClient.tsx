// app/(dashboard)/chat/ChatClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Users, User, MessageCircle, ArrowLeft, Hash } from 'lucide-react';

interface Group {
  id: string; name: string; description: string;
}

interface UserDM {
  id: number; username: string; role: string; role_label: string; email: string;
}

interface Message {
  id: number; sender_id: number; receiver_id?: number; group_name?: string;
  content: string; created_at: string;
  sender_name: string; sender_role: string;
}

export default function ChatClient({
  userId, userName, userRole, groups, users,
}: {
  userId: number; userName: string; userRole: string;
  groups: Group[]; users: UserDM[];
}) {
  const [activeTab, setActiveTab] = useState<'groups' | 'dm'>('groups');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatName, setChatName] = useState('');
  const [activeDM, setActiveDM] = useState<UserDM | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll messages
  useEffect(() => {
    if (!activeChat && !activeDM) return;

    const fetchMessages = async () => {
      try {
        const params = activeChat
          ? `?group=${activeChat}`
          : `?receiver_id=${activeDM?.id}`;
        const res = await fetch(`/api/chat${params}`);
        const data = await res.json();
        if (data.data) setMessages(data.data);
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll setiap 3 detik
    return () => clearInterval(interval);
  }, [activeChat, activeDM]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const body: any = { content: input.trim() };
      if (activeChat) body.group_name = activeChat;
      if (activeDM) body.receiver_id = activeDM.id;

      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setInput('');
      // Optimistic: add locally
      const newMsg: Message = {
        id: Date.now(), sender_id: userId,
        content: input.trim(), created_at: new Date().toISOString(),
        sender_name: userName, sender_role: userRole,
        ...(activeChat ? { group_name: activeChat } : { receiver_id: activeDM?.id }),
      };
      setMessages(prev => [...prev, newMsg]);
    } catch {}
    setLoading(false);
  };

  const enterGroup = (group: Group) => {
    setActiveChat(group.id); setChatName(group.name); setActiveDM(null);
  };
  const enterDM = (user: UserDM) => {
    setActiveDM(user); setActiveChat(null); setChatName(user.username);
  };
  const goBack = () => { setActiveChat(null); setActiveDM(null); setMessages([]); };

  const isInChat = activeChat || activeDM;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <Card className={`${isInChat ? 'hidden md:block' : 'block'} w-full md:w-72 flex-shrink-0`}>
        <CardContent className="p-4">
          <div className="flex gap-2 mb-4">
            <Button variant={activeTab === 'groups' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setActiveTab('groups')}>
              <Users className="h-4 w-4 mr-1" /> Grup
            </Button>
            <Button variant={activeTab === 'dm' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setActiveTab('dm')}>
              <User className="h-4 w-4 mr-1" /> DM
            </Button>
          </div>

          <div className="space-y-1">
            {activeTab === 'groups' && groups.map(g => (
              <button key={g.id} onClick={() => enterGroup(g)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${activeChat === g.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
                <div>{g.name}</div>
                <div className="text-xs text-muted-foreground truncate">{g.description}</div>
              </button>
            ))}

            {activeTab === 'dm' && users.map(u => (
              <button key={u.id} onClick={() => enterDM(u)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${activeDM?.id === u.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{u.username}</span>
                  <Badge variant="outline" className="text-[10px]">{u.role_label}</Badge>
                </div>
                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {!isInChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Pilih grup atau kontak untuk mulai chat</p>
              <p className="text-sm mt-1">Chat real-time dengan dosen dan mahasiswa</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={goBack} className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Hash className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{chatName}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeChat ? 'Grup Chat' : 'Direct Message'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Belum ada pesan. Kirim pesan pertama!
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === userId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {!isMe && activeChat && (
                        <p className="text-[10px] font-bold opacity-70 mb-1">{msg.sender_name}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="text-[10px] opacity-50 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ketik pesan..."
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
