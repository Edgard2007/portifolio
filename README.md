# Portfólio — Edgard Costa

Site estático (sem build, sem framework) em HTML + CSS + JavaScript puro (ES Modules), com uma cena 3D de fundo (Three.js) e animações via GSAP. Este README existe pra você conseguir mexer em qualquer parte — texto, imagem, cor — sem precisar entender o projeto inteiro primeiro.

## Como abrir o projeto

Não tem build/compilação. Basta servir a pasta com qualquer servidor estático (não abra o `index.html` direto com `file://`, porque os módulos JS e o `fetch` de imagens não funcionam assim). O jeito mais simples:

```bash
# dentro da pasta do projeto
python3 -m http.server 8000
# depois abra http://localhost:8000
```

Ou use a extensão "Live Server" do VS Code, ou `npx serve`.

## Estrutura de pastas

```
index.html              → esqueleto de todas as seções (a maior parte do texto NÃO está aqui, ver abaixo)
css/style.css            → todo o estilo do site (cores, cards, layout, animações CSS)
js/
  main.js                → "cérebro" do site: tema, idioma, e monta os cards dinamicamente
  translations.js        → TODO o texto do site, em pt-BR / en-US / de-DE
  animations.js          → animações (GSAP): entrada de seção, hover, cursor, etc.
  scene.js                → a cena 3D do buraco negro (Three.js) — só existe no tema escuro
assets/
  images/
    logos/                → logos da FIAP e FATEC (seção Formação)
    certificates/          → imagens dos certificados
    tech/                  → (nova) ícones de tecnologia — ver seção própria abaixo
  cv-guilherme-andrade.pdf → arquivo baixado pelo botão "Baixar CV"
manifest.json             → metadados do PWA (nome do app, ícone, cor de tema)
```

**Regra geral:** se é texto visível (frases, títulos, nomes de projeto, descrições), está em `js/translations.js`. Se é uma cor, espaçamento ou efeito visual, está em `css/style.css`. Se é "quantos cards aparecem" ou "como o card é montado", está em `js/main.js`.

---

## 1. Como editar textos

Todo o texto do site vive em **`js/translations.js`**, um único objeto com três blocos: `"pt-BR"`, `"en-US"`, `"de-DE"`. Os três têm exatamente a mesma estrutura (as mesmas chaves), só o conteúdo muda.

```js
"pt-BR": {
    hero: {
        name: "Edgard Costa",
        description: "Curto entender como as coisas funcionam por dentro...",
        ...
    },
    about: { ... },
    education: { ... },
    ...
}
```

Pra mudar uma frase: ache a chave (ex: `hero.description`) e edite o texto **nos três idiomas** (`pt-BR`, `en-US`, `de-DE`), pra não ficar um idioma desatualizado em relação aos outros. Não precisa mexer em mais nada — o `main.js` já lê esse objeto e aplica no HTML sozinho.

**Importante:** não apague nem renomeie as chaves (o que vem antes dos dois-pontos, tipo `description:`), só o valor (o texto entre aspas). Se renomear uma chave, o texto simplesmente some do site (o código procura por aquele nome exato).

### Textos que **não** estão em `translations.js`

Alguns textos são fixos (iguais nos três idiomas) e ficam direto no `index.html`: o texto alternativo de imagens de assets fixos, o rótulo `RA 05h 35m...` do Hero (na verdade esse também está em `translations.js`, em `hero.eyebrow`) e o rodapé de copyright com o ano (o ano é gerado automaticamente via JS, não precisa editar).

---

## 2. Como trocar/adicionar imagens

### 2.1 Logos da Formação Acadêmica (FIAP / FATEC)

Ficam em `assets/images/logos/`. A lógica de qual logo aparece em qual tema está em `js/main.js`, no objeto `EDU_LOGOS`:

```js
const EDU_LOGOS = {
    fiap: {
        light: "assets/images/logos/fiap-claro.png",
        dark:  "assets/images/logos/fiap-escuro.png",
    },
    fatec: {
        light: "assets/images/logos/fatec.png",
        dark:  "assets/images/logos/fatec.png",
        chip: true,
    },
};
```

