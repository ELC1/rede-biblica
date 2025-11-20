"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";

const interestOptions = [
  "Oração", "Estudo Bíblico", "Louvor", "Evangelismo", 
  "Missões", "Juventude", "Família", "Casamento",
  "Teologia", "História da Igreja", "Discipulado", "Jejum"
];

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    interests: [] as string[]
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    setUser(session.user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
        interests: profileData.interests || []
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      router.push("/");
    }

    setSaving(false);
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
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
            <h1 className="text-xl font-bold text-white">Editar Perfil</h1>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#6366f1] hover:bg-[#5558e3] text-white"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
          <CardHeader>
            <CardTitle className="text-white">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32 ring-4 ring-[#6366f1]">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-[#6366f1] text-white text-4xl font-bold">
                  {profile.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a3e] hover:bg-[#2a2a3e] text-gray-400"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome Completo</Label>
              <Input
                id="name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Seu nome completo"
                className="bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">Biografia</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Conte um pouco sobre você e sua jornada de fé..."
                className="min-h-[120px] bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500">{profile.bio.length}/500 caracteres</p>
            </div>

            {/* URL do Avatar */}
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-white">URL da Foto de Perfil</Label>
              <Input
                id="avatar"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder="https://exemplo.com/foto.jpg"
                className="bg-[#0f0f1a] border-[#2a2a3e] text-white placeholder:text-gray-500"
              />
            </div>

            {/* Interesses */}
            <div className="space-y-3">
              <Label className="text-white">Interesses</Label>
              <p className="text-sm text-gray-400">Selecione seus principais interesses</p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <Badge
                    key={interest}
                    variant={profile.interests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      profile.interests.includes(interest)
                        ? "bg-[#6366f1] text-white hover:bg-[#5558e3]"
                        : "border-[#2a2a3e] text-gray-400 hover:bg-[#2a2a3e] hover:text-white"
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                    {profile.interests.includes(interest) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
