import { supabase } from '@/lib/supabase';
import { Post } from '@/lib/types';

export async function getPosts(userId?: string): Promise<Post[]> {
  try {
    // Buscar posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) return [];

    // Buscar perfis dos autores
    const userIds = [...new Set(posts.map(post => post.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Criar mapa de perfis
    const profilesMap = new Map(
      profiles?.map(profile => [profile.id, profile]) || []
    );

    // Verificar se usuário deu like em cada post
    let likedPostIds = new Set<string>();
    if (userId && posts.length > 0) {
      const postIds = posts.map(post => post.id);
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);

      likedPostIds = new Set(likesData?.map(like => like.post_id) || []);
    }

    // Combinar dados
    return posts.map(post => ({
      ...post,
      profiles: profilesMap.get(post.user_id) || null,
      user_has_liked: likedPostIds.has(post.id)
    }));
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return [];
  }
}

export async function createPost(
  userId: string,
  content: string,
  verseReference?: string,
  verseText?: string
): Promise<Post | null> {
  try {
    // Criar post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        verse_reference: verseReference,
        verse_text: verseText,
        likes_count: 0,
        comments_count: 0
      })
      .select()
      .single();

    if (postError) throw postError;

    // Buscar perfil do autor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    return {
      ...post,
      profiles: profile
    };
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return null;
  }
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  try {
    // Verificar se já deu like
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Remover like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;

      // Decrementar contador
      const { data: post } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId);
      }

      return false;
    } else {
      // Adicionar like
      const { error: insertError } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId });

      if (insertError) throw insertError;

      // Incrementar contador
      const { data: post } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId);
      }

      return true;
    }
  } catch (error) {
    console.error('Erro ao dar like:', error);
    return false;
  }
}

export async function getComments(postId: string) {
  try {
    // Buscar comentários
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;
    if (!comments || comments.length === 0) return [];

    // Buscar perfis dos autores
    const userIds = [...new Set(comments.map(comment => comment.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Criar mapa de perfis
    const profilesMap = new Map(
      profiles?.map(profile => [profile.id, profile]) || []
    );

    // Combinar dados
    return comments.map(comment => ({
      ...comment,
      profiles: profilesMap.get(comment.user_id) || null
    }));
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return [];
  }
}

export async function createComment(
  postId: string,
  userId: string,
  content: string
) {
  try {
    // Criar comentário
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content
      })
      .select()
      .single();

    if (commentError) throw commentError;

    // Buscar perfil do autor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Incrementar contador de comentários
    const { data: post } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comments_count: post.comments_count + 1 })
        .eq('id', postId);
    }

    return {
      ...comment,
      profiles: profile
    };
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return null;
  }
}
