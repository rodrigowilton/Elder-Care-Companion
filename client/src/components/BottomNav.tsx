import { Link, useLocation } from "wouter";
import { Home, Pill, Calendar, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/medicamentos", icon: Pill, label: "Remédios" },
    { href: "/consultas", icon: Calendar, label: "Consultas" },
    { href: "/panico", icon: TriangleAlert, label: "Pânico", variant: "danger" },
  ];

  if (location === "/auth") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 pb-6 px-6 z-50">
      <div className="flex justify-between items-end max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const isDanger = item.variant === "danger";
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer",
                  isActive && !isDanger ? "text-primary -translate-y-2" : "text-gray-400",
                  isDanger && "text-destructive font-bold"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl transition-all",
                    isActive && !isDanger ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-transparent",
                    isDanger && "bg-destructive/10 p-3 rounded-2xl"
                  )}
                >
                  <item.icon
                    size={isDanger ? 32 : 28}
                    className={cn(isDanger && "fill-destructive text-destructive")}
                    strokeWidth={isDanger ? 2.5 : 2}
                  />
                </div>
                <span className={cn("text-xs font-medium", isActive ? "opacity-100" : "opacity-0")}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
