# Portifólio — Edgard Costa

Site estático (sem build, sem framework) em HTML + CSS + JavaScript puro (ES Modules), com uma cena 3D de fundo (Three.js), animações de seção via GSAP e a sequência de entrada (a tela cheia antes do site) via anime.js. Portifólio pessoal

## Como abrir o projeto

Não tem build/compilação. Basta servir a pasta com qualquer servidor estático (não abra o `index.html` direto com `file://`, porque os módulos JS e o `fetch` de imagens não funcionam assim). O jeito mais simples:

Ou use a extensão "Live Server" do VS Code, ou `npx serve`.

## Estrutura de pastas

```
index.html              → esqueleto de todas as seções (a maior parte do texto NÃO está aqui, ver abaixo)
css/style.css            → todo o estilo do site (cores, cards, layout, animações CSS)
js/
  main.js                → "cérebro" do site: tema, idioma, e monta os cards dinamicamente
  translations.js        → TODO o texto do site, em pt-BR / en-US / de-DE
  animations.js          → animações (GSAP): entrada de seção, hover, cursor, etc.
  intro.js                → (novo) sequência de ingresso (anime.js) — a tela cheia antes do site, ver seção 6
  scene.js                → a cena 3D do buraco negro (Three.js) — só existe no tema escuro
assets/
  images/
    logos/                → logos
    certificates/          → imagens dos certificados
    tech/                  → ícones de tecnologia — ver seção própria abaixo
  cv-edgard-costa.pdf      → arquivo baixado pelo botão "Baixar CV"
manifest.json             → metadados do PWA (nome do app, ícone, cor de tema)
```

**Regra geral:** se é texto visível (frases, títulos, nomes de projeto, descrições), está em `js/translations.js`. Se é uma cor, espaçamento ou efeito visual, está em `css/style.css`. Se é "quantos cards aparecem" ou "como o card é montado", está em `js/main.js`.

---

