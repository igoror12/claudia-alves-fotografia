import Anthropic from "@anthropic-ai/sdk";

// ─── Cliente partilhado ───────────────────────────────────────────
// Lazy: só instancia se a chave existe, para não rebentar em build
// caso a env var ainda não esteja definida (ex: preview deployments).
// `cachedClient` é privado pelo escopo do módulo (não é exportado),
// não precisa de underscore prefix — convenção PT/JS obsoleta.
let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não definida. Configura no .env ou nas envs do Vercel."
    );
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

// ─── Tipos ────────────────────────────────────────────────────────
export type PhotoMetadata = {
  altText: string;
  keywords: string[];
  description?: string;
};

const VALID_CATEGORIES = ["retratos", "casamentos", "eventos"] as const;
export type CategorySlug = (typeof VALID_CATEGORIES)[number];

// ─── Helpers ──────────────────────────────────────────────────────
/**
 * Extrai o primeiro bloco JSON do texto. Claude por vezes envolve em
 * markdown (```json ... ```), por isso fazemos parse robusto.
 */
function extractJSON<T>(text: string): T | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/**
 * Converte uma URL pública de imagem num bloco Anthropic vision.
 * Usamos sempre URL (mais barato em tokens que base64) — as variantes
 * já estão alojadas no Vercel Blob com URL imutável.
 *
 * O SDK @anthropic-ai/sdk@0.91+ suporta `{ type: "url", url }` como
 * source válido em ImageBlockParam. Tipamos explicitamente para apanhar
 * regressões se um dia a forma do SDK mudar.
 */
function imageBlock(imageUrl: string): Anthropic.ImageBlockParam {
  return {
    type: "image",
    source: {
      type: "url",
      url: imageUrl,
    },
  };
}

// ─── 1. Geração de alt-text + keywords SEO ───────────────────────
/**
 * Gera alt-text (acessibilidade WCAG) e keywords SEO em PT-PT
 * a partir de uma fotografia já processada.
 *
 * Estratégia de prompt:
 * - Persona explícita (revisora de fotografia) para tom profissional
 * - Restrições duras (≤120 chars no alt) que o modelo respeita bem
 * - Requer JSON com schema fixo → parsing simples
 */
export async function generatePhotoMetadata(
  imageUrl: string,
  hintTitle?: string
): Promise<PhotoMetadata> {
  const titleHint = hintTitle
    ? `\n\nO fotógrafo deu o título indicativo: "${hintTitle}". Usa-o como pista mas não o repitas literalmente.`
    : "";

  const systemPrompt = `És uma editora especializada em fotografia de autor a trabalhar para a fotógrafa portuguesa Cláudia Alves (Braga). Escreves sempre em Português Europeu (PT-PT, não PT-BR).

A tua tarefa é gerar metadados para acessibilidade e SEO de uma fotografia, sem floreados nem exageros.

Regras absolutas:
1. alt: descreve OBJETIVAMENTE o que se vê (pessoas, ação, ambiente, luz). Máximo 120 caracteres. Sem palavras como "imagem de", "fotografia de" — começa direto na cena.
2. keywords: 5-8 termos curtos em minúsculas, mistura de descritivos visuais ("luz natural", "retrato preto e branco") e intenção ("fotografia casamento braga"). Sem hashtags.
3. description: 1 frase opcional (≤200 chars) com tom mais editorial, só se a cena tiver leitura emocional clara. Senão, omite.

Devolve EXCLUSIVAMENTE JSON válido com esta forma:
{"alt": "...", "keywords": ["...","..."], "description": "..."}`;

  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 400,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          imageBlock(imageUrl),
          {
            type: "text",
            text: `Analisa esta fotografia e devolve o JSON conforme as regras.${titleHint}`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

  const parsed = extractJSON<{
    alt?: string;
    keywords?: string[];
    description?: string;
  }>(raw);

  // Fallback defensivo — nunca devolver alt vazio (acessibilidade falha).
  const altText = (parsed?.alt ?? "").trim() || "Fotografia por Cláudia Alves";
  const keywords = Array.isArray(parsed?.keywords)
    ? parsed!.keywords.slice(0, 8).map((k) => String(k).toLowerCase().trim()).filter(Boolean)
    : [];

  return {
    altText: altText.slice(0, 140),
    keywords,
    description: parsed?.description?.trim() || undefined,
  };
}

// ─── 2. Categorização automática ─────────────────────────────────
/**
 * Devolve o slug da categoria mais provável: "retratos" | "casamentos" | "eventos".
 * Usa um max_tokens muito pequeno (10) — é uma classificação, não geração.
 */
export async function categorizePhoto(imageUrl: string): Promise<CategorySlug> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 10,
    system: `Classificas fotografias em UMA de três categorias: "retratos", "casamentos", "eventos".

Critérios:
- casamentos: noivos, vestido de noiva, alianças, cerimónia religiosa/civil, festa de casamento, ramo de noiva.
- retratos: foco numa ou poucas pessoas em sessão dedicada (família, gravidez, individual editorial), sem contexto de evento social.
- eventos: festas, batizados, aniversários, lançamentos, eventos corporativos, concertos.

Em caso de dúvida entre casamentos e eventos, escolhe casamentos se houver noivos visíveis.

Responde APENAS com a palavra única: retratos, casamentos ou eventos. Sem pontuação, sem explicação.`,
    messages: [
      {
        role: "user",
        content: [imageBlock(imageUrl), { type: "text", text: "Categoria?" }],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw =
    textBlock && textBlock.type === "text" ? textBlock.text.toLowerCase().trim() : "";

  const match = VALID_CATEGORIES.find((c) => raw.includes(c));
  return match ?? "retratos"; // fallback seguro
}

// ─── 3. Resumo + estimativa de orçamento (chatbot contacto) ──────
/**
 * A partir do formulário de contacto, gera um resumo curto para a Cláudia
 * ler de relance no admin + uma estimativa de gama de preço.
 *
 * As gamas vêm do briefing comercial — afina conforme negócio evolui.
 */
export type ContactAISummary = {
  summary: string;
  estimate: string;
};

export async function summarizeContactRequest(input: {
  name: string;
  email: string;
  sessionType: string;
  desiredDate?: string;
  message: string;
}): Promise<ContactAISummary> {
  const systemPrompt = `És assistente da fotógrafa Cláudia Alves (Braga, Portugal). Recebes pedidos de contacto em Português e produzes um resumo executivo curto (1-2 frases) e uma estimativa de orçamento em euros.

Gama de preços indicativa (não comuniques ao cliente, é interno):
- Retrato individual / família: €180 - €350
- Sessão gravidez ou newborn: €250 - €450
- Casamento meia-jornada (4h): €1.200 - €1.800
- Casamento completo (8-10h): €1.800 - €2.800
- Casamento destination ou >10h: €2.800 - €4.500
- Evento corporativo (3-5h): €450 - €900
- Batizado / aniversário (2-3h): €280 - €500

Devolve EXCLUSIVAMENTE JSON:
{"summary":"…","estimate":"€X - €Y"}`;

  const userText = `Nome: ${input.name}
Email: ${input.email}
Tipo de sessão: ${input.sessionType}
Data pretendida: ${input.desiredDate ?? "não indicada"}
Mensagem:
${input.message}`;

  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 250,
    system: systemPrompt,
    messages: [{ role: "user", content: userText }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

  const parsed = extractJSON<{ summary?: string; estimate?: string }>(raw);

  return {
    summary: parsed?.summary?.trim() || "Pedido recebido — sem resumo automático.",
    estimate: parsed?.estimate?.trim() || "A definir após briefing.",
  };
}
