import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';

export async function getOrCreateProfile(userId: string): Promise<Profile | null> {
  try {
    // Tentar buscar perfil existente
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Se não existe, criar novo perfil
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        avatar_url: user.user_metadata?.avatar_url || null,
        username: user.email?.split('@')[0] || null
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newProfile;
  } catch (error) {
    console.error('Erro ao buscar/criar perfil:', error);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return null;
  }
}
