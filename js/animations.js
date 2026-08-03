/**
 * animations.js
 * -----------------------------------------------------------------------
 * Concentra toda a orquestração de animação de UI (não a cena 3D).
 *
 * Motor único: GSAP core + ScrollTrigger.
 *  - Antes eram duas bibliotecas (Motion One + Anime.js), cada uma com seu
 *    próprio agendador interno. Consolidar em um único motor elimina
 *    overhead duplicado de scheduling e mantém todas as animações da
 *    página sincronizadas no mesmo ticker.
 *  - ScrollTrigger substitui os observers de "inView" manuais: usa um
 *    único listener de scroll global e otimizado (RAF-batched), em vez de
 *    cada função registrar sua própria lógica de interseção.
 *  - O cursor customizado passa a rodar no gsap.ticker (já ativo por causa
 *    do ScrollTrigger) em vez de abrir um requestAnimationFrame próprio,
 *    removendo um loop de animação concorrente da página.
 *
 * Cada função é pequena e recebe elementos já resolvidos via querySelector,
 * mantendo responsabilidade única e fácil de testar isoladamente.
 * -----------------------------------------------------------------------
 */

import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

/** Respeita a preferência de movimento reduzido do usuário em toda a UI. */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Curva de easing padrão do design system. Equivale a
 * --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1) do style.css, que é a
 * curva conhecida como "easeOutQuint" — mapeada de forma nativa pelo GSAP
 * como "power4.out", sem necessidade do plugin pago CustomEase.
 */
const EASE_STANDARD = 'power4.out';

/**
 * Efeito de "digitação" para o cargo em destaque no Hero, alternando entre
 * os papéis definidos no idioma atual. Usa um proxy numérico animado pelo
 * GSAP para controlar o timing caractere a caractere de forma performática.
 * @param {HTMLElement} el - elemento de destino do texto
 * @param {string[]} roles - lista de textos a alternar
 */
export function startRoleTypewriter(el, roles) {
  if (!el || !roles?.length) return () => {};
  let roleIndex = 0;
  let cancelled = false;

  // Anima um contador de caracteres visíveis de 0 até o total do texto.
  const typeRole = (text) => new Promise((resolve) => {
    el.textContent = '';
    const chars = text.split('');
    const proxy = { count: 0 };
    gsap.to(proxy, {
      count: chars.length,
      duration: prefersReducedMotion ? 0 : chars.length * 0.045,
      ease: 'none',
      onUpdate: () => {
        el.textContent = chars.slice(0, Math.round(proxy.count)).join('');
      },
      onComplete: resolve,
    });
  });

  // Anima o contador de caracteres visíveis do total até 0 (apagando).
  const eraseRole = (text) => new Promise((resolve) => {
    const chars = text.split('');
    const proxy = { count: chars.length };
    gsap.to(proxy, {
      count: 0,
      duration: prefersReducedMotion ? 0 : chars.length * 0.028,
      ease: 'none',
      onUpdate: () => {
        el.textContent = chars.slice(0, Math.round(proxy.count)).join('');
      },
      onComplete: resolve,
    });
  });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, prefersReducedMotion ? 0 : ms));

  (async function loop() {
    while (!cancelled) {
      const current = roles[roleIndex % roles.length];
      await typeRole(current);
      await wait(1800);
      await eraseRole(current);
      await wait(400);
      roleIndex += 1;
    }
  })();

  // Retorna função de limpeza para interromper o loop (ex: troca de idioma)
  return () => {
    cancelled = true;
  };
}

/**
 * Anima contadores numéricos (usados nas estatísticas da seção Sobre) do
 * zero até o valor final quando entram na viewport. Cada contador recebe
 * seu próprio ScrollTrigger "once", disparado apenas na primeira entrada.
 * @param {NodeListOf<HTMLElement>} counters - elementos com [data-count-to]
 */
export function animateCounters(counters) {
  counters.forEach((counter) => {
    ScrollTrigger.create({
      trigger: counter,
      start: 'top bottom',
      once: true,
      onEnter: () => {
        const rawTarget = counter.dataset.countTo;
        const numericTarget = parseFloat(rawTarget);

        // Valores não numéricos (ex: "∞") apenas recebem um fade-in, sem contagem.
        if (Number.isNaN(numericTarget)) {
          gsap.fromTo(counter, { opacity: 0 }, { opacity: 1, duration: 0.6 });
          return;
        }

        const proxy = { value: 0 };
        gsap.to(proxy, {
          value: numericTarget,
          duration: prefersReducedMotion ? 0 : 1.4,
          ease: 'expo.out',
          onUpdate: () => {
            counter.textContent = `${Math.round(proxy.value)}${rawTarget.includes('+') ? '+' : ''}`;
          },
        });
      },
    });
  });
}

/**
 * Aplica reveal (fade + slide up) a qualquer coleção de elementos conforme
 * entram na viewport. Cada elemento recebe um ScrollTrigger "once", que se
 * desregistra sozinho após disparar — leve o suficiente para grids grandes.
 * @param {string} selector - seletor CSS dos elementos a revelar
 */
export function initScrollReveals(selector = '[data-reveal]') {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0 : 0.7,
            ease: EASE_STANDARD,
            force3D: true,
            // Remove opacity/transform do style inline ao terminar: sem isso,
            // o inline style do GSAP passa a vencer qualquer :hover do CSS
            // (inline sempre tem prioridade sobre regras de stylesheet).
            clearProps: 'opacity,transform',
          }
        );
      },
    });
  });
}

