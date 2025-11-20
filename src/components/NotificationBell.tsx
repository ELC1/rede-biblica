"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUnreadNotificationsCount } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadUnreadCount = async () => {
    const count = await getUnreadNotificationsCount(userId);
    setUnreadCount(count);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
      onClick={() => router.push("/notifications")}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
