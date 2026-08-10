/**
 * main.js
 * -----------------------------------------------------------------------
 * Ponto de entrada da aplicação. Responsabilidades:
 *  - Inicializar a cena 3D (scene.js) e o loop de animação.
 *  - Inicializar microinterações e reveals (animations.js).
 *  - Gerenciar tema (claro/escuro) com persistência em localStorage.
 *  - Gerenciar internacionalização (pt-BR / en-US / de-DE) sem reload.
 *  - Popular dinamicamente seções orientadas a dados (cursos, tecnologias,
 *    projetos, educação) a partir do dicionário de traduções.
 *  - Lidar com o formulário de contato de forma privacy-safe: nenhum dado
 *    pessoal é persistido em localStorage, logs ou URL (Privacy by Default).
 * -----------------------------------------------------------------------
 */

import {
    animateCounters,
    filterProjectCards,
    initCustomCursor,
    initHeaderScrollState,
    initRippleEffect,
    initScrollProgressBar,
    initScrollReveals,
    playHeroIntro,
    revealCardGroup,
    startRoleTypewriter,
    toggleMobileMenu,
} from "./animations.js";
import { SpaceScene } from "./scene.js";
import { resolveTranslation, translations } from "./translations.js";
import { playIngressSequence } from "./intro.js";

// Chaves usadas no localStorage — apenas preferências de UI, nunca dados pessoais.
const STORAGE_KEYS = {
    theme: "portfolio:theme",
    locale: "portfolio:locale",
};

const SUPPORTED_LOCALES = ["pt-BR", "en-US", "de-DE"];
const DEFAULT_LOCALE = "pt-BR";

let stopTypewriter = () => {};

/**
 * Grade de tecnologias. Cada item usa um "glyph" (sigla em texto, sem
 * depender de rede) por padrão. Para usar uma imagem no lugar, basta
 * adicionar a propriedade "icon" apontando pro arquivo — quando presente,
 * a imagem substitui o glifo automaticamente (ver renderTechGrid). Veja o
 * README.md, seção "Tecnologias", para o passo a passo com exemplo.
 */
const TECH_STACK = [
    { name: "HTML5", glyph: "H5", icon: "assets/images/tech/html-5.svg" },
    { name: "CSS3", glyph: "C3", icon: "assets/images/tech/css-3.svg" },
    { name: "JavaScript", glyph: "JS", icon: "assets/images/tech/javascript-logo.svg" },
    { name: "TypeScript", glyph: "TS", icon: "assets/images/tech/typescript-icon.svg" },
    { name: "Java", glyph: "Jv", icon: "assets/images/tech/java-4-logo.svg" },
    { name: "Node.js", glyph: "Nd", icon: "assets/images/tech/nodejs-icon.svg" },
    { name: "React", glyph: "Rx", icon: "assets/images/tech/react-1-logo.svg" },
    { name: "Next.js", glyph: "Nx", icon: "assets/images/tech/nextjs-icon.svg" },
    { name: "MySQL", glyph: "My", icon: "assets/images/tech/mysql.svg" },
    { name: "Github", glyph: "GH", icon: "assets/images/tech/Octicons-mark-github.svg" },
    { name: "Claude Code", glyph: "CC", icon: "assets/images/tech/claudecode-color.svg" },
    { name: "Cursor", glyph: "CR", icon: "assets/images/tech/cursor.svg" },
    // Exemplo de como fica com ícone de imagem (descomente e ajuste o caminho):
    // { name: "React", glyph: "Rx", icon: "assets/images/tech/react.svg" },
];

/* ------------------------------------------------------------------ */
/* Tema                                                                 */
/* ------------------------------------------------------------------ */

/** Lê o tema salvo ou infere a partir da preferência do sistema operacional. */
function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Aplica o tema ao documento, ao toggle visual e à cena 3D; persiste a escolha. */
function applyTheme(theme, scene, toggleButton) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    scene?.setTheme(theme);
    if (toggleButton) {
        toggleButton.setAttribute("aria-pressed", String(theme === "light"));
        toggleButton.setAttribute(
            "aria-label",
            theme === "light" ? "Alternar para tema escuro" : "Alternar para tema claro",
        );
    }
}

function initThemeToggle(scene) {
    const toggleButton = document.querySelector("[data-theme-toggle]");
    let currentTheme = getInitialTheme();
    applyTheme(currentTheme, scene, toggleButton);

    toggleButton?.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(currentTheme, scene, toggleButton);
    });
}

