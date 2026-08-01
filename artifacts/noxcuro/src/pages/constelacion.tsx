import { useState, useMemo } from "react";
import { useListEntries, useDeleteEntry, getListEntriesQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, Badge, Skeleton, Button } from "@/components/ui/core";
import { CategoryBadge } from "@/components/CategoryBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Trash2, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ALL_CATEGORIES = ['método', 'cosmogonía', 'museo', 'escritura', 'identidad', 'leyes'];

export default function Constelacion() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { data: entries, isLoading } = useListEntries({ 
    category: selectedCategory,
    tag: selectedTag || undefined
  });
  
  const deleteMutation = useDeleteEntry();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("¿Desvincular este nodo de la constelación?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast.success("Nodo desvinculado");
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        },
        onError: () => toast.error("Error al desvincular nodo")
      });
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-sans tracking-tight text-foreground flex items-center gap-2">
            Constelación
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            El archivo rizomático de pensamientos procesados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Filtrar por etiqueta..." 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-card/50 border border-border rounded-md pl-9 pr-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <select 
            className="bg-card/50 border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer"
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || undefined)}
          >
            <option value="">Todas las categorías</option>
            {ALL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card/20 border-border/30">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        )}

        {!isLoading && entries?.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border/50 rounded-xl bg-card/10">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm">El vacío. No hay nodos que coincidan.</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {entries?.map((entry) => {
            const isExpanded = expandedId === entry.id;
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={entry.id}
                className="group"
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 border-l-2 ${isExpanded ? 'border-l-primary bg-card/80 shadow-[0_0_30px_rgba(0,255,255,0.05)]' : 'border-l-transparent hover:border-l-primary/50 bg-card/30 hover:bg-card/50'}`}
                  onClick={() => toggleExpand(entry.id)}
                >
                  <CardContent className="p-0">
                    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-start">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mr-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(entry.createdAt)}
                          </span>
                          {entry.categories.map(c => <CategoryBadge key={c} category={c} />)}
                        </div>
                        
                        <p className={`text-sm md:text-base font-sans leading-relaxed text-foreground/90 transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {entry.correctedText}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {entry.tags.map(t => (
                            <Badge key={t} variant="secondary" className="font-mono text-[10px] bg-secondary/5 text-secondary/80 border border-secondary/20">
                              #{t}
                            </Badge>
                          ))}
                          {entry.corrections.length > 0 && (
                            <span className="text-[10px] font-mono text-muted-foreground ml-auto bg-muted/20 px-2 py-0.5 rounded">
                              {entry.corrections.length} correcciones
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center gap-2 md:pl-4 md:border-l border-border/30 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => handleDelete(e, entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="h-8 w-8 flex items-center justify-center text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-border/50 bg-[#0d1117]/80"
                        >
                          <div className="p-4 md:p-6 space-y-4">
                            <div className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <span>Markdown Generado</span>
                            </div>
                            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                              {entry.obsidianMarkdown}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
