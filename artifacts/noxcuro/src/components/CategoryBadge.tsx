import { Badge } from "./ui/core";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, string> = {
  'método': 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_8px_rgba(20,184,166,0.15)]',
  'cosmogonía': 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]',
  'museo': 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  'escritura': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
  'identidad': 'bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-[0_0_8px_rgba(236,72,153,0.15)]',
  'leyes': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
};

export function CategoryBadge({ category, className }: { category: string, className?: string }) {
  const normalized = category.toLowerCase();
  const style = CATEGORY_STYLES[normalized] || 'bg-muted text-muted-foreground border-border';
  
  return (
    <Badge variant="outline" className={cn(style, "px-2 py-0.5 font-sans tracking-widest uppercase text-[9px] font-bold", className)}>
      {category}
    </Badge>
  );
}
