import { useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui/core";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Network, FileText, Zap, Tags } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_COLORS: Record<string, string> = {
  'método': 'hsl(180, 100%, 40%)',
  'cosmogonía': 'hsl(270, 70%, 60%)',
  'museo': 'hsl(40, 100%, 50%)',
  'escritura': 'hsl(190, 80%, 50%)',
  'identidad': 'hsl(320, 80%, 60%)',
  'leyes': 'hsl(140, 70%, 50%)',
};

export default function Grafo() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare radar data
  const radarData = stats.categoryCounts.map(c => ({
    subject: c.category,
    A: c.count,
    fullMark: Math.max(...stats.categoryCounts.map(x => x.count), 10)
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-sans tracking-tight text-foreground flex items-center gap-2">
          Salud del Sistema
        </h2>
        <p className="text-sm text-muted-foreground font-mono">
          Métricas de crecimiento y conectividad del micelio.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-card/40 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><FileText className="w-16 h-16" /></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Nodos Totales</p>
              <p className="text-4xl font-light text-foreground">{stats.totalEntries}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card/40 border-secondary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-16 h-16" /></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Correcciones</p>
              <p className="text-4xl font-light text-secondary">{stats.totalCorrections}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card/40 border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Tags className="w-16 h-16" /></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Tags Únicos</p>
              <p className="text-4xl font-light text-amber-500">{stats.topTags.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card/40 border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Network className="w-16 h-16" /></div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Categorías</p>
              <p className="text-4xl font-light text-cyan-500">{stats.categoryCounts.filter(c => c.count > 0).length}/6</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/30 border-border/50 h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                Balance de Esferas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} />
                  <Radar name="Nodos" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card/30 border-border/50 h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                Distribución Categórica
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryCounts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.categoryCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category.toLowerCase()] || 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-card/30 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              Top Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.topTags.length === 0 && (
                <p className="text-muted-foreground font-mono text-sm">Aún no hay etiquetas extraídas.</p>
              )}
              {stats.topTags.map((tag, i) => {
                // Size mapping based on count
                const max = Math.max(...stats.topTags.map(t => t.count));
                const ratio = tag.count / max;
                const sizeClass = ratio > 0.8 ? 'text-lg px-3 py-1' : ratio > 0.4 ? 'text-sm px-2.5 py-0.5' : 'text-xs px-2 py-0.5';
                const opacityClass = ratio > 0.8 ? 'bg-primary/20 text-primary border-primary/30' : ratio > 0.4 ? 'bg-secondary/20 text-secondary border-secondary/30' : 'bg-muted/50 text-muted-foreground border-border';
                
                return (
                  <div 
                    key={tag.tag} 
                    className={`rounded-full border font-mono flex items-center gap-1.5 transition-all hover:scale-105 cursor-default ${sizeClass} ${opacityClass}`}
                  >
                    <span>#{tag.tag}</span>
                    <span className="opacity-50 text-[0.8em] font-sans bg-black/20 rounded-full px-1.5 min-w-[1.5rem] text-center">{tag.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
