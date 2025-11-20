"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, TrendingUp, MessageSquare, Heart, Eye, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsData {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalCommunities: number;
  activeUsers: number;
  recentActivity: any[];
}

export default function AdminAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    totalCommunities: 0,
    activeUsers: 0,
    recentActivity: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    setUser(session.user);

    // Buscar estatísticas
    const [
      { count: usersCount },
      { count: postsCount },
      { count: commentsCount },
      { count: likesCount },
      { count: communitiesCount }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("likes").select("*", { count: "exact", head: true }),
      supabase.from("communities").select("*", { count: "exact", head: true })
    ]);

    // Buscar atividade recente
    const { data: recentPosts } = await supabase
      .from("posts")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    setAnalytics({
      totalUsers: usersCount || 0,
      totalPosts: postsCount || 0,
      totalComments: commentsCount || 0,
      totalLikes: likesCount || 0,
      totalCommunities: communitiesCount || 0,
      activeUsers: Math.floor((usersCount || 0) * 0.7), // Simulado
      recentActivity: recentPosts || []
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total de Usuários",
      value: analytics.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Posts Publicados",
      value: analytics.totalPosts,
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Comentários",
      value: analytics.totalComments,
      icon: MessageSquare,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Curtidas",
      value: analytics.totalLikes,
      icon: Heart,
      color: "from-red-500 to-red-600"
    },
    {
      title: "Comunidades",
      value: analytics.totalCommunities,
      icon: Users,
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Usuários Ativos",
      value: analytics.activeUsers,
      icon: TrendingUp,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <header className="sticky top-0 z-50 bg-[#1a1a2e] border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#6366f1]/30 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Atividade Recente */}
        <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#6366f1]" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0f0f1a] p-1">
                <TabsTrigger
                  value="posts"
                  className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                >
                  Posts Recentes
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-gray-400"
                >
                  Novos Usuários
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {analytics.recentActivity.map((post, index) => (
                      <div
                        key={index}
                        className="p-4 bg-[#0f0f1a] rounded-lg border border-[#2a2a3e] hover:border-[#6366f1]/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-white">
                            {post.profiles?.full_name || "Usuário"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{post.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Dados de novos usuários em breve</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
