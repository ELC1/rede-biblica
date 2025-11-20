"use server";

import { supabase } from "@/lib/supabase";

export async function getConversations(userId: string) {
  try {
    const { data, error } = await supabase
      .from("conversation_participants")
      .select(`
        conversation:conversation_id(
          id,
          created_at,
          updated_at,
          participants:conversation_participants(
            user:user_id(id, email, raw_user_meta_data)
          ),
          messages(
            id,
            content,
            created_at,
            sender:sender_id(id, email, raw_user_meta_data),
            read
          )
        )
      `)
      .eq("user_id", userId)
      .order("conversation_id", { ascending: false });

    if (error) throw error;

    // Processar dados para formato mais amigável
    const conversations = data?.map((item: any) => {
      const conv = item.conversation;
      const otherParticipant = conv.participants?.find(
        (p: any) => p.user?.id !== userId
      );
      const lastMessage = conv.messages?.[conv.messages.length - 1];

      return {
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        other_user: otherParticipant?.user,
        last_message: lastMessage,
        unread_count: conv.messages?.filter((m: any) => !m.read && m.sender?.id !== userId).length || 0,
      };
    }) || [];

    return conversations;
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return [];
  }
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  try {
    // Buscar conversa existente
    const { data: existingConv, error: searchError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (searchError) throw searchError;

    // Verificar se existe conversa com o outro usuário
    for (const conv of existingConv || []) {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conv.conversation_id);

      const userIds = participants?.map((p) => p.user_id) || [];
      if (userIds.includes(otherUserId) && userIds.length === 2) {
        return conv.conversation_id;
      }
    }

    // Criar nova conversa
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

    if (createError) throw createError;

    // Adicionar participantes
    await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, user_id: userId },
      { conversation_id: newConv.id, user_id: otherUserId },
    ]);

    return newConv.id;
  } catch (error) {
    console.error("Erro ao criar/buscar conversa:", error);
    return null;
  }
}

export async function getMessages(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(id, email, raw_user_meta_data)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select(`
        *,
        sender:sender_id(id, email, raw_user_meta_data)
      `)
      .single();

    if (error) throw error;

    // Atualizar timestamp da conversa
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("read", false);

    if (error) throw error;

    // Atualizar last_read_at
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);

    return true;
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
    return false;
  }
}
