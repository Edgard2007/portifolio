/**
 * intro.js
 * -----------------------------------------------------------------------
 * Sequência de ingresso: a tela cheia exibida uma única vez por sessão de
 * navegação, antes do conteúdo real do site. Dois palcos convivem no DOM
 * (ver #ingress em index.html) — qual deles é visível é decidido só por
 * CSS a partir de [data-theme]; este módulo apenas anima o que já está
 * visível, usando anime.js (import via CDN, ver importmap em index.html).
 *
 * Responsabilidade única: animar a entrada e devolver o controle ao
 * chamador (main.js) quando termina. Não conhece tema, i18n nem cena 3D —
 * só lê o [data-theme] atual pra saber qual palco animar.
 *
 * Falhas de rede (CDN do anime.js fora do ar) ou qualquer erro durante a
 * sequência nunca travam o site: o catch mais externo sempre revela o
 * conteúdo imediatamente, sem tela presa. Nenhum dado pessoal é lido,
 * gerado ou persistido aqui — a única gravação em sessionStorage é uma
 * flag booleana de UI (a sequência já foi exibida nesta aba).
 * -----------------------------------------------------------------------
 */

/** Chave de sessão: evita repetir a sequência em recargas dentro da mesma aba. */
const SESSION_KEY = "portfolio:ingressPlayed";

/** Teto de segurança: se a sequência travar por qualquer motivo, força a revelação do site após esse tempo. */
const SAFETY_TIMEOUT_MS = 6000;

/**
 * Ponto de entrada público. Deve ser chamado (e aguardado) antes de
 * qualquer animação de revelação do conteúdo (ex.: playHeroIntro), pra
 * não competir visualmente com a sequência de ingresso.
 * @returns {Promise<void>} resolve quando o site já pode ser mostrado.
 */
export async function playIngressSequence() {
    const root = document.querySelector("[data-ingress]");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";

    if (reducedMotion || alreadyPlayed) {
        dismiss(root);
        return;
    }

    lockScroll();

    let anime;
    try {
        anime = await import("animejs");
    } catch (error) {
        // A CDN do anime.js pode estar indisponível — isso nunca deve
        // impedir o acesso ao portfólio. Registra o diagnóstico e revela
        // o site sem animação.
        console.error("[ingress] Falha ao carregar anime.js; pulando a sequência de entrada.", error);
        dismiss(root);
        unlockScroll();
        return;
    }

    try {
        await Promise.race([runSequence(root, anime), wait(SAFETY_TIMEOUT_MS)]);
    } catch (error) {
        console.error("[ingress] Erro durante a sequência de entrada; revelando o site.", error);
    } finally {
        sessionStorage.setItem(SESSION_KEY, "1");
        dismiss(root);
        unlockScroll();
    }
}

/** Promise utilitária para o teto de segurança. */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Trava o scroll da página enquanto a sequência ocupa a tela cheia. */
function lockScroll() {
    document.documentElement.classList.add("has-ingress");
}

function unlockScroll() {
    document.documentElement.classList.remove("has-ingress");
}

/** Esconde o overlay de forma definitiva e idempotente (seguro chamar mais de uma vez). */
function dismiss(root) {
    root.hidden = true;
}

/**
 * Executa a animação do palco correspondente ao tema atual e resolve
 * quando a transição de saída termina.
 * @param {HTMLElement} root - elemento [data-ingress]
 * @param {typeof import('animejs')} anime - módulo do anime.js já carregado
 */
function runSequence(root, anime) {
    const { animate } = anime;

    return new Promise(resolve => {
        let settled = false;
        const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        const stage = root.querySelector(theme === "light" ? "[data-ingress-blueprint]" : "[data-ingress-horizon]");
        if (!stage) {
            resolve();
            return;
        }

        /** Garante que a saída só é disparada uma vez, venha ela do fim natural da animação ou de um "pular". */
        const finish = () => {
            if (settled) return;
            settled = true;
            exitStage(animate, root, stage, theme, resolve);
        };

        wireSkip(root, finish);

        // Um frame de folga antes de disparar tudo: o overlay acabou de
        // ficar visível (painel ainda em opacity:0) e createDrawable faz
        // getTotalLength() em vários elementos de uma vez, o que força
        // layout. Rodar isso no mesmo frame em que o overlay aparece é a
        // causa mais comum de engasgo na abertura — um requestAnimationFrame
        // deixa esse primeiro frame assentar antes de começar o trabalho pesado.
        requestAnimationFrame(() => {
            if (theme === "dark") {
                playHorizonStage(anime, stage, finish);
            } else {
                playBlueprintStage(anime, stage, finish);
            }
        });
    });
}

/** Liga o botão "pular" e a tecla Escape a uma finalização antecipada da sequência. */
function wireSkip(root, finish) {
    const skipButton = root.querySelector("[data-ingress-skip]");
    skipButton?.addEventListener("click", finish, { once: true });
    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") finish();
        },
        { once: true },
    );
}

/**
 * Anima o medidor de progresso ("Aproximação") de 0% a 100% usando um
 * objeto proxy simples — o mesmo padrão usado pelos contadores da seção
 * Sobre (ver animateCounters em animations.js), só que aqui com anime.js.
 */
