/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Vercel Blob serve em *.public.blob.vercel-storage.com
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
    // Pontos de breakpoint usados pelo next/image para gerar srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2400],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    // Permite usar server actions com payloads de imagem
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