/**
 * Anima a entrada de um grupo de cards com stagger (usado em grids).
 * Dispara uma única vez por grupo quando ele entra na viewport, animando
 * todos os cards filhos em cascata a partir do mesmo ScrollTrigger — mais
 * leve do que um observer por card.
 */
export function revealCardGroup(groupSelector) {
  const groups = document.querySelectorAll(groupSelector);
  groups.forEach((group) => {
    const cards = group.querySelectorAll(':scope > *');
    if (!cards.length) return;

    ScrollTrigger.create({
      trigger: group,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 32, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: EASE_STANDARD,
            stagger: prefersReducedMotion ? 0 : 0.08,
            force3D: true,
            // Idem: limpa o style inline ao final para não sobrepor os
            // hovers/foco dos cards, que são controlados via CSS.
            clearProps: 'opacity,transform',
          }
        );
      },
    });
  });
}

/**
 * Fade-in geral do Hero ao carregar a página (nome, descrição, CTAs).
 * Usa uma única timeline do GSAP: todos os elementos entram sincronizados
 * num só motor, com posicionamento absoluto (em segundos) equivalente aos
 * delays originais.
 */
export function playHeroIntro() {
  const timeline = [
    ['[data-hero-eyebrow]', { y: -8 }, 0],
    ['[data-hero-name]', { y: 24 }, 0.1],
    ['[data-hero-role]', {}, 0.25],
    ['[data-hero-description]', { y: 16 }, 0.35],
    ['[data-hero-actions]', { y: 16 }, 0.45],
    ['[data-hero-portrait]', { scale: 0.92 }, 0.15],
  ];

  const tl = gsap.timeline();

  timeline.forEach(([selector, fromExtra, delay]) => {
    const el = document.querySelector(selector);
    if (!el) return;
    tl.fromTo(
      el,
      { opacity: 0, ...fromExtra },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: prefersReducedMotion ? 0 : 0.9,
        ease: EASE_STANDARD,
        force3D: true,
      },
      delay
    );
  });
}

/**
 * Header que reage ao scroll: reduz altura e ganha fundo sólido.
 * Usa o listener de scroll global do ScrollTrigger (compartilhado com as
 * demais funções desta camada) em vez de um "scroll" dedicado, evitando
 * múltiplos handlers concorrentes disparando a cada pixel rolado.
 */
export function initHeaderScrollState(header) {
  if (!header) return;
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      header.classList.toggle('is-scrolled', self.scroll() > 24);
    },
  });
}

/**
 * Barra de progresso de leitura no topo da página, atualizada no scroll.
 * Reaproveita o mesmo ScrollTrigger global, aplicando o progresso (0–1)
 * diretamente como scaleX, sem recalcular manualmente scrollHeight a cada
 * evento.
 */
export function initScrollProgressBar(bar) {
  if (!bar) return;
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      gsap.set(bar, { scaleX: self.progress });
    },
  });
}

/**
 * Cursor customizado: círculo que segue o mouse com leve atraso (easing).
 * Mantém exatamente a mesma matemática de interpolação (lerp 0.18/frame),
 * mas agora agendada pelo gsap.ticker em vez de um requestAnimationFrame
 * próprio — reaproveita o loop que o ScrollTrigger já mantém ativo, ao
 * invés de somar mais um loop de animação rodando em paralelo na página.
 */
export function initCustomCursor(cursorEl) {
  if (!cursorEl || matchMedia('(pointer: coarse)').matches) return;
  document.body.classList.add('has-custom-cursor');
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let targetX = x;
  let targetY = y;

  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  const interactiveSelectors = 'a, button, [data-cursor-grow]';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(interactiveSelectors)) cursorEl.classList.add('is-active');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(interactiveSelectors)) cursorEl.classList.remove('is-active');
  });

  gsap.ticker.add(() => {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;
    // Escrita direta em style.transform: mais leve que gsap.set() num loop
    // por frame, já que dispensa o parsing de propriedades do CSSPlugin.
    cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

/** Efeito ripple ao clicar em botões/cards marcados com [data-ripple]. */
export function initRippleEffect() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-ripple]');
    if (!target) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

/** Anima abertura/fechamento do menu mobile com fade + slide. */
export function toggleMobileMenu(menuEl, isOpen) {
  if (!menuEl) return;
  if (isOpen) {
    menuEl.hidden = false;
    gsap.fromTo(
      menuEl,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: prefersReducedMotion ? 0 : 0.3, ease: EASE_STANDARD, force3D: true }
    );
  } else {
    gsap.to(menuEl, {
      opacity: 0,
      y: -12,
      duration: prefersReducedMotion ? 0 : 0.2,
      ease: EASE_STANDARD,
      force3D: true,
      onComplete: () => {
        menuEl.hidden = true;
      },
    });
  }
}

/** Filtro de projetos: fade-out dos cards escondidos, fade-in dos visíveis. */
export function filterProjectCards(cards, category) {
  cards.forEach((card) => {
    const matches = category === 'all' || card.dataset.category === category;
    if (matches) {
      card.style.display = '';
      gsap.fromTo(
        card,
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: EASE_STANDARD,
          force3D: true,
          clearProps: 'opacity,transform',
        }
      );
    } else {
      gsap.to(card, {
        opacity: 0,
        scale: 0.96,
        duration: 0.2,
        ease: EASE_STANDARD,
        force3D: true,
        onComplete: () => {
          card.style.display = 'none';
        },
      });
    }
  });
}