- **Pra trocar uma logo:** substitua o arquivo mantendo o mesmo nome, ou edite o caminho aqui.
- **`light` / `dark` diferentes** (caso da FIAP): o site já troca sozinho quando você alterna o tema — nenhum JS roda no clique, é só CSS mostrando/escondendo a imagem certa.
- **`light` e `dark` iguais** (caso da FATEC): a mesma imagem é usada nos dois temas.
- **`chip: true`**: embrulha a logo num fundo branco com borda — use isso quando a imagem *não* tiver fundo transparente (como a FATEC, que é um retângulo branco sólido). Sem o chip, esse retângulo ficaria feio sobre o card escuro. Se a imagem já tiver fundo transparente (como a FIAP), não use `chip`.

**Pra adicionar uma terceira instituição:**
1. Coloque a(s) imagem(ns) em `assets/images/logos/`.
2. Adicione uma entrada em `EDU_LOGOS` (em `main.js`), com o mesmo formato acima.
3. Adicione os dados (nome, curso, período, descrição) em `education` dentro de `translations.js`, nos três idiomas — repare que hoje `education` tem `fiap` e `fatec`; adicione uma terceira chave (ex: `usp`) com a mesma estrutura de `fiap`.
4. Em `main.js`, na função `renderEducationCards`, adicione a nova entrada na lista `cards` (linha com `{ ...data.fiap, modifier: "fiap" }`) — copie o padrão trocando `fiap` pelo nome da nova chave.
5. (Opcional) Se quiser uma cor de destaque própria para essa instituição, adicione `--nome-color` e `--nome-color-soft` no `:root` do `css/style.css` (procure por `--fiap-color` pra ver o padrão) e um bloco `.edu-card--nome { --brand-color: var(--nome-color); }` perto de `.edu-card--fiap`.

**Tamanho recomendado das imagens:** o badge tem 52px de altura fixa (a largura se ajusta sozinha). Qualquer PNG/SVG com fundo transparente (ou branco + `chip: true`) funciona; não precisa redimensionar manualmente, o CSS já limita o tamanho.

### 2.2 Certificados

Cada certificado, em `translations.js`, tem um campo `image`:

```js
{
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2025",
    description: "...",
    image: "assets/images/certificates/aws-cloud-practitioner.svg",
    url: "#",
},
```

Pra trocar: substitua o arquivo em `assets/images/certificates/` (ou aponte `image` pra outro caminho). Se a imagem não carregar (caminho errado, arquivo ausente), o site mostra automaticamente as iniciais do emissor num círculo — não quebra o layout.

Pra adicionar um certificado novo: copie um bloco inteiro como o de cima dentro do array `items` de `certificates`, nos três idiomas, com um `image` novo.

### 2.3 Tecnologias — como adicionar ícones (novo)

Hoje cada tecnologia mostra uma sigla de duas letras (ex: "JS", "Rx") gerada por CSS, sem depender de nenhum arquivo de imagem. Deixei pronto o suporte a ícone de imagem, pra quando você quiser trocar por logos reais.

Em `js/main.js`, ache a lista `TECH_STACK`:

```js
const TECH_STACK = [
    { name: "HTML5", glyph: "H5" },
    { name: "React", glyph: "Rx" },
    // ...
];
```

Pra usar uma imagem em vez da sigla, adicione a propriedade `icon` apontando pro arquivo:

```js
{ name: "React", glyph: "Rx", icon: "assets/images/tech/react.svg" },
```

Quando `icon` existe, a imagem substitui a sigla automaticamente — não precisa mexer em mais nada. Se quiser voltar pra sigla, é só remover a linha `icon`.

