import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

// Pages
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Medications from "@/pages/Medications";
import Appointments from "@/pages/Appointments";
import Panic from "@/pages/Panic";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

// Components
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-primary font-bold text-xl">Carregando Street50+...</div>;
  }

  if (!user) {
    // Redirect to login handled by Auth hook or manual redirect
    setLocation("/auth");
    return null;
  }

  return (
    <>
      <Header />
      <Component />
      <BottomNav />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/medicamentos">
        <ProtectedRoute component={Medications} />
      </Route>
      
      <Route path="/consultas">
        <ProtectedRoute component={Appointments} />
      </Route>
      
      <Route path="/panico">
        <ProtectedRoute component={Panic} />
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute component={Admin} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
