# Referência de foil — técnica derivada do ReflectiveCard (React Bits)

Fonte: `DavidHDev/react-bits`, `src/ts-default/Components/ReflectiveCard/`. MIT + Commons Clause.

**O que foi descartado:** o componente original alimenta o reflexo com a webcam do visitante (`navigator.mediaDevices.getUserMedia`) e traz conteúdo de crachá (nome, cargo, ID) mais ícones `lucide-react`. Nada disso entra. Aproveita-se só a pilha de filtro.

**O que foi mantido:** o filtro SVG que produz relevo metálico com luz especular. É isso que diferencia foil de TCG de um gradiente animado.

```
feTurbulence      type="turbulence" baseFrequency=0.03/noiseScale numOctaves=2   → ruído procedural
feColorMatrix     luminanceToAlpha                                               → ruído vira mapa alpha
feDisplacementMap scale=displacementStrength (20) xChannel=R yChannel=G          → ondula a superfície
feSpecularLighting surfaceScale=20 specularConstant=1.2 specularExponent=20
                   lightingColor=#ffffff + fePointLight                          → brilho especular
feComposite       operator="in"                                                  → recorta o brilho
feBlend           mode="screen"                                                  → funde com a superfície
```

## Adaptação para o gitmon

| Original | Aqui |
|---|---|
| `<video>` com webcam como camada de reflexo | camada de gradiente estático de ambiente sob o filtro |
| `fePointLight` em posição fixa `x=0 y=0 z=300` | `x`/`y` seguem o ponteiro, reaproveitando `--glare-x` / `--glare-y` que o `TiltCard` já calcula |
| Loop automático | sem loop: a luz só se move com o cursor |
| Aplicado ao card inteiro como container | camada `position: absolute; inset: 0` **sobre o PNG**, dentro do `.tilt-card` existente (RFC 7.1) |
| Sempre ativo | só quando `hasFoil(rarity)` é true — tiers `holo` e `secret` |

Camadas de apoio que valem manter do CSS original, todas por cima do PNG:

```css
/* grão metálico */
.reflective-noise {
  opacity: var(--roughness, 0.4);
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,...feTurbulence baseFrequency='0.8' numOctaves='3'...");
}

/* sheen diagonal */
.reflective-sheen {
  background: linear-gradient(135deg,
    rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%,
    rgba(255,255,255,0)  50%, rgba(255,255,255,0.1) 60%,
    rgba(255,255,255,0.3) 100%);
  mix-blend-mode: overlay;
  opacity: var(--metalness, 1);
}

/* borda com máscara xor — vira moldura de raridade */
.reflective-border {
  padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.6));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
```

`prefers-reduced-motion: reduce` já zera transições globalmente em `app/globals.css`; a camada deve virar brilho estático, não sumir.
