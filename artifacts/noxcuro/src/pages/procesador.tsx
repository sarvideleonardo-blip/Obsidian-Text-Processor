import { useState } from "react";
import { useProcessText, useSaveEntry, getListEntriesQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Button, Textarea, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui/core";
import { CategoryBadge } from "@/components/CategoryBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Save, Copy, Loader2, Check, ArrowRight, Network } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Procesador() {
  const [text, setText] = useState("");
  const [hasCopied, setHasCopied] = useState(false);
  const queryClient = useQueryClient();
  
  const processTextMutation = useProcessText();
  const saveEntryMutation = useSaveEntry();

  const handleProcess = () => {
    if (!text.trim()) {
      toast.error("El texto está vacío");
      return;
    }
    processTextMutation.mutate({ data: { text } }, {
      onSuccess: () => {
        toast.success("Pensamiento procesado");
      },
      onError: (err) => {
        toast.error(err.error || "Error al procesar el texto");
      }
    });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.obsidianMarkdown).then(() => {
      setHasCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const handleSave = () => {
    if (!result) return;
    saveEntryMutation.mutate({
      data: {
        originalText: result.originalText,
        correctedText: result.correctedText,
        corrections: result.corrections,
        tags: result.tags,
        categories: result.categories,
        inferredConnections: result.inferredConnections,
        frontmatterYaml: result.frontmatterYaml,
        obsidianMarkdown: result.obsidianMarkdown,
      }
    }, {
      onSuccess: () => {
        toast.success("Nodo integrado en la constelación");
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        setText("");
        processTextMutation.reset();
      },
      onError: (err) => {
        toast.error(err.error || "Error al guardar");
      }
    });
  };

  const result = processTextMutation.data;

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-sans tracking-tight text-foreground/90 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Materia Prima
        </h2>
        <p className="text-sm text-muted-foreground font-mono">
          Introduce texto crudo. El sistema corregirá errores, minúsculas y tejerá conexiones.
        </p>
      </div>

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent blur-lg rounded-xl opacity-50" />
        <Card className="relative border-primary/20 bg-background/50">
          <CardContent className="p-1">
            <Textarea
              placeholder="pensamientos..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] border-0 focus-visible:ring-0 bg-transparent resize-y text-base"
            />
          </CardContent>
          <div className="p-4 border-t border-border/50 flex justify-end bg-card/30 rounded-b-xl">
            <Button 
              onClick={handleProcess} 
              disabled={processTextMutation.isPending || !text.trim()}
              variant="glow"
              className="gap-2 font-mono"
            >
              {processTextMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {processTextMutation.isPending ? "Procesando..." : "Asimilar"}
            </Button>
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Network className="w-4 h-4 text-primary" />
                      Metadatos
                    </CardTitle>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {result.categories.map(c => (
                        <CategoryBadge key={c} category={c} />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  {result.tags.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Etiquetas</div>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map(t => (
                          <Badge key={t} variant="secondary" className="font-mono text-xs before:content-['#'] before:mr-0.5 before:opacity-50">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.inferredConnections.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider text-amber-500/80">Conexiones sugeridas</div>
                      <ul className="space-y-1.5">
                        {result.inferredConnections.map(conn => (
                          <li key={conn} className="text-sm font-mono flex items-start gap-2 text-foreground/80">
                            <span className="text-amber-500/50 mt-0.5">[[</span>
                            <span className="border-b border-amber-500/20">{conn}</span>
                            <span className="text-amber-500/50 mt-0.5">]]</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.corrections.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Correcciones ({result.corrections.length})</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {result.corrections.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs font-mono bg-muted/30 px-2 py-1 rounded">
                            <span className="line-through text-destructive/70">{c.original}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-primary">{c.corrected}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saveEntryMutation.isPending}
                  className="w-full h-auto py-4 font-mono flex-col gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_15px_rgba(138,43,226,0.1)] hover:shadow-[0_0_20px_rgba(138,43,226,0.2)]"
                >
                  {saveEntryMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  <span>Guardar en Constelación</span>
                </Button>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Previsualización</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm font-sans line-clamp-6 text-foreground/80 leading-relaxed">
                      {result.correctedText}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-primary/20 overflow-hidden">
              <div className="flex items-center justify-between p-2 bg-muted/30 border-b border-border">
                <div className="px-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Salida Obsidian
                </div>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2 font-mono text-xs">
                  {hasCopied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  {hasCopied ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <div className="p-4 bg-[#0d1117] overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                  {result.obsidianMarkdown}
                </pre>
              </div>
            </Card>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