function animateMeter(animate, stage, { delay, duration, onComplete }) {
    const fill = stage.querySelector("[data-ingress-fill]");
    const value = stage.querySelector("[data-ingress-value]");
    const proxy = { percent: 0 };

    animate(proxy, {
        percent: 100,
        duration,
        delay,
        ease: "inOutQuad",
        onUpdate: () => {
            const rounded = Math.round(proxy.percent);
            if (fill) fill.style.width = `${rounded}%`;
            if (value) value.textContent = `${rounded}%`;
        },
        onComplete,
    });
}

/**
 * Sequência do palco escuro: horizonte de eventos. Marcas de instrumento,
 * núcleo, anéis de acreção desenhados a traço e telemetria — nessa ordem.
 * @param {typeof import('animejs')} anime
 */
function playHorizonStage(anime, stage, finish) {
    const { animate, svg } = anime;
    const panel = stage.querySelector("[data-ingress-panel]");
    const ticks = stage.querySelectorAll(".ingress__tick");
    const stars = stage.querySelectorAll(".ingress__star");
    const core = stage.querySelector("[data-ingress-core]");
    const rings = stage.querySelectorAll(".ingress-ring--horizon");
    const telemetry = stage.querySelectorAll("[data-ingress-telemetry] span");

    animate(panel, { opacity: [0, 1], duration: 300, ease: "outQuad" });

    animate([...stars, ...ticks], {
        opacity: [0, 1],
        scale: [0.4, 1],
        duration: 420,
        delay: (el, i) => i * 30,
        ease: "outQuad",
    });

    animate(core, {
        opacity: [0, 1],
        scale: [0, 1],
        duration: 700,
        delay: 150,
        ease: "outExpo",
    });

    animate(svg.createDrawable(rings), {
        draw: ["0 0", "0 1"],
        duration: 900,
        delay: (el, i) => 320 + i * 170,
        ease: "inOutQuad",
    });

    animate(telemetry, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        delay: (el, i) => 950 + i * 130,
        ease: "outExpo",
    });

    animateMeter(animate, stage, { delay: 1050, duration: 1450, onComplete: finish });
}

/**
 * Sequência do palco claro: planta técnica do foguete. Traça a linha de
 * centro, o casco, as duas aletas, a vigia e as linhas de cota — como um
 * desenho de engenharia sendo finalizado — e fecha com telemetria/medidor.
 * Cada grupo é selecionado por uma âncora semântica própria (ver markup em
 * index.html), sem depender de posição ou combinadores CSS frágeis.
 * @param {typeof import('animejs')} anime
 */
function playBlueprintStage(anime, stage, finish) {
    const { animate, svg } = anime;
    const panel = stage.querySelector("[data-ingress-panel]");
    const centerline = stage.querySelector("[data-ingress-centerline]");
    const hull = stage.querySelector("[data-ingress-hull]");
    const boosters = stage.querySelectorAll("[data-ingress-fin]");
    const windowRings = stage.querySelectorAll("[data-ingress-window]");
    const dimensionLines = stage.querySelectorAll("[data-ingress-dimension]");
    const labels = stage.querySelectorAll("[data-ingress-fade]");
    const telemetry = stage.querySelectorAll("[data-ingress-telemetry] span");

    animate(panel, { opacity: [0, 1], duration: 300, ease: "outQuad" });

    animate(svg.createDrawable(centerline), {
        draw: ["0 0", "0 1"],
        duration: 450,
        delay: 100,
        ease: "outQuad",
    });

    animate(svg.createDrawable(hull), {
        draw: ["0 0", "0 1"],
        duration: 1000,
        delay: 250,
        ease: "inOutQuad",
    });

    animate(svg.createDrawable(boosters), {
        draw: ["0 0", "0 1"],
        duration: 450,
        delay: (el, i) => 1150 + i * 110,
        ease: "inOutQuad",
    });

    animate(svg.createDrawable(windowRings), {
        draw: ["0 0", "0 1"],
        duration: 400,
        delay: (el, i) => 1750 + i * 110,
        ease: "outQuad",
    });

    animate(svg.createDrawable(dimensionLines), {
        draw: ["0 0", "0 1"],
        duration: 500,
        delay: (el, i) => 1950 + i * 130,
        ease: "inOutQuad",
    });

    animate(labels, {
        opacity: [0, 1],
        duration: 450,
        delay: (el, i) => 2300 + i * 80,
        ease: "outQuad",
    });

    animate(telemetry, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        delay: (el, i) => 950 + i * 130,
        ease: "outExpo",
    });

    animateMeter(animate, stage, { delay: 1000, duration: 2150, onComplete: finish });
}

/**
 * Transição de saída: some com o palco revelando o conteúdo real por
 * baixo. Cada tema sai do jeito que combina com seu conceito visual —
 * o horizonte "engole" o painel (escala + fade), a planta "desliza pra
 * fora" como se a folha fosse retirada de cima da mesa (translação + fade).
 */
function exitStage(animate, root, stage, theme, resolve) {
    const exitTransform = theme === "dark" ? { scale: [1, 1.06] } : { translateY: [0, -32] };

    animate(stage, {
        opacity: [1, 0],
        ...exitTransform,
        duration: 550,
        ease: "inExpo",
        onComplete: () => {
            root.hidden = true;
            resolve();
        },
    });
}
