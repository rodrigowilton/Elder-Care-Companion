import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Digite seu usuário"),
  password: z.string().min(1, "Digite sua senha"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", fullName: "", confirmPassword: "" },
  });

  async function onLogin(data: z.infer<typeof loginSchema>) {
    try {
      await login.mutateAsync(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error.message,
      });
    }
  }

  async function onRegister(data: z.infer<typeof registerSchema>) {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...apiData } = data;
      await register.mutateAsync(apiData);
      toast({
        title: "Conta criada!",
        description: "Bem-vindo ao Street50+",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center mb-4 rotate-3">
            <HeartHandshake className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary">Street50+</h1>
          <p className="text-muted-foreground font-medium text-lg">Cuidando de quem importa</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-primary/5 overflow-hidden">
          <CardHeader className="bg-primary/5 pb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl bg-background p-1">
                <TabsTrigger value="login" className="rounded-lg text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full transition-all">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full transition-all">Cadastrar</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold text-foreground">Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome de usuário" className="input-large" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold text-foreground">Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Sua senha" className="input-large" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="btn-large w-full bg-primary hover:bg-primary/90 text-white" disabled={login.isPending}>
                      {login.isPending ? "Entrando..." : "Entrar no App"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold text-foreground">Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" className="input-large" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold text-foreground">Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Escolha um usuário" className="input-large" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold text-foreground">Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Crie uma senha" className="input-large" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold text-foreground">Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Repita a senha" className="input-large" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="btn-large w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mt-4" disabled={register.isPending}>
                      {register.isPending ? "Criando..." : "Criar Conta Grátis"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
