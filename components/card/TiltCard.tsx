"use client";

import { useRef, useState } from "react";

/**
 * Carta interativa: inclinação 3D seguindo o mouse + glare radial, e a animação
 * de revelação que toca a cada visita (RFC 7.1 e 7.2).
 *
 * CSS 3D transform, não Three.js — decisão travada na RFC 7.1. Mais leve e já
 * validada nos dois repositórios de referência.
 *
 * **O que gira é o próprio PNG gerado pelo servidor**, não uma reimplementação da
 * carta em DOM. O gitfut mantém as duas versões sincronizadas copiando as mesmas
 * porcentagens entre o componente React e o renderizador (RFC 4.2, item 3); aqui
 * o problema simplesmente não existe, porque só há uma carta. O custo é que o
 * texto não é selecionável — compensado pela tabela de stats ao lado.
 */

const MAX_TILT = 12;

export function TiltCard({
  src,
  alt,
  priority = false,
  foil = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  /** Camada de foil especular, só nos tiers que a têm (`hasFoil`). */
  foil?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, active: false });

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    setTilt({
      // Mouse à direita inclina para a direita: o eixo Y gira no mesmo sentido
      // do cursor, o eixo X no sentido inverso.
      x: (0.5 - py) * MAX_TILT * 2,
      y: (px - 0.5) * MAX_TILT * 2,
      glareX: px * 100,
      glareY: py * 100,
      active: true,
    });
  }

  function reset() {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, active: false });
  }

  return (
    <div className="tilt-scene">
      <div
        ref={ref}
        className="tilt-card"
        data-active={tilt.active || undefined}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={
          {
            "--tilt-x": `${tilt.x}deg`,
            "--tilt-y": `${tilt.y}deg`,
            "--glare-x": `${tilt.glareX}%`,
            "--glare-y": `${tilt.glareY}%`,
          } as React.CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={500}
          height={700}
          fetchPriority={priority ? "high" : "auto"}
        />
        {foil ? <SpecularFoil x={tilt.glareX} y={tilt.glareY} /> : null}
        <span className="tilt-glare" aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * Foil especular ao vivo, por cima do PNG do servidor (RFC 7.1).
 *
 * Técnica derivada do ReflectiveCard do React Bits, sem a webcam que o original
 * usa como fonte de reflexo — pedir câmera para mostrar brilho numa carta é
 * troca ruim. O que foi mantido é a pilha de filtro que faz a diferença entre
 * foil e gradiente animado: ruído procedural vira relevo por `feDisplacementMap`,
 * e `feSpecularLighting` acende esse relevo a partir de um ponto de luz.
 *
 * A luz **não** anima sozinha: `fePointLight` segue o ponteiro, reaproveitando a
 * posição que o tilt já calcula. Um brilho em loop foi exatamente o que o autor
 * do projeto rejeitou; aqui a carta fica inerte até ser tocada, e o reflexo anda
 * junto com a inclinação em vez de competir com ela.
 *
 * Ver `docs/foil-especular.md`.
 */
function SpecularFoil({ x, y }: { x: number; y: number }) {
  return (
    <span className="tilt-foil" aria-hidden="true">
      <svg className="tilt-foil-svg" viewBox="0 0 100 140" preserveAspectRatio="none">
        <defs>
          <filter id="gitmon-foil" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.9"
              numOctaves="2"
              seed="7"
              result="ruido"
            />
            <feColorMatrix in="ruido" type="luminanceToAlpha" result="relevo" />
            <feSpecularLighting
              in="relevo"
              surfaceScale="6"
              specularConstant="1.1"
              specularExponent="22"
              lightingColor="#ffffff"
              result="luz"
            >
              <fePointLight x={x} y={y * 1.4} z="34" />
            </feSpecularLighting>
            <feComposite in="luz" in2="relevo" operator="in" />
          </filter>
        </defs>
        <rect width="100" height="140" filter="url(#gitmon-foil)" />
      </svg>
    </span>
  );
}
