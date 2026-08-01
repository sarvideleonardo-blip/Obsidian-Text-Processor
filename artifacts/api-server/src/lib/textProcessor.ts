/**
 * noXcuro text processor
 * Rules:
 * 1. Correct ONLY spelling/accent errors — never add, remove, substitute, or reorder words
 * 2. All output is always lowercase
 * 3. Mark inferred connections as suggested — never as facts
 */

export interface Correction {
  original: string;
  corrected: string;
  index: number;
}

export interface ProcessedText {
  originalText: string;
  correctedText: string;
  corrections: Correction[];
  tags: string[];
  categories: string[];
  inferredConnections: string[];
  frontmatterYaml: string;
  obsidianMarkdown: string;
  processedAt: string;
}

// ─── Spanish spelling corrections dictionary ───────────────────────────────
// Key: common misspelling (lowercase), Value: correct spelling (lowercase)
const SPELLING_CORRECTIONS: Record<string, string> = {
  // Common misspellings from the user example
  "correguido": "corregido",
  "correguida": "corregida",
  "correguidas": "corregidas",
  "correguidos": "corregidos",
  "ortograficas": "ortográficas",
  "ortografica": "ortográfica",
  "ortograficos": "ortográficos",
  "ortografico": "ortográfico",
  "minisculas": "minúsculas",
  "miniscula": "minúscula",
  "minisculos": "minúsculos",
  "minisculo": "minúsculo",
  "siempre": "siempre",
  "grafico": "gráfico",
  "graficos": "gráficos",
  "grafica": "gráfica",
  // Common accent errors
  "mas": "más",   // adverb — context dependent, skip to be safe
  "tu": "tú",    // context dependent, skip
  "si": "sí",    // context dependent, skip
  // Words that are almost always missing accents
  "tambien": "también",
  "ademas": "además",
  "segun": "según",
  "aqui": "aquí",
  "alli": "allí",
  "alla": "allá",
  "aca": "acá",
  "todavia": "todavía",
  "aun": "aún",   // note: "aun" without accent = "even", "aún" = "still" — safer to skip
  "despues": "después",
  "detras": "detrás",
  "delante": "delante",
  "atras": "atrás",
  "jamas": "jamás",
  "quiza": "quizá",
  "quizas": "quizás",
  "quizás": "quizás",
  "rapido": "rápido",
  "rapida": "rápida",
  "rapidos": "rápidos",
  "rapidas": "rápidas",
  "facil": "fácil",
  "faciles": "fáciles",
  "dificil": "difícil",
  "dificiles": "difíciles",
  "util": "útil",
  "utiles": "útiles",
  "inutil": "inútil",
  "inutiles": "inútiles",
  "arbol": "árbol",
  "arboles": "árboles",
  "imagen": "imagen",
  "imagenes": "imágenes",
  "caracter": "carácter",
  "caracteres": "caracteres",
  "pagina": "página",
  "paginas": "páginas",
  "numero": "número",
  "numeros": "números",
  "calculo": "cálculo",
  "calculos": "cálculos",
  "metodo": "método",
  "metodos": "métodos",
  "cosmogonia": "cosmogonía",
  "cosmogonias": "cosmogonías",
  "escritura": "escritura",
  "identidad": "identidad",
  "conexion": "conexión",
  "relacion": "relación",
  "relaciones": "relaciones",
  "informacion": "información",
  "creacion": "creación",
  "evolucion": "evolución",
  "revolucion": "revolución",
  "cancion": "canción",
  "canciones": "canciones",
  "version": "versión",
  "versiones": "versiones",
  "vision": "visión",
  "mision": "misión",
  "decision": "decisión",
  "opinion": "opinión",
  "opiniones": "opiniones",
  "accion": "acción",
  "acciones": "acciones",
  "funcion": "función",
  "funciones": "funciones",
  "posicion": "posición",
  "posiciones": "posiciones",
  "comunicacion": "comunicación",
  "transformacion": "transformación",
  "observacion": "observación",
  "percepcion": "percepción",
  "interaccion": "interacción",
  "produccion": "producción",
  "condicion": "condición",
  "situacion": "situación",
  "descripcion": "descripción",
  "participacion": "participación",
  "construccion": "construcción",
  "composicion": "composición",
  "investigacion": "investigación",
  "exploracion": "exploración",
  "reflexion": "reflexión",
  "dimension": "dimensión",
  "emocion": "emoción",
  "emociones": "emociones",
  "generacion": "generación",
  "integracion": "integración",
  "manifestacion": "manifestación",
  "meditacion": "meditación",
  "representacion": "representación",
  "sensacion": "sensación",
  "simbolo": "símbolo",
  "simbolos": "símbolos",
  "fenomeno": "fenómeno",
  "fenomenos": "fenómenos",
  "critica": "crítica",
  "critico": "crítico",
  "practicamente": "prácticamente",
  "practica": "práctica",
  "practico": "práctico",
  "musica": "música",
  "musico": "músico",
  "tecnica": "técnica",
  "tecnico": "técnico",
  "teorica": "teórica",
  "teorico": "teórico",
  "estetica": "estética",
  "estetico": "estético",
  "filosofica": "filosófica",
  "filosofico": "filosófico",
  "logica": "lógica",
  "logico": "lógico",
  "analitica": "analítica",
  "analitico": "analítico",
  "especifica": "específica",
  "especifico": "específico",
  "automatica": "automática",
  "automatico": "automático",
  "matematica": "matemática",
  "matematico": "matemático",
  "semantica": "semántica",
  "semantico": "semántico",
  "dinamica": "dinámica",
  "dinamico": "dinámico",
  "organica": "orgánica",
  "organico": "orgánico",
  "electronica": "electrónica",
  "electronico": "electrónico",
  "historica": "histórica",
  "historico": "histórico",
  "linguistica": "lingüística",
  "paradigma": "paradigma",
  "energia": "energía",
  "energias": "energías",
  "armonia": "armonía",
  "harmonía": "armonía",
  "teoria": "teoría",
  "teorias": "teorías",
  "historia": "historia",
  "memoria": "memoria",
  "alegoria": "alegoría",
  "analogia": "analogía",
  "psicologia": "psicología",
  "sociologia": "sociología",
  "biologia": "biología",
  "tecnologia": "tecnología",
  "metodologia": "metodología",
  "epistemologia": "epistemología",
  "arqueologia": "arqueología",
  "fenomenologia": "fenomenología",
  "ontologia": "ontología",
  "semiotica": "semiótica",
  "poetica": "poética",
  "retorica": "retórica",
  "hermeneutica": "hermenéutica",
  "dialectica": "dialéctica",
  "heuristica": "heurística",
  "micelio": "micelio",
  "rizocelial": "rizocelial",
  "rizomatico": "rizomático",
  "rizomatica": "rizomática",
  "noxcuro": "noxcuro",
};