/* ------------------------------------------------------------------ */
/* Internacionalização                                                  */
/* ------------------------------------------------------------------ */

/** Aplica todas as traduções estáticas marcadas com [data-i18n] no DOM. */
function applyStaticTranslations(locale) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const value = resolveTranslation(locale, key);
        if (value !== undefined) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        const value = resolveTranslation(locale, key);
        if (value !== undefined) el.setAttribute("placeholder", value);
    });

    const meta = translations[locale]?.meta;
    if (meta) {
        document.title = meta.title;
        document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.description);
    }

    document.documentElement.setAttribute("lang", locale.split("-")[0]);
}

// PROJETOS

/** Repopula todas as seções orientadas a dados (que não usam [data-i18n] direto). */
function refreshDynamicSections(locale) {
    renderEducationCards(locale);
    renderCoursesTimeline(locale);
    renderProjectCards(locale);
    renderCertificateCards(locale);
    renderTechGrid();

    stopTypewriter();
    const heroRoleEl = document.querySelector("[data-hero-role]");
    const roles = resolveTranslation(locale, "hero.roles");
    stopTypewriter = startRoleTypewriter(heroRoleEl, roles);
}

function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) return;
    localStorage.setItem(STORAGE_KEYS.locale, locale);
    applyStaticTranslations(locale);
    refreshDynamicSections(locale);

    document.querySelectorAll("[data-locale-option]").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.localeOption === locale);
    });
}

function initLanguageSwitcher() {
    const saved = localStorage.getItem(STORAGE_KEYS.locale);
    const initialLocale = SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;

    document.querySelectorAll("[data-locale-option]").forEach(btn => {
        btn.addEventListener("click", () => setLocale(btn.dataset.localeOption));
    });

    setLocale(initialLocale);
}

/**
 * Logos das instituições de ensino, usadas em .edu-card__badge.
 * Não depende de idioma — por isso vive aqui e não em translations.js.
 *
 * - FIAP tem uma arte pronta para cada tema (fundo já embutido na imagem);
 *   os dois <img> ficam no DOM e o CSS mostra só o que bate com [data-theme].
 * - FATEC usa a mesma arte nos dois temas (fundo branco fixo); nesse caso
 *   `chip: true` faz o card embrulhar a logo num chip claro, pra não ficar
 *   um retângulo branco solto sobre o fundo escuro do card.
 *
 * COMO TROCAR/ADICIONAR UM LOGO: troque o arquivo em assets/images/logos/
 * (mesmo nome) ou aponte "light"/"dark" para um novo caminho aqui. Veja o
 * README.md na raiz do projeto para o passo a passo completo.
 */
const EDU_LOGOS = {
    fiap: {
        light: "assets/images/logos/fiap-claro.png",
        dark: "assets/images/logos/fiap-escuro.png",
    },
    fatec: {
        light: "assets/images/logos/fatec.png",
        dark: "assets/images/logos/fatec.png",
        chip: true,
    },
};

/* ------------------------------------------------------------------ */
/* Renderização de seções orientadas a dados                            */
/* ------------------------------------------------------------------ */

/** Cria um elemento a partir de um pequeno template HTML de forma segura (sem innerHTML direto de dados não confiáveis). */
function el(tag, className, textContent) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent !== undefined) node.textContent = textContent;
    return node;
}

/** Cria uma <img> com carregamento preguiçoso (lazy) — usado pelos logos institucionais e, futuramente, ícones de tecnologia. */
function img(className, src, alt) {
    const node = document.createElement("img");
    if (className) node.className = className;
    node.src = src;
    node.alt = alt;
    node.loading = "lazy";
    return node;
}

/** Monta o badge de logo de uma instituição (1 imagem fixa, ou 1 por tema). */
function buildEduBadge(logos, institutionName) {
    const badge = el("div", logos.chip ? "edu-card__badge edu-card__badge--chip" : "edu-card__badge");

    if (logos.light === logos.dark) {
        badge.appendChild(img("edu-card__logo", logos.light, institutionName));
        return badge;
    }

    badge.append(
        img("edu-card__logo edu-card__logo--light", logos.light, institutionName),
        img("edu-card__logo edu-card__logo--dark", logos.dark, institutionName),
    );
    return badge;
}

