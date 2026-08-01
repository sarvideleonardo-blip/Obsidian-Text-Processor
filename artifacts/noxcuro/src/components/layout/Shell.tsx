import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Network, Sparkles, ActivitySquare, Orbit } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Procesador", icon: Sparkles },
  { href: "/entradas", label: "Constelación", icon: Network },
  { href: "/estadisticas", label: "Grafo", icon: ActivitySquare },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card/30 backdrop-blur-md flex-shrink-0 flex flex-col z-10 relative">
        {/* Glow effect under sidebar */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="p-6 flex items-center gap-3">
          <div className="relative">
            <Orbit className="w-6 h-6 text-primary animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          </div>
          <div>
            <h1 className="font-sans font-medium text-foreground tracking-tight leading-none text-lg">noXcuro</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Rizomiceliales</p>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-6 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-shrink-0">
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all relative group cursor-pointer",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-4 h-4 z-10", isActive && "drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]")} />
                  <span className="z-10">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        {/* Subtle ambient noise/grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
