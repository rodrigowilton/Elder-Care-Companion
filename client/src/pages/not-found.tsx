import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-4 shadow-xl border-2 border-border">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Página não encontrada</h1>
          </div>
          
          <p className="mt-4 text-muted-foreground mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>

          <Link href="/">
            <button className="w-full btn-large bg-primary text-white hover:bg-primary/90">
              Voltar ao Início
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