**Onde colocar os arquivos:** criei a pasta `assets/images/tech/` pra isso. Formato recomendado: SVG ou PNG com fundo transparente, aproximadamente quadrado (o ícone é exibido em 42×42px). A maioria dos sites de ícone de tecnologia (ex: [Simple Icons](https://simpleicons.org/), [Devicon](https://devicon.dev/)) oferece SVGs prontos nesse formato — é só baixar e apontar o `icon` pro arquivo.

---

## 3. Cores e tema (claro/escuro)

Todas as cores do site são variáveis CSS, definidas no topo de `css/style.css`, dentro de `:root` (tema escuro, que é o padrão) e `[data-theme="light"]` (tema claro). Exemplo:

```css
:root, [data-theme="dark"] {
    --accent-violet: #7c5cff;
    --accent-cyan: #4fd8e8;
    --color-bg: #05060f;
    --color-text: #eef1ff;
    ...
}
[data-theme="light"] {
    --color-bg: #f4f5fb;
    --color-text: #0b0e1f;
    ...
}
```

Pra mudar uma cor em todo o site (ex: a cor de destaque roxa), troque o valor de `--accent-violet` — todo lugar que usa `var(--accent-violet)` atualiza sozinho.

No tema claro não existe mais o buraco negro (fica pausado e escondido por CSS, pra economizar bateria/CPU) — no lugar tem um fundo minimalista (`#light-backdrop` em `index.html`, estilizado em `css/style.css` na seção com esse mesmo nome).

---

## 4. Adicionar/remover projetos

Em `translations.js`, dentro de `projects.items` (nos três idiomas):

```js
{
    title: "Orbit — Dashboard de Monitoramento",
    description: "...",
    tags: ["React", "Node.js", "MongoDB"],
    category: "web", // usado pelos filtros: "web" | "ai" | "tools"
},
```

Copie um bloco desses pra adicionar um projeto, ou apague pra remover. **Atenção:** hoje o card de projeto não tem campo de imagem própria — a área colorida no topo do card é só decoração (um gradiente com uma textura de grid), igual pra todos os projetos. Se você quiser uma screenshot real por projeto, me avise numa próxima conversa que eu adiciono o campo `image` (é uma mudança pequena, só não quis criar um campo que ninguém ia preencher).

---

## 5. Cursos e experiência

- **Cursos** (linha do tempo): `translations.js` → `courses.items`, mesmo padrão de copiar/colar um bloco.
- **Experiência profissional:** hoje é só um placeholder ("Próxima missão"). Quando tiver uma experiência de verdade pra colocar, me chame — o layout de card de experiência ainda não existe (só o texto de "em breve"), então é uma seção nova a construir, não só editar texto.

---

## 6. Animações e cena 3D (mexa só se quiser ir mais fundo)

- **`js/animations.js`**: todas as animações de entrada, hover e cursor, feitas com GSAP. Cada função tem comentário explicando o que faz.
- **`js/scene.js`**: a cena 3D do buraco negro (Three.js). Só roda no tema escuro. As cores da cena por tema estão em `SCENE_PALETTE`, no topo do arquivo.

Essas duas partes são mais técnicas — dá pra editar sem saber Three.js/GSAP a fundo, mas exige mais cuidado que trocar texto ou imagem. Se travar em algo aqui, é um bom momento pra pedir ajuda de novo.

---

## Dúvidas rápidas — "onde eu mexo pra..."

| Quero...                                      | Vou em...                                                   |
|-----------------------------------------------|--------------------------------------------------------------|
| Mudar qualquer frase do site                  | `js/translations.js`                                         |
| Trocar a logo da FIAP/FATEC                   | `assets/images/logos/` + `EDU_LOGOS` em `js/main.js`         |
| Trocar/adicionar um certificado               | `translations.js` → `certificates.items`                     |
| Colocar ícone de imagem numa tecnologia       | `assets/images/tech/` + `icon` em `TECH_STACK` (`main.js`)   |
| Mudar uma cor do site                         | `:root` / `[data-theme="light"]` em `css/style.css`          |
| Adicionar/remover um projeto                  | `translations.js` → `projects.items`                         |
| Adicionar/remover um curso                    | `translations.js` → `courses.items`                          |
| Trocar o PDF do currículo                     | `assets/cv-guilherme-andrade.pdf` (mesmo nome) ou o `href` no `index.html` |

