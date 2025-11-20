"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Bell, Heart, MessageCircle, Users, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notifications";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
  actor?: any;
  post?: any;
  community?: any;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        loadNotifications(session.user.id);
      }
      setLoading(false);
    });
  }, [router]);

  const loadNotifications = async (userId: string) => {
    const data = await getNotifications(userId);
    setNotifications(data);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.id);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-400" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case "follow":
      case "community_invite":
        return <Users className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
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
                <h1 className="text-xl font-bold text-white">Notificações</h1>
                <p className="text-xs text-gray-400">
                  {notifications.filter((n) => !n.read).length} não lidas
                </p>
              </div>
            </div>

            {notifications.some((n) => !n.read) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#6366f1] hover:text-white hover:bg-[#2a2a3e]"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {notifications.length === 0 ? (
          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-400">
                Você está em dia! Quando houver novidades, elas aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-[#1a1a2e] border-[#2a2a3e] cursor-pointer transition-all hover:border-[#6366f1]/30 ${
                  !notification.read ? "border-l-4 border-l-[#6366f1]" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {notification.actor ? (
                        <Avatar className="ring-2 ring-[#6366f1]">
                          <AvatarImage
                            src={notification.actor.raw_user_meta_data?.avatar_url}
                          />
                          <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                            {notification.actor.raw_user_meta_data?.full_name?.charAt(0) ||
                              notification.actor.email?.charAt(0).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#6366f1] flex-shrink-0 mt-1"></div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {notification.read && (
                          <Check className="w-3 h-3 text-gray-600" />
                        )}
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