function renderEducationCards(locale) {
    const container = document.querySelector("[data-education-grid]");
    if (!container) return;
    container.innerHTML = "";

    const data = translations[locale].education;
    const cards = [
        { ...data.fiap, modifier: "fiap" },
        { ...data.fatec, modifier: "fatec" },
    ];

    cards.forEach(card => {
        const article = el("article", `edu-card edu-card--${card.modifier}`);
        article.setAttribute("data-reveal", "");

        const badge = buildEduBadge(EDU_LOGOS[card.modifier], card.institution);
        const institution = el("h3", "edu-card__institution", card.institution);
        const course = el("p", "edu-card__course", card.course);
        const period = el("span", "edu-card__period", card.period);
        const description = el("p", "edu-card__description", card.description);

        const header = el("div", "edu-card__header");
        header.append(badge, institution);

        article.append(header, course, period, description);
        container.appendChild(article);
    });
}

function renderCoursesTimeline(locale) {
    const container = document.querySelector("[data-courses-timeline]");
    if (!container) return;
    container.innerHTML = "";

    translations[locale].courses.items.forEach((item, index) => {
        const node = el("div", "timeline-item");
        node.setAttribute("data-reveal", "");
        node.style.setProperty("--i", index);

        const marker = el("span", "timeline-item__marker", item.tag);
        const content = el("div", "timeline-item__content");
        content.append(el("h3", "timeline-item__title", item.title), el("span", "timeline-item__period", item.period));

        node.append(marker, content);
        container.appendChild(node);
    });
}

function renderTechGrid() {
    const container = document.querySelector("[data-tech-grid]");
    if (!container || container.childElementCount > 0) return; // idioma-independente, renderiza 1x

    TECH_STACK.forEach(tech => {
        const card = el("div", "tech-card");
        card.setAttribute("data-reveal", "");
        card.setAttribute("tabindex", "0");
        card.setAttribute("data-cursor-grow", "");

        // Se "icon" estiver definido, usa a imagem; senão cai no glifo em texto.
        const visual = tech.icon
            ? img("tech-card__icon", tech.icon, tech.name)
            : el("span", "tech-card__glyph", tech.glyph);
        const name = el("span", "tech-card__name", tech.name);
        card.append(visual, name);
        container.appendChild(card);
    });
}


function renderProjectCards(locale) {
    const container = document.querySelector("[data-projects-grid]");
    if (!container) return;
    container.innerHTML = "";

    const { items, viewCode, viewDemo } = translations[locale].projects;

    items.forEach(project => {
        const card = el("article", "project-card");
        card.setAttribute("data-reveal", "");
        card.setAttribute("data-category", project.category);

        const media = el("div", "project-card__media");

        if (project.image) {
            const thumb = img("project-card__thumb", project.image, project.title);
            thumb.addEventListener("error", () => thumb.remove());
            media.appendChild(thumb);
        } else {
            media.setAttribute("aria-hidden", "true");
        }

        const body = el("div", "project-card__body");
        const title = el("h3", "project-card__title", project.title);
        const description = el("p", "project-card__description", project.description);

        const tagList = el("ul", "project-card__tags");
        project.tags.forEach(tag => tagList.appendChild(el("li", null, tag)));

        const actions = el("div", "project-card__actions");
        const codeLink = el("a", "project-card__link");
        codeLink.href = "#";
        codeLink.textContent = viewCode;
        codeLink.setAttribute("data-ripple", "");

        const demoLink = el("a", "project-card__link project-card__link--primary", viewDemo);
        demoLink.href = project.url || "#";
        demoLink.target = "_blank";
        demoLink.rel = "noopener noreferrer"
        demoLink.textContent = viewDemo;
        demoLink.setAttribute("data-ripple", "");

        actions.append(codeLink, demoLink);
        body.append(title, description, tagList, actions);
        card.append(media, body);
        container.appendChild(card);
    });

    initProjectFilters();
}

function initProjectFilters() {
    const buttons = document.querySelectorAll("[data-project-filter]");
    const cards = document.querySelectorAll("[data-projects-grid] .project-card");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("is-active"));
            button.classList.add("is-active");
            filterProjectCards(cards, button.dataset.projectFilter);
        });
    });
}

/** Iniciais usadas como fallback visual quando a imagem do badge não carrega. */
function initials(text) {
    return text
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
}

