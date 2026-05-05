import sharp from "sharp";
import { put } from "@vercel/blob";

// ─── Configuração das variantes responsive ────────────────────────
// Estes três tamanhos cobrem o site inteiro com next/image:
// - thumb:   400px  → grids densos, lazy load, ~70KB
// - medium:  1200px → cards normais, hero individual, ~250-400KB
// - full:    2400px → lightbox/zoom em ecrãs Retina/4K, ~800KB-1.2MB
//
// Os originais só são guardados se STORE_ORIGINAL_UPLOADS=true. O Vercel Blob
// expõe ficheiros publicamente, por isso o modo seguro é guardar só variantes.
const VARIANTS = [
  { name: "thumb", width: 480, quality: 80 },
  { name: "medium", width: 1600, quality: 88 },
  { name: "full", width: 2800, quality: 92 },
] as const;

export type ProcessedImage = {
  thumbUrl: string;
  mediumUrl: string;
  fullUrl: string;
  originalUrl?: string;
  blurDataUrl: string;
  width: number;
  height: number;
  exif: {
    camera?: string;
    lens?: string;
    settings?: string;
    shotAt?: Date;
  };
};

/**
 * Processa um upload de fotografia gerando 3 variantes WebP responsive,
 * criando blur placeholder e extraindo EXIF.
 *
 * Estratégia de qualidade:
 * - WebP em vez de JPEG → ~30% menor com qualidade visualmente equivalente
 * - quality progressiva (80/88/92) → thumbs comprimem mais agressivo
 * - sRGB color profile forçado → consistência cross-browser
 * - mantém EXIF rotation (orienta corretamente fotos de telemóvel)
 * - chroma subsampling 4:4:4 nas variantes grandes (cores mais fiéis em pele)
 */
export async function processAndUploadPhoto(
  file: Buffer,
  originalFilename: string
): Promise<ProcessedImage> {
  // Pipeline base: rotaciona pelo EXIF, força sRGB para web
  const basePipeline = sharp(file, { failOn: "none" })
    .rotate() // aplica EXIF orientation e remove a tag
    .toColorspace("srgb");

  const metadata = await basePipeline.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Não foi possível ler as dimensões da imagem.");
  }

  // ─── Geração paralela das 3 variantes ──────────────────────────
  const variantBuffers = await Promise.all(
    VARIANTS.map(async (v) => {
      const buf = await basePipeline
        .clone()
        .resize({
          width: v.width,
          withoutEnlargement: true, // não estica fotos pequenas
          fit: "inside",
        })
        .webp({
          quality: v.quality,
          // smartSubsample = true → preserva crominância em peles e tecidos
          // (equivalente a 4:4:4 em JPEG; default WebP é 4:2:0).
          // Em thumbs deixamos default para máxima compressão.
          smartSubsample: v.name !== "thumb",
          effort: 5, // 0-6, 5 = bom ratio compressão/tempo
        })
        .toBuffer();
      return { name: v.name, buf };
    })
  );

  // Blur placeholder (data URL embutido, ~120 bytes em base64)
  const blurBuf = await basePipeline
    .clone()
    .resize(16) // 16px mantém a base64 mínima
    .webp({ quality: 30 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  // Nome seguro para variantes e, opcionalmente, para o original.
  const safeName = originalFilename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  const stamp = Date.now();

  // ─── Upload paralelo para Vercel Blob ──────────────────────────
  const uploadOriginal = process.env.STORE_ORIGINAL_UPLOADS === "true";
  const variantUploads = await Promise.all(
    variantBuffers.map((v) =>
      put(`photos/${stamp}-${v.name}-${safeName}.webp`, v.buf, {
        access: "public",
        contentType: "image/webp",
        cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 ano (URLs são imutáveis)
      })
    )
  );
  const original = uploadOriginal
    ? await put(`photos/originals/${stamp}-${safeName}`, file, {
        access: "public",
        contentType: metadata.format ? `image/${metadata.format}` : "image/jpeg",
      })
    : null;

  const [thumb, medium, full] = variantUploads;

  // ─── EXIF útil para mostrar credibilidade ──────────────────────
  const exif = parseExif(metadata);

  return {
    thumbUrl: thumb.url,
    mediumUrl: medium.url,
    fullUrl: full.url,
    originalUrl: original?.url,
    blurDataUrl,
    width: metadata.width,
    height: metadata.height,
    exif,
  };
}

function parseExif(meta: sharp.Metadata): ProcessedImage["exif"] {
  // Sharp expõe EXIF como Buffer raw; usamos só o que conseguimos
  // ler de forma fiável sem dependências adicionais.
  const out: ProcessedImage["exif"] = {};
  if (meta.exif) {
    // Tentamos extrair via biblioteca exifr só se necessário no futuro.
    // Por agora deixamos campos vazios — a Cláudia preenche manualmente
    // no admin, ou o IA preenche.
  }
  return out;
}