// ─── noXcuro category keywords ──────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "método": [
    "método", "proceso", "técnica", "procedimiento", "sistema", "protocolo",
    "metodología", "práctica", "estrategia", "enfoque", "herramienta",
    "workflow", "flujo", "paso", "etapa", "fase", "secuencia",
  ],
  "cosmogonía": [
    "cosmos", "origen", "universo", "creación", "existencia", "ser",
    "ontología", "fundamento", "principio", "esencia", "naturaleza",
    "micelio", "rizoma", "constelación", "red", "trama", "tejido",
    "noxcuro", "sistema", "campo", "dimensión",
  ],
  "museo": [
    "museo", "colección", "archivo", "objeto", "artefacto", "exposición",
    "curaduría", "exhibición", "muestra", "pieza", "patrimonio", "memoria",
    "conservación", "catalogación", "inventario",
  ],
  "escritura": [
    "escritura", "texto", "palabra", "lenguaje", "narración", "relato",
    "poema", "prosa", "verso", "literatura", "libro", "página",
    "nota", "apunte", "diario", "ensayo", "fragmento",
  ],
  "identidad": [
    "identidad", "yo", "ser", "persona", "sujeto", "cuerpo", "mente",
    "consciencia", "presencia", "nombre", "rol", "máscara", "alter",
    "ego", "self", "interior", "exterior", "devenir",
  ],
  "leyes": [
    "ley", "regla", "norma", "principio", "axioma", "patrón", "estructura",
    "orden", "lógica", "causalidad", "consecuencia", "determinación",
    "azar", "necesidad", "posibilidad", "límite",
  ],
};

// ─── Tag extraction keywords ─────────────────────────────────────────────────
const STOP_WORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas",
  "de", "del", "al", "en", "con", "por", "para", "sin",
  "sobre", "entre", "hacia", "hasta", "desde", "durante",
  "y", "e", "o", "u", "ni", "pero", "sino", "aunque",
  "que", "si", "cuando", "donde", "como", "porque",
  "ya", "no", "más", "muy", "bien", "así", "también",
  "este", "esta", "estos", "estas", "ese", "esa",
  "esos", "esas", "aquel", "aquella",
  "mi", "tu", "su", "mis", "tus", "sus",
  "yo", "tú", "él", "ella", "nosotros", "ellos", "ellas",
  "me", "te", "se", "le", "lo", "la", "les", "nos",
  "todo", "toda", "todos", "todas",
  "hay", "ser", "estar", "tener", "hacer", "poder", "querer",
  "es", "son", "fue", "era", "será", "soy", "eres",
  "a", "ante", "bajo", "cabe", "contra", "so", "tras",
]);

