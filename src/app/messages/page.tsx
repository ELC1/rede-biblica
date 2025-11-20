"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MessageCircle, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getConversations } from "@/lib/actions/messages";

interface Conversation {
  id: string;
  other_user: any;
  last_message: any;
  unread_count: number;
  updated_at: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        loadConversations(session.user.id);
      }
      setLoading(false);
    });
  }, [router]);

  const loadConversations = async (userId: string) => {
    const data = await getConversations(userId);
    setConversations(data);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Agora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString("pt-BR");
  };

  const filteredConversations = conversations.filter((conv) => {
    const userName =
      conv.other_user?.raw_user_meta_data?.full_name ||
      conv.other_user?.email ||
      "";
    return userName.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a2e] border-b border-[#2a2a3e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Mensagens</h1>
                <p className="text-xs text-gray-400">
                  {conversations.reduce((acc, c) => acc + c.unread_count, 0)} não lidas
                </p>
              </div>
            </div>

            <Button
              size="icon"
              className="bg-[#6366f1] hover:bg-[#5558e3] text-white"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="pb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10 bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredConversations.length === 0 ? (
          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {search ? "Nenhuma conversa encontrada" : "Nenhuma mensagem ainda"}
              </h3>
              <p className="text-gray-400">
                {search
                  ? "Tente buscar por outro nome"
                  : "Comece uma conversa com outros membros da comunidade"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="bg-[#1a1a2e] border-[#2a2a3e] cursor-pointer transition-all hover:border-[#6366f1]/30"
                onClick={() => router.push(`/messages/${conversation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="ring-2 ring-[#6366f1] w-12 h-12">
                      <AvatarImage
                        src={conversation.other_user?.raw_user_meta_data?.avatar_url}
                      />
                      <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                        {conversation.other_user?.raw_user_meta_data?.full_name?.charAt(0) ||
                          conversation.other_user?.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">
                            {conversation.other_user?.raw_user_meta_data?.full_name ||
                              conversation.other_user?.email ||
                              "Usuário"}
                          </p>
                          {conversation.last_message && (
                            <p
                              className={`text-sm mt-1 truncate ${
                                conversation.unread_count > 0
                                  ? "text-white font-semibold"
                                  : "text-gray-400"
                              }`}
                            >
                              {conversation.last_message.sender?.id === user?.id && "Você: "}
                              {conversation.last_message.content}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-500">
                            {conversation.last_message
                              ? formatTimeAgo(conversation.last_message.created_at)
                              : formatTimeAgo(conversation.updated_at)}
                          </span>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-[#6366f1] text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                              {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
