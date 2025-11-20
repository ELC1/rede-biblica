"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Star, Lock, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  earned?: boolean;
  earned_at?: string;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    setUser(session.user);

    // Buscar todas as conquistas
    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("*")
      .order("points", { ascending: false });

    // Buscar conquistas do usuário
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id, earned_at")
      .eq("user_id", session.user.id);

    const userAchievementIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
    
    const achievementsWithStatus = allAchievements?.map(achievement => ({
      ...achievement,
      earned: userAchievementIds.has(achievement.id),
      earned_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.earned_at
    })) || [];

    setAchievements(achievementsWithStatus);
    
    const points = achievementsWithStatus
      .filter(a => a.earned)
      .reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(points);

    setLoading(false);
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Trophy,
      Star,
      CheckCircle2
    };
    const Icon = icons[iconName] || Trophy;
    return Icon;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const progressPercentage = (earnedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <header className="sticky top-0 z-50 bg-[#1a1a2e] border-b border-[#2a2a3e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Conquistas</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumo */}
        <Card className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] border-none mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {totalPoints} Pontos
                </h2>
                <p className="text-white/80 text-sm">
                  {earnedCount} de {totalCount} conquistas
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-full">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </CardContent>
        </Card>

        {/* Lista de Conquistas */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const Icon = getIconComponent(achievement.icon);
              return (
                <Card
                  key={achievement.id}
                  className={`border-[#2a2a3e] transition-all ${
                    achievement.earned
                      ? "bg-[#1a1a2e] hover:border-[#6366f1]/50"
                      : "bg-[#0f0f1a] opacity-60"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          achievement.earned
                            ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"
                            : "bg-[#2a2a3e]"
                        }`}
                      >
                        {achievement.earned ? (
                          <Icon className="w-7 h-7 text-white" />
                        ) : (
                          <Lock className="w-7 h-7 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3
                            className={`font-bold ${
                              achievement.earned ? "text-white" : "text-gray-500"
                            }`}
                          >
                            {achievement.name}
                          </h3>
                          <Badge
                            variant={achievement.earned ? "default" : "outline"}
                            className={
                              achievement.earned
                                ? "bg-[#6366f1] text-white"
                                : "border-[#2a2a3e] text-gray-500"
                            }
                          >
                            {achievement.points} pts
                          </Badge>
                        </div>
                        <p
                          className={`text-sm mb-2 ${
                            achievement.earned ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.earned_at && (
                          <p className="text-xs text-[#6366f1] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Conquistado em{" "}
                            {new Date(achievement.earned_at).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