/**
 * Tokenize text preserving punctuation attached to words.
 * Returns an array of tokens (words + separators).
 */
function tokenize(text: string): { token: string; isSeparator: boolean }[] {
  const tokens: { token: string; isSeparator: boolean }[] = [];
  // Match sequences of word chars (with unicode support) OR non-word sequences
  const regex = /[\w\u00C0-\u024F\u1E00-\u1EFF]+|[^\w\u00C0-\u024F\u1E00-\u1EFF]+/gu;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const t = match[0];
    // A word token if it contains any letter/digit
    const isWord = /[\w\u00C0-\u024F\u1E00-\u1EFF]/u.test(t);
    tokens.push({ token: t, isSeparator: !isWord });
  }
  return tokens;
}

/**
 * Strip punctuation from a word to get its base form for dictionary lookup.
 */
function stripPunctuation(word: string): string {
  return word.replace(/^[¡¿'"«"]+|[!?,.:;'"»"…]+$/g, "");
}

/**
 * Apply spelling corrections word-by-word.
 * RULE: Only the spelling changes — no word substitution, addition, removal.
 */
export function correctSpelling(text: string): { correctedText: string; corrections: Correction[] } {
  const tokens = tokenize(text);
  const corrections: Correction[] = [];
  let wordIndex = 0;

  const correctedTokens = tokens.map((t) => {
    if (t.isSeparator) return t.token;

    const lowered = t.token.toLowerCase();
    const stripped = stripPunctuation(lowered);
    const corrected = SPELLING_CORRECTIONS[stripped];

    if (corrected && corrected !== stripped) {
      // Reconstruct: keep surrounding punctuation, apply correction
      const leadingPunct = lowered.slice(0, lowered.indexOf(stripped));
      const trailingPunct = lowered.slice(lowered.indexOf(stripped) + stripped.length);
      const correctedWord = leadingPunct + corrected + trailingPunct;

      corrections.push({
        original: t.token,
        corrected: correctedWord,
        index: wordIndex,
      });
      wordIndex++;
      return correctedWord;
    }

    wordIndex++;
    return lowered; // Always lowercase, no other change
  });

  return {
    correctedText: correctedTokens.join(""),
    corrections,
  };
}

/**
 * Detect noXcuro categories based on keyword matching.
 */
export function detectCategories(text: string): string[] {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const found = keywords.some((kw) => {
      // Match whole word
      const re = new RegExp(`\\b${kw}\\b`, "i");
      return re.test(lowerText);
    });
    if (found) detected.push(category);
  }

  return detected;
}

/**
 * Extract meaningful tags from text (nouns / key terms, min 4 chars, not stop words).
 */
export function extractTags(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[¡¿!?,.:;'"«»""\u2018\u2019\u201C\u201D…\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
    .filter((w) => /^[a-záéíóúüñ]+$/i.test(w));

  // Count frequency
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] ?? 0) + 1;
  }

  // Return top 12 by frequency, no duplicates
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}

/**
 * Suggest semantic connections (marked as inferred/suggested, never facts).
 * These are keyword-triggered hints for the user to evaluate.
 */
export function suggestConnections(text: string, categories: string[]): string[] {
  const suggestions: string[] = [];
  const lowerText = text.toLowerCase();

  // Cross-category connections
  if (categories.includes("método") && categories.includes("cosmogonía")) {
    suggestions.push("[[método-cosmogonía]] (sugerido: proceso que genera cosmogonía)");
  }
  if (categories.includes("escritura") && categories.includes("identidad")) {
    suggestions.push("[[escritura-identidad]] (sugerido: escritura como construcción de identidad)");
  }
  if (categories.includes("museo") && categories.includes("memoria")) {
    suggestions.push("[[museo-memoria]] (sugerido: colección como memoria materializada)");
  }
  if (categories.includes("leyes") && categories.includes("cosmogonía")) {
    suggestions.push("[[leyes-cosmogonía]] (sugerido: las leyes rigen el cosmos del sistema)");
  }

  // Thematic keywords → connection suggestions
  if (/\bmicelio\b|\brizomic\b|\brizom[aá]/i.test(lowerText)) {
    suggestions.push("[[constelaciones-rizomiceliales]] (sugerido: nodo del sistema rhizomycelial)");
  }
  if (/\bgrafo\b|\bgrafo\b|\bconexion\b|\bconexión\b|\benlace\b|\bred\b/i.test(lowerText)) {
    suggestions.push("[[grafo-obsidian]] (sugerido: relevante para la visualización del grafo)");
  }
  if (/\bmemoria\b|\brecuerdo\b|\barchivo\b/i.test(lowerText)) {
    suggestions.push("[[nodo-memoria]] (sugerido: entrada relacionada con memoria/archivo)");
  }
  if (/\btransformacion\b|\btransformación\b|\bcambio\b|\bevolucion\b|\bevolución\b/i.test(lowerText)) {
    suggestions.push("[[nodo-transformación]] (sugerido: proceso de cambio o evolución)");
  }
  if (/\bcuerpo\b|\bcorporal\b|\bfísico\b|\bfisico\b/i.test(lowerText)) {
    suggestions.push("[[nodo-cuerpo]] (sugerido: dimensión corporal o material)");
  }
  if (/\btiempo\b|\btemporal\b|\bduracion\b|\bduración\b|\binstante\b/i.test(lowerText)) {
    suggestions.push("[[nodo-tiempo]] (sugerido: dimensión temporal)");
  }

  return [...new Set(suggestions)].slice(0, 6);
}

