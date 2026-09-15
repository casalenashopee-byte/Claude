import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build enxuta para Docker (copia só o necessário para rodar em produção).
  output: "standalone",
  experimental: {
    // Produtos/catálogo enviam fotos como data URL (base64) direto no FormData
    // da Server Action — o limite padrão (1MB) estoura fácil com fotos de celular.
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
