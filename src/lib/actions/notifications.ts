"use server";

import { supabase } from "@/lib/supabase";

export async function getNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:actor_id(id, email, raw_user_meta_data),
        post:post_id(id, content),
        community:community_id(id, name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    return false;
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Erro ao contar notificações não lidas:", error);
    return 0;
  }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  actorId?: string,
  link?: string,
  postId?: string,
  communityId?: string
) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        actor_id: actorId,
        link,
        post_id: postId,
        community_id: communityId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
}