/**
 * Generate a unique note title from the corrected text.
 */
function generateNoteTitle(correctedText: string, date: Date): string {
  const snippet = correctedText
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50)
    .replace(/[^a-záéíóúüñ0-9\s]/gi, "")
    .trim();
  const dateStr = date.toISOString().slice(0, 10);
  return `${dateStr}-${snippet.replace(/\s+/g, "-").toLowerCase()}`.slice(0, 80);
}

/**
 * Generate Obsidian YAML frontmatter.
 */
export function generateFrontmatter(params: {
  title: string;
  tags: string[];
  categories: string[];
  inferredConnections: string[];
  createdAt: Date;
  hasCorrections: boolean;
  correctionCount: number;
}): string {
  const { title, tags, categories, inferredConnections, createdAt, correctionCount } = params;

  const tagsYaml = tags.map((t) => `  - ${t}`).join("\n");
  const categoriesYaml = categories.length > 0
    ? categories.map((c) => `  - ${c}`).join("\n")
    : "  []";
  const connectionsYaml = inferredConnections.length > 0
    ? inferredConnections.map((c) => `  - "${c}"`).join("\n")
    : "  []";

  return `---
title: "${title}"
date: ${createdAt.toISOString().slice(0, 10)}
time: ${createdAt.toTimeString().slice(0, 5)}
sistema: noXcuro
subsistema: constelaciones-rizomiceliales
categorias:
${categoriesYaml}
tags:
${tagsYaml}
conexiones_sugeridas:
${connectionsYaml}
correcciones_ortograficas: ${correctionCount}
estado: procesado
tipo: nota
llm_analisis: pendiente
---`;
}

/**
 * Full processing pipeline.
 */
export function processText(rawText: string): ProcessedText {
  const now = new Date();

  // Step 1: Correct spelling (only), output always lowercase
  const { correctedText, corrections } = correctSpelling(rawText);

  // Step 2: Detect categories
  const categories = detectCategories(correctedText);

  // Step 3: Extract tags
  const tags = extractTags(correctedText);

  // Step 4: Suggest connections
  const inferredConnections = suggestConnections(correctedText, categories);

  // Step 5: Generate note title
  const title = generateNoteTitle(correctedText, now);

  // Step 6: Generate frontmatter
  const frontmatterYaml = generateFrontmatter({
    title,
    tags,
    categories,
    inferredConnections,
    createdAt: now,
    hasCorrections: corrections.length > 0,
    correctionCount: corrections.length,
  });

  // Step 7: Build correction audit block
  const correctionAudit =
    corrections.length > 0
      ? `\n## 🔍 correcciones ortográficas realizadas\n\n${corrections
          .map((c) => `- **posición ${c.index}**: \`${c.original}\` → \`${c.corrected}\``)
          .join("\n")}\n`
      : "\n## 🔍 correcciones ortográficas realizadas\n\n_ninguna corrección necesaria_\n";

  // Step 8: Build full Obsidian markdown
  const obsidianMarkdown = `${frontmatterYaml}

## texto corregido

${correctedText}
${correctionAudit}
## original (auditoría)

> ${rawText.replace(/\n/g, "\n> ")}

## conexiones sugeridas (inferidas — no verificadas)

${inferredConnections.length > 0 ? inferredConnections.join("\n") : "_sin conexiones sugeridas en esta entrada_"}
`;

  return {
    originalText: rawText,
    correctedText,
    corrections,
    tags,
    categories,
    inferredConnections,
    frontmatterYaml,
    obsidianMarkdown,
    processedAt: now.toISOString(),
  };
}
