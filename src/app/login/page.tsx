"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles, BookHeart, Users, MessageCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se já está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/");
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/");
      }
      if (event === "USER_UPDATED") {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Seção de Boas-vindas */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FéConnect
              </h1>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed">
              A rede social cristã que conecta corações e fortalece a fé
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                <BookHeart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  Bíblia Completa
                </h3>
                <p className="text-gray-600">
                  Acesse toda a Palavra de Deus integrada ao seu feed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  Comunidades
                </h3>
                <p className="text-gray-600">
                  Conecte-se com irmãos que compartilham sua fé
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  Compartilhe
                </h3>
                <p className="text-gray-600">
                  Publique reflexões, testemunhos e versículos inspiradores
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-lg shadow-2xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center md:hidden">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent md:hidden">
                FéConnect
              </h2>
              <h3 className="text-2xl font-bold text-gray-900">
                Bem-vindo(a)!
              </h3>
              <p className="text-gray-600">
                Entre para começar sua jornada de fé
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro de Autenticação</AlertTitle>
                <AlertDescription className="text-sm">
                  {authError === "google_not_enabled" ? (
                    <>
                      O login com Google precisa ser habilitado no Supabase.
                      <br />
                      <strong>Como configurar:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Acesse o Dashboard do Supabase</li>
                        <li>Vá em Authentication → Providers</li>
                        <li>Habilite o provedor "Google"</li>
                        <li>Configure Client ID e Secret do Google Cloud</li>
                      </ol>
                    </>
                  ) : (
                    authError
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#9333ea",
                      brandAccent: "#7c3aed",
                      brandButtonText: "white",
                      defaultButtonBackground: "white",
                      defaultButtonBackgroundHover: "#f3f4f6",
                      defaultButtonBorder: "#e5e7eb",
                      defaultButtonText: "#374151",
                      dividerBackground: "#e5e7eb",
                      inputBackground: "white",
                      inputBorder: "#e5e7eb",
                      inputBorderHover: "#9333ea",
                      inputBorderFocus: "#7c3aed",
                      inputText: "#1f2937",
                      inputLabelText: "#374151",
                      inputPlaceholder: "#9ca3af",
                    },
                    space: {
                      buttonPadding: "12px 16px",
                      inputPadding: "12px 16px",
                    },
                    borderWidths: {
                      buttonBorderWidth: "1px",
                      inputBorderWidth: "1px",
                    },
                    radii: {
                      borderRadiusButton: "12px",
                      buttonBorderRadius: "12px",
                      inputBorderRadius: "12px",
                    },
                  },
                },
                className: {
                  container: "space-y-4",
                  button: "font-semibold transition-all duration-200 hover:scale-105",
                  input: "transition-all duration-200",
                },
              }}
              providers={["google"]}
              view="sign_in"
              showLinks={true}
              redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/` : undefined}
              localization={{
                variables: {
                  sign_in: {
                    email_label: "E-mail",
                    password_label: "Senha",
                    email_input_placeholder: "Seu e-mail",
                    password_input_placeholder: "Sua senha",
                    button_label: "Entrar",
                    social_provider_text: "Entrar com {{provider}}",
                    link_text: "Já tem uma conta? Entre",
                  },
                  sign_up: {
                    email_label: "E-mail",
                    password_label: "Senha",
                    email_input_placeholder: "Seu e-mail",
                    password_input_placeholder: "Crie uma senha",
                    button_label: "Criar conta",
                    social_provider_text: "Cadastrar com {{provider}}",
                    link_text: "Não tem conta? Cadastre-se",
                  },
                },
              }}
              onError={(error) => {
                console.error("Auth error:", error);
                if (error.message.includes("provider") || error.message.includes("Unsupported")) {
                  setAuthError("google_not_enabled");
                } else {
                  setAuthError(error.message);
                }
              }}
            />
            <div className="mt-6 text-center text-sm text-gray-500">
              Ao continuar, você concorda com nossos Termos de Uso e Política de
              Privacidade
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
