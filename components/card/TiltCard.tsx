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
}: {
  src: string;
  alt: string;
  priority?: boolean;
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
        <span className="tilt-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
