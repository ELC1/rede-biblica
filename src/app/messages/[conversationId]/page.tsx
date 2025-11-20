"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMessages, sendMessage, markMessagesAsRead } from "@/lib/actions/messages";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: any;
  read: boolean;
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        loadMessages(conversationId, session.user.id);
      }
      setLoading(false);
    });
  }, [router, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async (convId: string, userId: string) => {
    const data = await getMessages(convId);
    setMessages(data);

    // Identificar o outro usuário
    const other = data.find((m: Message) => m.sender?.id !== userId)?.sender;
    if (other) setOtherUser(other);

    // Marcar mensagens como lidas
    await markMessagesAsRead(convId, userId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message = await sendMessage(conversationId, user.id, newMessage);
    if (message) {
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = formatDate(message.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
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
              <Avatar className="ring-2 ring-[#6366f1] w-10 h-10">
                <AvatarImage src={otherUser?.raw_user_meta_data?.avatar_url} />
                <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                  {otherUser?.raw_user_meta_data?.full_name?.charAt(0) ||
                    otherUser?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-sm font-bold text-white">
                  {otherUser?.raw_user_meta_data?.full_name || otherUser?.email || "Usuário"}
                </h1>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-500 bg-[#1a1a2e] px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>

                <div className="space-y-3">
                  {msgs.map((message) => {
                    const isOwn = message.sender?.id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        {!isOwn && (
                          <Avatar className="ring-2 ring-[#6366f1] w-8 h-8">
                            <AvatarImage
                              src={message.sender?.raw_user_meta_data?.avatar_url}
                            />
                            <AvatarFallback className="bg-[#6366f1] text-white text-xs font-bold">
                              {message.sender?.raw_user_meta_data?.full_name?.charAt(0) ||
                                message.sender?.email?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-[#6366f1] text-white"
                              : "bg-[#1a1a2e] text-gray-300 border border-[#2a2a3e]"
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? "text-blue-200" : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </p>
                        </div>

                        {isOwn && (
                          <Avatar className="ring-2 ring-[#6366f1] w-8 h-8">
                            <AvatarImage
                              src={user?.user_metadata?.avatar_url}
                            />
                            <AvatarFallback className="bg-[#6366f1] text-white text-xs font-bold">
                              {user?.user_metadata?.full_name?.charAt(0) ||
                                user?.email?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-[#2a2a3e] bg-[#1a1a2e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-[#6366f1] hover:bg-[#5558e3] text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
