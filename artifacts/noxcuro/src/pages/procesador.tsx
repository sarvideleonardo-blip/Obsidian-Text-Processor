import { useState, useRef } from "react";
import { useProcessText, useSaveEntry, getListEntriesQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Save, Copy, Loader2, Check, ArrowRight, Network, Link2, FileText, Tag } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// ─── Clipboard helper — works in Replit iframe (no navigator.clipboard perms) ──
function copyToClipboard(text: string): Promise<void> {
  // Try modern API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("execCommand failed"));
    } catch (e) {
      document.body.removeChild(ta);
      reject(e);
    }
  });
}

export default function Procesador() {
  const [text, setText] = useState("");
  const [hasCopied, setHasCopied] = useState(false);
  const [hasCopiedConn, setHasCopiedConn] = useState(false);
  const markdownRef = useRef<HTMLPreElement>(null);
  const queryClient = useQueryClient();

  const processTextMutation = useProcessText();
  const saveEntryMutation = useSaveEntry();

  const result = processTextMutation.data;

  const handleProcess = () => {
    if (!text.trim()) {
      toast.error("El texto está vacío");
      return;
    }
    processTextMutation.mutate({ data: { text } }, {
      onSuccess: () => toast.success("Pensamiento procesado y tejido"),
      onError: () => toast.error("Error al procesar el texto"),
    });
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    copyToClipboard(result.obsidianMarkdown)
      .then(() => {
        setHasCopied(true);
        toast.success("Markdown completo copiado — listo para pegar en Obsidian");
        setTimeout(() => setHasCopied(false), 3000);
      })
      .catch(() => {
        // Fallback: select the pre element text
        if (markdownRef.current) {
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(markdownRef.current);
          sel?.removeAllRanges();
          sel?.addRange(range);
          toast("Seleccionado — presioná Ctrl+C / Cmd+C para copiar", { duration: 5000 });
        }
      });
  };

  const handleCopyConnections = () => {
    if (!result) return;
    const connText = result.inferredConnections.join("\n");
    copyToClipboard(connText)
      .then(() => {
        setHasCopiedConn(true);
        toast.success("Conexiones copiadas");
        setTimeout(() => setHasCopiedConn(false), 2000);
      })
      .catch(() => toast.error("No se pudo copiar automáticamente"));
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
      onError: () => toast.error("Error al guardar"),
    });
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-sans tracking-tight text-foreground/90 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Materia Prima
        </h2>
        <p className="text-sm text-muted-foreground font-mono">
          Introduce texto crudo. El sistema corregirá errores, minúsculas y tejerá conexiones.
        </p>
      </div>

      {/* Input area */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent blur-lg rounded-xl opacity-50" />
        <div className="relative border border-primary/20 bg-background/50 rounded-xl overflow-hidden">
          <textarea
            placeholder="pensamientos..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleProcess(); }}
            className="w-full min-h-[200px] resize-y text-base font-mono bg-transparent p-4 text-foreground placeholder:text-muted-foreground/40 border-0 outline-none focus:ring-0"
          />
          <div className="p-4 border-t border-border/50 flex items-center justify-between bg-card/30">
            <span className="text-xs font-mono text-muted-foreground/50">Ctrl+Enter para procesar</span>
            <Button
              onClick={handleProcess}
              disabled={processTextMutation.isPending || !text.trim()}
              className="gap-2 font-mono bg-primary/90 hover:bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,200,200,0.2)]"
            >
              {processTextMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Sparkles className="w-4 h-4" />}
              {processTextMutation.isPending ? "Procesando..." : "Asimilar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="space-y-5"
          >
            {/* ── Texto corregido ─────────────────────────────────────────── */}
            <section className="border border-border/60 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/20 border-b border-border/40">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Texto corregido</span>
                {result.corrections.length > 0 && (
                  <span className="ml-auto text-xs font-mono text-primary/70">{result.corrections.length} corrección{result.corrections.length !== 1 ? "es" : ""}</span>
                )}
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {result.correctedText}
                </p>
                {result.corrections.length > 0 && (
                  <div className="pt-3 border-t border-border/30">
                    <div className="text-xs text-muted-foreground font-mono mb-2 uppercase tracking-wider">Correcciones realizadas</div>
                    <div className="flex flex-wrap gap-2">
                      {result.corrections.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs font-mono bg-destructive/10 border border-destructive/20 px-2 py-1 rounded">
                          <span className="line-through text-destructive/70">{c.original}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-primary">{c.corrected}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ── Tags + Categorías ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.tags.length > 0 && (
                <section className="border border-border/60 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/20 border-b border-border/40">
                    <Tag className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Tags generados</span>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {result.tags.map((t) => (
                      <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                        #{t}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {result.categories.length > 0 && (
                <section className="border border-border/60 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/20 border-b border-border/40">
                    <Network className="w-4 h-4 text-accent" />
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Categorías noXcuro</span>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {result.categories.map((c) => (
                      <CategoryBadge key={c} category={c} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── CONEXIONES ───────────────────────────────────────────────── */}
            <section className="border border-amber-500/30 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-amber-500/5 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                    Conexiones — {result.inferredConnections.length} nodos inferidos
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyConnections}
                  className="h-7 gap-1.5 text-xs font-mono text-amber-400/70 hover:text-amber-400"
                >
                  {hasCopiedConn ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar conexiones
                </Button>
              </div>
              <div className="p-4">
                <p className="text-xs font-mono text-muted-foreground/60 mb-3 italic">
                  Inferidas por el sistema — no son hechos verificados. Estas líneas aparecen en el Markdown copiado como [[enlaces]] para el grafo de Obsidian.
                </p>
                {result.inferredConnections.length > 0 ? (
                  <ul className="space-y-2">
                    {result.inferredConnections.map((conn, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="text-sm font-mono text-foreground/80 flex items-start gap-2"
                      >
                        <span className="text-amber-500/50 shrink-0 mt-px">—</span>
                        <span className="text-amber-300/90">{conn}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm font-mono text-muted-foreground/40 italic">
                    Sin conexiones inferidas — agrega más contexto al texto.
                  </p>
                )}
              </div>
            </section>

            {/* ── MARKDOWN PARA OBSIDIAN ───────────────────────────────────── */}
            <section className="border border-primary/30 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono uppercase tracking-widest text-primary">
                    Markdown para Obsidian
                  </span>
                  <span className="text-xs font-mono text-muted-foreground/50">
                    — frontmatter + texto + conexiones + auditoría
                  </span>
                </div>
                <Button
                  onClick={handleCopyMarkdown}
                  size="sm"
                  className={`h-8 gap-2 font-mono text-xs transition-all ${
                    hasCopied
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                  }`}
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {hasCopied ? "Copiado" : "Copiar Markdown completo"}
                </Button>
              </div>
              <div className="bg-[#080d14] overflow-x-auto max-h-[500px] overflow-y-auto">
                <pre
                  ref={markdownRef}
                  className="p-5 text-xs font-mono leading-relaxed text-foreground/85 whitespace-pre-wrap break-words"
                >
                  {result.obsidianMarkdown}
                </pre>
              </div>
              <div className="px-4 py-2 bg-muted/10 border-t border-border/30 flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground/40">
                  {result.obsidianMarkdown.length} caracteres · pegar directamente en Obsidian como nueva nota
                </span>
                <Button
                  onClick={handleSave}
                  disabled={saveEntryMutation.isPending}
                  size="sm"
                  className="h-7 gap-1.5 text-xs font-mono bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30"
                >
                  {saveEntryMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Guardar en Constelación
                </Button>
              </div>
            </section>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
