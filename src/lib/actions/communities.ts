import { supabase } from '@/lib/supabase';
import { Community } from '@/lib/types';

export async function getCommunities(userId?: string): Promise<Community[]> {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) throw error;

    // Verificar se usuário é membro de cada comunidade
    if (userId && data) {
      const communityIds = data.map(c => c.id);
      const { data: membersData } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', userId)
        .in('community_id', communityIds);

      const memberCommunityIds = new Set(membersData?.map(m => m.community_id) || []);

      return data.map(community => ({
        ...community,
        user_is_member: memberCommunityIds.has(community.id)
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar comunidades:', error);
    return [];
  }
}

export async function toggleCommunityMembership(
  communityId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verificar se já é membro
    const { data: existingMember } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      // Sair da comunidade
      const { error: deleteError } = await supabase
        .from('community_members')
        .delete()
        .eq('id', existingMember.id);

      if (deleteError) throw deleteError;

      // Decrementar contador
      const { data: community } = await supabase
        .from('communities')
        .select('member_count')
        .eq('id', communityId)
        .single();

      if (community) {
        await supabase
          .from('communities')
          .update({ member_count: Math.max(0, community.member_count - 1) })
          .eq('id', communityId);
      }

      return false;
    } else {
      // Entrar na comunidade
      const { error: insertError } = await supabase
        .from('community_members')
        .insert({ community_id: communityId, user_id: userId });

      if (insertError) throw insertError;

      // Incrementar contador
      const { data: community } = await supabase
        .from('communities')
        .select('member_count')
        .eq('id', communityId)
        .single();

      if (community) {
        await supabase
          .from('communities')
          .update({ member_count: community.member_count + 1 })
          .eq('id', communityId);
      }

      return true;
    }
  } catch (error) {
    console.error('Erro ao entrar/sair da comunidade:', error);
    return false;
  }
}
