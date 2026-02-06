import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={24} />
          </div>
          <div>
            <h1 className="font-display text-lg leading-tight font-bold text-foreground">
              Olá, {user.fullName.split(' ')[0]}
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Street50+</p>
          </div>
        </div>

        <div className="flex gap-2">
          {user.role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline" size="icon" className="rounded-xl border-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
