import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "ioredis"],

  // A extensão .png na URL pública é cosmética — é o que torna o link colável em
  // Markdown. As rotas reais vivem em app/api/card-image/ e app/api/battle/.
  // Ordem importa: /battle/<id>.png precisa casar antes do genérico /<a>/<b>.png.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/battle/:battleId.png",
          destination: "/api/battle/:battleId/image",
        },
        {
          source: "/:owner/:repo.png",
          destination: "/api/card-image/:owner/:repo",
        },
        {
          source: "/:owner.png",
          destination: "/api/card-image/:owner",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