function renderCertificateCards(locale) {
    const container = document.querySelector("[data-certificates-grid]");
    if (!container) return;
    container.innerHTML = "";

    const { items, viewCredential } = translations[locale].certificates;

    items.forEach(cert => {
        const card = el("article", "certificate-card");
        card.setAttribute("data-reveal", "");

        const media = el("div", "certificate-card__media");

        const img = new Image();
        img.className = "certificate-card__img";
        img.src = cert.image;
        img.alt = `${cert.title} — ${cert.issuer}`;
        img.loading = "lazy";
        img.addEventListener("error", () => {
            img.replaceWith(el("span", "certificate-card__fallback", initials(cert.issuer)));
        });
        media.appendChild(img);

        const body = el("div", "certificate-card__body");
        const title = el("h3", "certificate-card__title", cert.title);

        const meta = el("div", "certificate-card__meta");
        meta.append(el("span", null, cert.issuer), el("span", null, cert.date));

        const description = el("p", "certificate-card__description", cert.description);

        const link = el("a", "certificate-card__link", viewCredential);
        link.href = cert.url || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("data-ripple", "");

        body.append(title, meta, description, link);
        card.append(media, body);
        container.appendChild(card);
    });
}

/* ------------------------------------------------------------------ */
/* Navegação                                                            */
/* ------------------------------------------------------------------ */

function initMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) return;

    let isOpen = false;
    toggle.addEventListener("click", () => {
        isOpen = !isOpen;
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggleMobileMenu(menu, isOpen);
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            isOpen = false;
            toggle.setAttribute("aria-expanded", "false");
            toggleMobileMenu(menu, false);
        });
    });
}

function initSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", event => {
            const targetId = anchor.getAttribute("href");
            if (targetId.length <= 1) return;
            const target = document.querySelector(targetId);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

/* ------------------------------------------------------------------ */
/* Formulário de contato — Privacy by Design                            */
/* ------------------------------------------------------------------ */

/**
 * Trata o envio do formulário sem nunca persistir dados pessoais:
 * não grava em localStorage, não expõe em query string, não faz log em
 * console. Em produção, o `formData` deve ser enviado via POST para um
 * endpoint HTTPS próprio (backend não incluso neste front-end estático).
 */
function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(form);
        const isValid = form.checkValidity();

        if (!isValid) {
            form.reportValidity();
            return;
        }

        // Ponto de integração: enviar `formData` via fetch() para um endpoint
        // HTTPS que implemente consentimento explícito e retenção mínima,
        // conforme LGPD/GDPR. Nenhum dado é retido no cliente.
        const feedback = form.querySelector("[data-form-feedback]");
        if (feedback) {
            feedback.hidden = false;
            feedback.textContent = "✓";
        }
        form.reset();
    });
}

/* ------------------------------------------------------------------ */
/* Bootstrap                                                            */
/* ------------------------------------------------------------------ */

function initScene() {
    const canvas = document.querySelector("#space-canvas");
    if (!canvas) return null;
    const scene = new SpaceScene(canvas);
    scene.animate();

    // Vincula o avanço da câmera ao progresso de scroll da página inteira.
    window.addEventListener(
        "scroll",
        () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
            scene.setScrollProgress(progress);
        },
        { passive: true },
    );

    return scene;
}

async function bootstrap() {
    const scene = initScene();

    // Tema e idioma precisam estar resolvidos antes da sequência de
    // ingresso: ela decide o palco pelo data-theme e usa os textos
    // data-i18n já preenchidos por initLanguageSwitcher.
    initThemeToggle(scene);
    initLanguageSwitcher();
    initMobileMenu();
    initSmoothAnchorScroll();
    initContactForm();

    initHeaderScrollState(document.querySelector("[data-site-header]"));
    initScrollProgressBar(document.querySelector("[data-scroll-progress]"));
    initCustomCursor(document.querySelector("[data-custom-cursor]"));
    initRippleEffect();

    // Pausa o composer/bloom/lente da cena 3D enquanto o overlay de
    // ingresso ocupa a tela: os dois disputando a mesma GPU/thread
    // principal era a causa do engasgo visível na abertura. A cena
    // continua com o loop de rAF agendado (custo desprezível) e retoma
    // instantaneamente assim que a sequência termina.
    scene.setPaused(true);
    await playIngressSequence();
    scene.setPaused(false);

    playHeroIntro();
    initScrollReveals();
    revealCardGroup("[data-tech-grid]");
    revealCardGroup("[data-education-grid]");
    animateCounters(document.querySelectorAll("[data-count-to]"));
}

document.addEventListener("DOMContentLoaded", bootstrap);
