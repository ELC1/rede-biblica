"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Book, Home, Users, Heart, MessageCircle, Share2, Search, Plus, BookOpen, Sparkles, Bookmark, TrendingUp, Bell, LogOut, Send, User, Settings, Globe, Mail, Trophy, Edit, BarChart3, Facebook, Twitter, Linkedin } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getPosts, createPost, toggleLike, getComments, createComment } from "@/lib/actions/posts";
import { getCommunities, toggleCommunityMembership } from "@/lib/actions/communities";
import { getOrCreateProfile } from "@/lib/actions/profiles";
import { Post, Community } from "@/lib/types";

const bibleBooks = [
  { name: "Gênesis", chapters: 50, testament: "Antigo" },
  { name: "Êxodo", chapters: 40, testament: "Antigo" },
  { name: "Levítico", chapters: 27, testament: "Antigo" },
  { name: "Números", chapters: 36, testament: "Antigo" },
  { name: "Deuteronômio", chapters: 34, testament: "Antigo" },
  { name: "Josué", chapters: 24, testament: "Antigo" },
  { name: "Juízes", chapters: 21, testament: "Antigo" },
  { name: "Rute", chapters: 4, testament: "Antigo" },
  { name: "1 Samuel", chapters: 31, testament: "Antigo" },
  { name: "2 Samuel", chapters: 24, testament: "Antigo" },
  { name: "1 Reis", chapters: 22, testament: "Antigo" },
  { name: "2 Reis", chapters: 25, testament: "Antigo" },
  { name: "Salmos", chapters: 150, testament: "Antigo" },
  { name: "Provérbios", chapters: 31, testament: "Antigo" },
  { name: "Isaías", chapters: 66, testament: "Antigo" },
  { name: "Jeremias", chapters: 52, testament: "Antigo" },
  { name: "Mateus", chapters: 28, testament: "Novo" },
  { name: "Marcos", chapters: 16, testament: "Novo" },
  { name: "Lucas", chapters: 24, testament: "Novo" },
  { name: "João", chapters: 21, testament: "Novo" },
  { name: "Atos", chapters: 28, testament: "Novo" },
  { name: "Romanos", chapters: 16, testament: "Novo" },
  { name: "1 Coríntios", chapters: 16, testament: "Novo" },
  { name: "2 Coríntios", chapters: 13, testament: "Novo" },
  { name: "Gálatas", chapters: 6, testament: "Novo" },
  { name: "Efésios", chapters: 6, testament: "Novo" },
  { name: "Filipenses", chapters: 4, testament: "Novo" },
  { name: "Colossenses", chapters: 4, testament: "Novo" },
  { name: "1 Tessalonicenses", chapters: 5, testament: "Novo" },
  { name: "2 Tessalonicenses", chapters: 3, testament: "Novo" },
  { name: "Apocalipse", chapters: 22, testament: "Novo" },
];

export default function FeConnect() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [searchBible, setSearchBible] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPostComments, setSelectedPostComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState<Post | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        await getOrCreateProfile(session.user.id);
        loadPosts(session.user.id);
        loadCommunities(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loadPosts = async (userId: string) => {
    const data = await getPosts(userId);
    setPosts(data);
  };

  const loadCommunities = async (userId: string) => {
    const data = await getCommunities(userId);
    setCommunities(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.user_has_liked;
    
    setPosts(posts.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            likes_count: wasLiked ? p.likes_count - 1 : p.likes_count + 1,
            user_has_liked: !wasLiked
          } 
        : p
    ));

    await toggleLike(postId, user.id);
  };

  const handleNewPost = async () => {
    if (!newPost.trim() || !user) return;

    const post = await createPost(user.id, newPost);
    if (post) {
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  const handleToggleCommunity = async (communityId: string) => {
    if (!user) return;

    const community = communities.find(c => c.id === communityId);
    if (!community) return;

    const wasMember = community.user_is_member;

    setCommunities(communities.map(c =>
      c.id === communityId
        ? {
            ...c,
            member_count: wasMember ? c.member_count - 1 : c.member_count + 1,
            user_is_member: !wasMember
          }
        : c
    ));

    await toggleCommunityMembership(communityId, user.id);
  };

  const handleOpenComments = async (postId: string) => {
    setSelectedPostComments(postId);
    setLoadingComments(true);
    const commentsData = await getComments(postId);
    setComments(commentsData);
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !selectedPostComments) return;

    const comment = await createComment(selectedPostComments, user.id, newComment);
    if (comment) {
      setComments([...comments, comment]);
      setNewComment("");
      
      setPosts(posts.map(p =>
        p.id === selectedPostComments
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));
    }
  };

  const handleSharePost = (post: Post) => {
    setSelectedPostToShare(post);
    setShareDialogOpen(true);
  };

  const shareToSocial = (platform: string) => {
    if (!selectedPostToShare) return;
    
    const text = encodeURIComponent(selectedPostToShare.content);
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      setShareDialogOpen(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1]"></div>
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header Dark */}
      <header className="sticky top-0 z-50 bg-[#1a1a2e] border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-[#6366f1] p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">FéConnect</h1>
            </div>
            
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && <NotificationBell userId={user.id} />}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                onClick={() => router.push("/messages")}
              >
                <Mail className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                onClick={() => router.push("/profile/edit")}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Avatar className="cursor-pointer ring-2 ring-[#6366f1]" onClick={() => setActiveTab("profile")}>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Esquerda */}
          <aside className="hidden lg:block lg:col-span-3">
            <Card className="sticky top-24 bg-[#1a1a2e] border-[#2a2a3e]">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button 
                    variant={activeTab === "feed" ? "default" : "ghost"} 
                    className={`w-full justify-start gap-3 ${
                      activeTab === "feed" 
                        ? "bg-[#6366f1] text-white hover:bg-[#5558e3]" 
                        : "text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                    }`}
                    onClick={() => setActiveTab("feed")}
                  >
                    <Home className="w-5 h-5" />
                    Início
                  </Button>
                  <Button 
                    variant={activeTab === "bible" ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      activeTab === "bible" 
                        ? "bg-[#6366f1] text-white hover:bg-[#5558e3]" 
                        : "text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                    }`}
                    onClick={() => setActiveTab("bible")}
                  >
                    <Book className="w-5 h-5" />
                    Bíblia
                  </Button>
                  <Button 
                    variant={activeTab === "communities" ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      activeTab === "communities" 
                        ? "bg-[#6366f1] text-white hover:bg-[#5558e3]" 
                        : "text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                    }`}
                    onClick={() => setActiveTab("communities")}
                  >
                    <Users className="w-5 h-5" />
                    Comunidades
                  </Button>
                  <Button 
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      activeTab === "profile" 
                        ? "bg-[#6366f1] text-white hover:bg-[#5558e3]" 
                        : "text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="w-5 h-5" />
                    Perfil
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                    onClick={() => router.push("/achievements")}
                  >
                    <Trophy className="w-5 h-5" />
                    Conquistas
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                    onClick={() => router.push("/admin/analytics")}
                  >
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                  </Button>
                </nav>

                <div className="mt-6 pt-6 border-t border-[#2a2a3e]">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6366f1]" />
                    Versículo do Dia
                  </h3>
                  <div className="bg-[#0f0f1a] p-4 rounded-lg border border-[#2a2a3e]">
                    <p className="text-sm text-gray-300 italic mb-2 leading-relaxed">
                      "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."
                    </p>
                    <p className="text-xs text-[#6366f1] font-semibold flex items-center gap-1">
                      <Book className="w-3 h-3" />
                      João 3:16
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Conteúdo Principal */}
          <main className="lg:col-span-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 lg:hidden bg-[#1a1a2e] border border-[#2a2a3e] h-12 p-1">
                <TabsTrigger 
                  value="feed" 
                  className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                >
                  <Home className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger 
                  value="bible" 
                  className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                >
                  <Book className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger 
                  value="communities" 
                  className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                >
                  <Users className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                >
                  <User className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-4">
                {/* Criar Post */}
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="ring-2 ring-[#6366f1]">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea 
                          placeholder="Compartilhe algo..." 
                          className="min-h-[100px] resize-none bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <Button variant="outline" size="sm" className="gap-2 border-[#2a2a3e] hover:bg-[#2a2a3e] text-gray-400">
                            <Book className="w-4 h-4" />
                            Versículo
                          </Button>
                          <Button 
                            className="bg-[#6366f1] hover:bg-[#5558e3] text-white"
                            onClick={handleNewPost}
                            disabled={!newPost.trim()}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Publicar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts */}
                {posts.map((post) => (
                  <Card key={post.id} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#6366f1]/30 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="ring-2 ring-[#6366f1]">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                            {post.profiles?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{post.profiles?.full_name || "Usuário"}</h3>
                          <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 leading-relaxed">{post.content}</p>
                      
                      {post.verse_reference && (
                        <div className="bg-[#0f0f1a] border-l-4 border-[#6366f1] p-3 rounded-r">
                          <div className="flex items-center gap-2">
                            <Book className="w-4 h-4 text-[#6366f1]" />
                            <p className="text-sm font-semibold text-[#6366f1]">{post.verse_reference}</p>
                          </div>
                          {post.verse_text && (
                            <p className="text-sm text-gray-400 mt-2 italic">{post.verse_text}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-3 border-t border-[#2a2a3e]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`gap-2 ${
                            post.user_has_liked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-white"
                          } hover:bg-[#2a2a3e]`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`w-5 h-5 ${post.user_has_liked ? "fill-current" : ""}`} />
                          <span className="font-semibold">{post.likes_count}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                          onClick={() => handleOpenComments(post.id)}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-semibold">{post.comments_count}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e]"
                          onClick={() => handleSharePost(post)}
                        >
                          <Share2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {posts.length === 0 && (
                  <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                    <CardContent className="p-12 text-center">
                      <Sparkles className="w-12 h-12 text-[#6366f1] mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Nenhum post ainda</h3>
                      <p className="text-gray-400">Seja o primeiro a compartilhar algo!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="bible" className="space-y-6">
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader className="bg-[#0f0f1a] border-b border-[#2a2a3e]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Bíblia Sagrada</h2>
                        <p className="text-sm text-gray-400">A Palavra de Deus</p>
                      </div>
                      <div className="bg-[#6366f1] p-3 rounded-lg">
                        <Book className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="relative mt-4">
                      <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input 
                        placeholder="Buscar livro..." 
                        className="pl-10 bg-[#1a1a2e] border-[#2a2a3e] text-white placeholder:text-gray-500"
                        value={searchBible}
                        onChange={(e) => setSearchBible(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="old" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-[#0f0f1a] p-1 h-12">
                        <TabsTrigger 
                          value="old" 
                          className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                        >
                          Antigo Testamento
                        </TabsTrigger>
                        <TabsTrigger 
                          value="new" 
                          className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                        >
                          Novo Testamento
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="old" className="mt-6">
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {bibleBooks
                              .filter(book => book.testament === "Antigo")
                              .map((book) => (
                                <Button
                                  key={book.name}
                                  variant="outline"
                                  className="justify-between h-auto py-4 px-4 bg-[#0f0f1a] border-[#2a2a3e] hover:bg-[#2a2a3e] hover:border-[#6366f1] text-white"
                                  onClick={() => setSelectedBook(book.name)}
                                >
                                  <span className="font-semibold">{book.name}</span>
                                  <span className="text-sm text-gray-500">{book.chapters} cap.</span>
                                </Button>
                              ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="new" className="mt-6">
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {bibleBooks
                              .filter(book => book.testament === "Novo")
                              .map((book) => (
                                <Button
                                  key={book.name}
                                  variant="outline"
                                  className="justify-between h-auto py-4 px-4 bg-[#0f0f1a] border-[#2a2a3e] hover:bg-[#2a2a3e] hover:border-[#6366f1] text-white"
                                  onClick={() => setSelectedBook(book.name)}
                                >
                                  <span className="font-semibold">{book.name}</span>
                                  <span className="text-sm text-gray-500">{book.chapters} cap.</span>
                                </Button>
                              ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>

                    {selectedBook && (
                      <div className="mt-6 p-5 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="w-6 h-6 text-[#6366f1]" />
                          <h3 className="font-bold text-xl text-white">{selectedBook}</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Selecione um capítulo para começar a leitura.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communities" className="space-y-4">
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-white">Comunidades</h2>
                    <p className="text-sm text-gray-400">Conecte-se com outros irmãos</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {communities.map((community, idx) => {
                      const colors = [
                        "bg-[#6366f1]",
                        "bg-[#8b5cf6]",
                        "bg-[#a855f7]",
                        "bg-[#d946ef]"
                      ];
                      return (
                        <div key={community.id} className="flex items-center justify-between p-4 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e] hover:border-[#6366f1]/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg ${colors[idx % colors.length]} flex items-center justify-center`}>
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{community.name}</p>
                              <p className="text-sm text-gray-400">{community.member_count} membros</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={community.user_is_member ? "default" : "outline"}
                            className={
                              community.user_is_member
                                ? "bg-[#6366f1] text-white hover:bg-[#5558e3]"
                                : "border-[#2a2a3e] hover:bg-[#2a2a3e] text-gray-400"
                            }
                            onClick={() => handleToggleCommunity(community.id)}
                          >
                            {community.user_is_member ? "Seguindo" : "Seguir"}
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader className="bg-[#0f0f1a] border-b border-[#2a2a3e]">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20 ring-4 ring-[#6366f1]">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-[#6366f1] text-white text-2xl font-bold">
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{user?.user_metadata?.full_name || "Usuário"}</h2>
                        <p className="text-gray-400">{user?.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#2a2a3e] hover:bg-[#2a2a3e] text-gray-400"
                        onClick={() => router.push("/profile/edit")}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e]">
                        <p className="text-2xl font-bold text-white">{posts.filter(p => p.user_id === user?.id).length}</p>
                        <p className="text-sm text-gray-400">Posts</p>
                      </div>
                      <div className="text-center p-4 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e]">
                        <p className="text-2xl font-bold text-white">{communities.filter(c => c.user_is_member).length}</p>
                        <p className="text-sm text-gray-400">Comunidades</p>
                      </div>
                      <div className="text-center p-4 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e]">
                        <p className="text-2xl font-bold text-white">23%</p>
                        <p className="text-sm text-gray-400">Leitura</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-white mb-3">Meus Posts</h3>
                      {posts.filter(p => p.user_id === user?.id).length === 0 ? (
                        <div className="text-center py-8 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e]">
                          <p className="text-gray-400">Você ainda não publicou nada</p>
                        </div>
                      ) : (
                        posts.filter(p => p.user_id === user?.id).map((post) => (
                          <Card key={post.id} className="bg-[#0f0f1a] border-[#2a2a3e]">
                            <CardContent className="p-4">
                              <p className="text-gray-300 mb-3">{post.content}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {post.likes_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {post.comments_count}
                                </span>
                                <span>{formatTimeAgo(post.created_at)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>

          {/* Sidebar Direita */}
          <aside className="hidden lg:block lg:col-span-3">
            <Card className="sticky top-24 bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader className="border-b border-[#2a2a3e]">
                <h3 className="font-bold text-white">Sugestões</h3>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {communities.slice(0, 3).map((community, idx) => {
                  const colors = [
                    "bg-[#6366f1]",
                    "bg-[#8b5cf6]",
                    "bg-[#a855f7]"
                  ];
                  return (
                    <div key={community.id} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colors[idx % colors.length]} flex items-center justify-center`}>
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{community.name}</p>
                          <p className="text-xs text-gray-500">{community.member_count} membros</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={community.user_is_member ? "default" : "outline"}
                        className={
                          community.user_is_member
                            ? "bg-[#6366f1] text-white hover:bg-[#5558e3]"
                            : "border-[#2a2a3e] hover:bg-[#2a2a3e] text-gray-400"
                        }
                        onClick={() => handleToggleCommunity(community.id)}
                      >
                        {community.user_is_member ? "✓" : "+"}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="mt-4 bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader className="border-b border-[#2a2a3e]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#6366f1]" />
                  <h3 className="font-bold text-white">Plano de Leitura</h3>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progresso Anual</span>
                    <span className="font-bold text-[#6366f1] text-lg">23%</span>
                  </div>
                  <div className="w-full bg-[#0f0f1a] rounded-full h-3">
                    <div className="bg-[#6366f1] h-full rounded-full" style={{ width: "23%" }}></div>
                  </div>
                  <div className="bg-[#0f0f1a] p-4 rounded-lg border border-[#2a2a3e]">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Continue firme! Você está lendo a Bíblia em 1 ano.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Dialog de Comentários */}
      <Dialog open={!!selectedPostComments} onOpenChange={() => setSelectedPostComments(null)}>
        <DialogContent className="bg-[#1a1a2e] border-[#2a2a3e] text-white max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Comentários</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="ring-2 ring-[#6366f1]">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                        {comment.profiles?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-[#0f0f1a] rounded-lg p-3 border border-[#2a2a3e]">
                        <p className="font-semibold text-sm text-white">{comment.profiles?.full_name || "Usuário"}</p>
                        <p className="text-gray-300 mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-3">{formatTimeAgo(comment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2 pt-4 border-t border-[#2a2a3e]">
            <Input
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              className="flex-1 bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-[#6366f1] hover:bg-[#5558e3] text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Compartilhamento */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-[#2a2a3e] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Compartilhar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-[#2a2a3e] hover:bg-[#2a2a3e] text-white"
              onClick={() => shareToSocial("facebook")}
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Facebook</p>
                <p className="text-xs text-gray-400">Compartilhar no Facebook</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-[#2a2a3e] hover:bg-[#2a2a3e] text-white"
              onClick={() => shareToSocial("twitter")}
            >
              <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Twitter</p>
                <p className="text-xs text-gray-400">Compartilhar no Twitter</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-[#2a2a3e] hover:bg-[#2a2a3e] text-white"
              onClick={() => shareToSocial("linkedin")}
            >
              <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold">LinkedIn</p>
                <p className="text-xs text-gray-400">Compartilhar no LinkedIn</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-[#2a2a3e] z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Button 
            variant="ghost" 
            className={`flex-col h-auto py-3 ${activeTab === "feed" ? "text-[#6366f1] bg-[#2a2a3e]" : "text-gray-400"}`}
            onClick={() => setActiveTab("feed")}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">Início</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-col h-auto py-3 ${activeTab === "bible" ? "text-[#6366f1] bg-[#2a2a3e]" : "text-gray-400"}`}
            onClick={() => setActiveTab("bible")}
          >
            <Book className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">Bíblia</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-col h-auto py-3 ${activeTab === "communities" ? "text-[#6366f1] bg-[#2a2a3e]" : "text-gray-400"}`}
            onClick={() => setActiveTab("communities")}
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">Grupos</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-col h-auto py-3 ${activeTab === "profile" ? "text-[#6366f1] bg-[#2a2a3e]" : "text-gray-400"}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">Perfil</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
