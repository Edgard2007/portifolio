/**
 * translations.js
 * -----------------------------------------------------------------------
 * Objeto único contendo todo o conteúdo textual do site em três idiomas.
 * Nenhuma dependência externa (sem Google Translate) — a troca de idioma
 * é feita substituindo textContent/innerHTML dos elementos marcados com
 * o atributo [data-i18n] a partir da chave correspondente (dot.path).
 * -----------------------------------------------------------------------
 */

export const translations = {
    "pt-BR": {
        meta: {
            title: "Edgard Costa — Software Engineer & Astrophysics Enthusiast",
            description:
                "Portfólio de Edgard Costa, Engenheiro de Software com foco em Inteligência Artificial e paixão por Astrofísica.",
        },
        nav: {
            about: "Sobre",
            education: "Formação",
            courses: "Cursos",
            tech: "Tecnologias",
            projects: "Projetos",
            certificates: "Certificados",
            experience: "Experiência",
            contact: "Contato",
        },
        ingress: {
            skip: "Pular introdução",
            meterLabel: "Aproximação",
            horizon: {
                line1: "Sgr A* — horizonte de eventos",
                line2: "RA 05h 35m · DEC −05° 23′",
                line3: "Sincronizando órbita",
            },
            blueprint: {
                line1: "Modelo EC-1 · propulsor experimental",
                line2: "Escala 1:120",
                line3: "Status: pré-lançamento",
            },
        },
        hero: {
            eyebrow: "RA 05h 35m · DEC −05° 23′ · TERRA",
            name: "Edgard Costa",
            roles: [
                "Engenheiro de Software",
                "Engenharia de IA",
                "Desenvolvedor Full Stack",
                "Entusiasta de Astrofísica",
            ],
            description:
                "Curto entender como as coisas funcionam por dentro, seja um sistema em produção ou uma estrela colapsando. Escrevo código com essa mesma lógica: primeiro entender, depois construir.",
            ctaPrimary: "Baixar CV",
            ctaSecondary: "Ver Projetos",
            scroll: "Explorar",
        },
        about: {
            eyebrow: "Sobre mim",
            title: "Engenharia no dia a dia, astrofísica nas horas vagas",
            p1: "Sou desenvolvedor full stack. A maior parte do meu tempo fica entre back-end e arquitetura, mas gosto de acompanhar o projeto até a interface. Ultimamente tenho testado bastante IA generativa em cenário real, não só em protótipo de fim de semana.",
            p2: "Fora do código, estudo Astrofísica por conta própria. Mecânica orbital, formação estelar, esse tipo de coisa. Não tem relação direta com o trabalho, é curiosidade mesmo. Mas ajuda a treinar paciência com problema que não tem solução óbvia de cara.",
            p3: "Nos últimos meses o foco tem sido fechar lacuna de fundamentos que a faculdade ainda não cobriu, e testar IA generativa sem pressa, mas sem parar.",
            stats: [
                { value: "2+", label: "Anos estudando Engenharia de Software" },
                { value: "6+", label: "Tecnologias em uso ativo" },
                { value: "∞", label: "Curiosidade por IA e Astrofísica" },
            ],
        },
        education: {
            eyebrow: "Formação acadêmica",
            title: "Base sólida, dupla trilha",
            fiap: {
                institution: "FIAP",
                course: "Engenharia de Software",
                period: "Em andamento",
                description:
                    "Curso focado em arquitetura de sistemas, dados e tecnologia atual, me preparando para o mercado de trabalho.",
            },
            fatec: {
                institution: "FATEC",
                course: "Análise e Desenvolvimento de Sistemas",
                period: "Em andamento",
                description: "Base em lógica, algoritmos, banco de dados e desenvolvimento de sistemas escaláveis.",
            },
        },
        courses: {
            eyebrow: "Estudos complementares",
            title: "Trilha de especialização contínua",
            items: [
                { title: "GenAIs", period: "Em andamento", tag: "IA" },
                { title: "Machine Learning", period: "Em andamento", tag: "ML" },
                { title: "Deep Learning", period: "Planejado", tag: "DL" },
                { title: "JavaScript", period: "Em andamento", tag: "JS" },
                { title: "Engenharia de Software", period: "Em andamento", tag: "ES" },
                { title: "Astrofísica Observacional", period: "Estudo autônomo", tag: "Astro" },
            ],
        },
        tech: {
            eyebrow: "Arsenal técnico",
            title: "Tecnologias e ferramentas",
        },
        projects: {
            eyebrow: "Trabalho selecionado",
            title: "Projetos",
            filters: { all: "Todos", web: "Web", ai: "IA", tools: "Ferramentas" },
            viewDemo: "Visite o site",
            items: [
                {
                    title: "TwentyTwo Imports — E-Commerce",
                    image: "assets/images/logos/newlogo.jpeg",
                    description:
                        "Site de e-commerce para a empresa TwentyTwo Imports, com dashboard de administração, catálogo de produtos e sistema de checkout.",
                    tags: ["React", "Typescript", "Supabase"],
                    category: "web",
                    url: "https://twentytwoimports.com.br",
                },
                {
                    title: "Nova — Assistente com LLM",
                    description:
                        "Assistente conversacional construído sobre a OpenAI API com memória de contexto e ferramentas externas.",
                    tags: ["Python", "OpenAI API", "FastAPI"],
                    category: "ai",
                },
                {
                    title: "Pulsar — CLI de Automação",
                    description:
                        "Ferramenta de linha de comando para automatizar deploys e rotinas de desenvolvimento local.",
                    tags: ["Node.js", "TypeScript", "Docker"],
                    category: "tools",
                },
            ],
        },
        certificates: {
            eyebrow: "Reconhecimento",
            title: "Certificados & badges",
            viewCredential: "Ver credencial",
            items: [
                {
                    title: "Quantum Enigma",
                    issuer: "IBM",
                    date: "2026",
                    description: "Compreensão fundamental da computação quântica, incluindo princípios como superposição quântica, emaranhamento e medição.",
                    image: "assets/images/certificates/quantum-enigmas.png",
                    url: "https://www.credly.com/badges/1ad395cb-45c5-46a4-8c0b-4282011b51f4/public_url",
                },
                {
                    title: "Astrofísica I",
                    issuer: "UFSC",
                    date: "2026",
                    description: "Gravitação. Luz. Óptica. Instrumentos Astrofísicos. Sistema Solar. Sol. Exoplanetas. Formação de Sistemas Planetários. Vida. A vida na Terra. Detecção de vida. Mundos habitáveis. Busca por vida inteligente. Astrobiologia",
                    image: "assets/images/logos/Brasao_UFSC_vertical_extenso.svg",
                    
                },
                {
                    title: "IA no Desenvolvimento",
                    issuer: "Alura",
                    date: "2026",
                    description: "Como a Engenharia de Software cresce, se adapta e é utilizada na Era de IA",
                    image: "assets/images/certificates/alura.png",
                    
                },
                {
                    title: "Quantum Enigma",
                    issuer: "IBM",
                    date: "2026",
                    description: "Compreensão fundamental da computação quântica, incluindo princípios como superposição quântica, emaranhamento e medição.",
                    image: "assets/images/certificates/quantum-enigmas.png",
                    url: "https://www.credly.com/badges/1ad395cb-45c5-46a4-8c0b-4282011b51f4/public_url",
                },
                {
                    title: "Quantum Enigma",
                    issuer: "IBM",
                    date: "2026",
                    description: "Compreensão fundamental da computação quântica, incluindo princípios como superposição quântica, emaranhamento e medição.",
                    image: "assets/images/certificates/quantum-enigmas.png",
                    url: "https://www.credly.com/badges/1ad395cb-45c5-46a4-8c0b-4282011b51f4/public_url",
                },
                {
                    title: "Quantum Enigma",
                    issuer: "IBM",
                    date: "2026",
                    description: "Compreensão fundamental da computação quântica, incluindo princípios como superposição quântica, emaranhamento e medição.",
                    image: "assets/images/certificates/quantum-enigmas.png",
                    url: "https://www.credly.com/badges/1ad395cb-45c5-46a4-8c0b-4282011b51f4/public_url",
                },
                
            ],
        },
        experience: {
            eyebrow: "Trajetória",
            title: "Experiência profissional",
            placeholderTitle: "Próxima missão",
            placeholderText: "Ainda não tenho experiência profissional formal pra listar aqui — isso muda em breve.",
        },
        contact: {
            eyebrow: "Contato",
            title: "Vamos conversar?",
            description:
                "Aberto a oportunidades e colaborações. E sempre disposto a uma boa conversa sobre tecnologia — ou astrofísica, se sobrar tempo.",
            formName: "Nome",
            formEmail: "E-mail",
            formMessage: "Mensagem",
            formSubmit: "Enviar mensagem",
            links: { github: "GitHub", linkedin: "LinkedIn", email: "E-mail", resume: "Currículo" },
        },
        footer: {
            rights: "Todos os direitos reservados.",
            builtWith: "Construído com HTML, CSS, JavaScript, Three.js e GSAP.",
        },
    },

    "en-US": {
        meta: {
            title: "Edgard Costa — Software Engineer & Astrophysics Enthusiast",
            description:
                "Portfolio of Edgard Costa, Software Engineer focused on Artificial Intelligence with a passion for Astrophysics.",
        },
        nav: {
            about: "About",
            education: "Education",
            courses: "Courses",
            tech: "Tech Stack",
            projects: "Projects",
            certificates: "Certificates",
            experience: "Experience",
            contact: "Contact",
        },
        ingress: {
            skip: "Skip intro",
            meterLabel: "Approach",
            horizon: {
                line1: "Sgr A* — event horizon",
                line2: "RA 05h 35m · DEC −05° 23′",
                line3: "Syncing orbit",
            },
            blueprint: {
                line1: "Model EC-1 · experimental thruster",
                line2: "Scale 1:120",
                line3: "Status: pre-launch",
            },
        },
        hero: {
            eyebrow: "RA 05h 35m · DEC −05° 23′ · EARTH",
            name: "Edgard Costa",
            roles: ["Software Engineer", "AI Engineering", "Full Stack Developer", "Astrophysics Enthusiast"],
            description:
                "I like understanding how things work underneath — a production system or a collapsing star, doesn't matter. I write code with that same instinct: understand first, build second.",
            ctaPrimary: "Download CV",
            ctaSecondary: "View Projects",
            scroll: "Explore",
        },
        about: {
            eyebrow: "About me",
            title: "Engineering by day, astrophysics on the side",
            p1: "I'm a full-stack developer. Most of my time goes to back-end and system architecture, but I like following a project through to the interface. Lately I've been testing generative AI in real scenarios, not just weekend prototypes.",
            p2: "Outside of code, I study astrophysics on my own — orbital mechanics, star formation, that kind of thing. It's not directly related to work, it's just curiosity. Though it does help with staying patient on problems that don't have an obvious answer.",
            p3: "The past few months have been about closing gaps in fundamentals college hasn't covered yet, and testing generative AI past the hype — no rush, but no stopping either.",
            stats: [
                { value: "2+", label: "Years studying Software Engineering" },
                { value: "6+", label: "Technologies in active use" },
                { value: "∞", label: "Curiosity for AI and Astrophysics" },
            ],
        },
        education: {
            eyebrow: "Academic background",
            title: "Solid foundation, dual track",
            fiap: {
                institution: "FIAP",
                course: "Software Engineering",
                period: "In progress",
                description: "Program focused on systems architecture, data and cloud, with a good amount of hands-on practice.",
            },
            fatec: {
                institution: "FATEC",
                course: "Systems Analysis and Development",
                period: "In progress",
                description: "Foundation in logic, algorithms, databases and development for scalable systems.",
            },
        },
        courses: {
            eyebrow: "Complementary studies",
            title: "Continuous specialization track",
            items: [
                { title: "Artificial Intelligence", period: "In progress", tag: "AI" },
                { title: "Machine Learning", period: "In progress", tag: "ML" },
                { title: "Deep Learning", period: "Planned", tag: "DL" },
                { title: "Javascript", period: "In progress", tag: "JS" },
                { title: "Software Engineering", period: "In progress", tag: "SE" },
                { title: "Observational Astrophysics", period: "Self study", tag: "Astro" },
            ],
        },
        tech: {
            eyebrow: "Technical arsenal",
            title: "Technologies & tools",
        },
        projects: {
            eyebrow: "Selected work",
            title: "Projects",
            filters: { all: "All", web: "Web", ai: "AI", tools: "Tools" },
            viewDemo: "Visit Website",
            items: [
                {
                    title: "TwentyTwo Imports — E-Commerce",
                    image: "assets/images/logos/newlogo.jpeg",
                    description:
                        "E-commerce site for TwentyTwo Imports, featuring an administration dashboard, product catalog, and checkout system.",
                    tags: ["React", "Typescript", "Supabase"],
                    category: "web",
                    url: "https://twentytwoimports.com.br/",
                },

                
                {
                    title: "Nova — LLM Assistant",
                    description:
                        "This credential earner has a foundational understanding of quantum computing, including principles such as quantum superposition, entanglement, and measurement",
                    tags: ["Python", "OpenAI API", "FastAPI"],
                    category: "ai",
                },
                {
                    title: "Pulsar — Automation CLI",
                    description: "Command-line tool to automate deploys and local development routines.",
                    tags: ["Node.js", "TypeScript", "Docker"],
                    category: "tools",
                },
            ],
        },
        certificates: {
            eyebrow: "Recognition",
            title: "Certificates & badges",
            viewCredential: "View credential",
            items: [
                {
                    title: "Quantum Enigma",
                    issuer: "IBM",
                    date: "2026",
                    description: "Foundational understanding of quantum computing, including principles such as quantum superposition, entanglement, and measurement",
                    image: "assets/images/certificates/quantum-enigmas.png",
                    url: "https://www.credly.com/badges/1ad395cb-45c5-46a4-8c0b-4282011b51f4/public_url",
                },
                {
                    title: "Astrophysics",
                    issuer: "UFSC",
                    date: "2026",
                    description: "Gravitation. Light. Optics. Astrophysical Instruments. Solar System. Sun. Exoplanets. Formation of Planetary Systems. Life. Life on Earth. Detection of life. Habitable worlds. Search for intelligent life. Astrobiology.",
                    image: "assets/images/logos/Brasao_UFSC_vertical_extenso.svg",
                    url: "#",
                },
                {
                    title: "Software Enginnering on the AI Era",
                    issuer: "Alura",
                    date: "2026",
                    description: "How the Software Enginnering adapts, grows and how its used in the AI era",
                    image: "assets/images/certificates/alura.png",
                    url: "#",
                },
                {
                    title: "Astrophysics",
                    issuer: "UFSC",
                    date: "2026",
                    description: "Gravitation. Light. Optics. Astrophysical Instruments. Solar System. Sun. Exoplanets. Formation of Planetary Systems. Life. Life on Earth. Detection of life. Habitable worlds. Search for intelligent life. Astrobiology.",
                    image: "assets/images/logos/Brasao_UFSC_vertical_extenso.svg",
                    url: "#",
                },
                {
                    title: "Astrophysics",
                    issuer: "UFSC",
                    date: "2026",
                    description: "Gravitation. Light. Optics. Astrophysical Instruments. Solar System. Sun. Exoplanets. Formation of Planetary Systems. Life. Life on Earth. Detection of life. Habitable worlds. Search for intelligent life. Astrobiology.",
                    image: "assets/images/logos/Brasao_UFSC_vertical_extenso.svg",
                    url: "#",
                },
                {
                    title: "Astrophysics",
                    issuer: "UFSC",
                    date: "2026",
                    description: "Gravitation. Light. Optics. Astrophysical Instruments. Solar System. Sun. Exoplanets. Formation of Planetary Systems. Life. Life on Earth. Detection of life. Habitable worlds. Search for intelligent life. Astrobiology.",
                    image: "assets/images/logos/Brasao_UFSC_vertical_extenso.svg",
                    url: "#",
                },
                
            ],
        },
        experience: {
            eyebrow: "Trajectory",
            title: "Professional experience",
            placeholderTitle: "Next mission",
            placeholderText: "I don't have formal professional experience to list here yet — that's changing soon.",
        },
        contact: {
            eyebrow: "Contact",
            title: "Let's talk?",
            description: "Open to opportunities and collaborations. Always up for a good conversation about tech — or astrophysics, if there's time.",
            formName: "Name",
            formEmail: "Email",
            formMessage: "Message",
            formSubmit: "Send message",
            links: { github: "GitHub", linkedin: "LinkedIn", email: "Email", resume: "Resume" },
        },
        footer: {
            rights: "All rights reserved.",
            builtWith: "Built with HTML, CSS, JavaScript, Three.js and GSAP.",
        },
    },

    "de-DE": {
        meta: {
            title: "Edgard Costa — Software Engineer & Astrophysik-Enthusiast",
            description:
                "Portfolio von Edgard Costa, Software-Ingenieur mit Fokus auf Künstliche Intelligenz und Leidenschaft für Astrophysik.",
        },
        nav: {
            about: "Über mich",
            education: "Ausbildung",
            courses: "Kurse",
            tech: "Technologien",
            projects: "Projekte",
            certificates: "Zertifikate",
            experience: "Erfahrung",
            contact: "Kontakt",
        },
        ingress: {
            skip: "Intro überspringen",
            meterLabel: "Annäherung",
            horizon: {
                line1: "Sgr A* — Ereignishorizont",
                line2: "RA 05h 35m · DEC −05° 23′",
                line3: "Orbit wird synchronisiert",
            },
            blueprint: {
                line1: "Modell EC-1 · experimentales Triebwerk",
                line2: "Maßstab 1:120",
                line3: "Status: Vorstart",
            },
        },
        hero: {
            eyebrow: "RA 05h 35m · DEC −05° 23′ · ERDE",
            name: "Edgard Costa",
            roles: ["Softwareentwickler", "KI-Engineering", "Full-Stack-Entwickler", "Astrophysik-Enthusiast"],
            description:
                "Mich interessiert, wie Dinge unter der Oberfläche funktionieren — ob Produktionssystem oder kollabierender Stern, spielt keine Rolle. Ich schreibe Code mit demselben Instinkt: erst verstehen, dann bauen.",
            ctaPrimary: "Lebenslauf",
            ctaSecondary: "Projekte ansehen",
            scroll: "Entdecken",
        },
        about: {
            eyebrow: "Über mich",
            title: "Softwaretechnik im Alltag, Astrophysik nebenbei",
            p1: "Ich bin Full-Stack-Entwickler. Die meiste Zeit verbringe ich mit Backend und Systemarchitektur, arbeite mich aber gerne bis zur Oberfläche durch. In letzter Zeit teste ich generative KI in echten Szenarien, nicht nur in Wochenend-Prototypen.",
            p2: "Neben dem Code studiere ich Astrophysik im Selbststudium — Bahnmechanik, Sternentstehung, sowas. Hat nichts direkt mit der Arbeit zu tun, ist einfach Neugier. Hilft aber, geduldig zu bleiben bei Problemen ohne offensichtliche Lösung.",
            p3: "In den letzten Monaten ging es vor allem darum, Grundlagenlücken zu schließen, die das Studium noch nicht abgedeckt hat, und generative KI jenseits des Hypes zu testen — ohne Eile, aber ohne Stillstand.",
            stats: [
                { value: "2+", label: "Jahre Softwaretechnik-Studium" },
                { value: "6+", label: "Aktiv genutzte Technologien" },
                { value: "∞", label: "Neugier für KI und Astrophysik" },
            ],
        },
        education: {
            eyebrow: "Akademischer Werdegang",
            title: "Solide Grundlage, zwei Wege",
            fiap: {
                institution: "FIAP",
                course: "Softwaretechnik",
                period: "Laufend",
                description: "Studiengang mit Fokus auf Systemarchitektur, Daten und Cloud, mit ordentlich viel praktischer Anwendung.",
            },
            fatec: {
                institution: "FATEC",
                course: "Systemanalyse und -entwicklung",
                period: "Laufend",
                description: "Grundlage in Logik, Algorithmen, Datenbanken und Entwicklung für skalierbare Systeme.",
            },
        },
        courses: {
            eyebrow: "Ergänzende Studien",
            title: "Kontinuierlicher Spezialisierungsweg",
            items: [
                { title: "Künstliche Intelligenz", period: "Laufend", tag: "KI" },
                { title: "Machine Learning", period: "Laufend", tag: "ML" },
                { title: "Deep Learning", period: "Geplant", tag: "DL" },
                { title: "Javascript", period: "Laufend", tag: "JS" },
                { title: "Softwaretechnik", period: "Geplant", tag: "ST" },
                { title: "Beobachtende Astrophysik", period: "Selbststudium", tag: "Astro" },
            ],
        },
        tech: {
            eyebrow: "Technisches Arsenal",
            title: "Technologien & Werkzeuge",
        },
        projects: {
            eyebrow: "Ausgewählte Arbeiten",
            title: "Projekte",
            filters: { all: "Alle", web: "Web", ai: "KI", tools: "Tools" },
            viewDemo: "Besuchen Sie die Website",
            items: [
                {
                    title: "TwentyTwo Imports — E-Commerce",
                    image: "assets/images/logos/newlogo.jpeg",
                    description:
                        "E-Commerce-Website für das Unternehmen TwentyTwo Imports mit Verwaltungs-Dashboard, Produktkatalog und Checkout-System.",
                    tags: ["React", "Typescript", "Supabase"],
                    category: "web",
                    url: "https://twentytwoimports.com.br/",
                },
                {
                    title: "Nova — LLM-Assistent",
                    description:
                        "Konversations-Assistent auf Basis der OpenAI API mit Kontextgedächtnis und externen Tools.",
                    tags: ["Python", "OpenAI API", "FastAPI"],
                    category: "ai",
                },
                {
                    title: "Pulsar — Automatisierungs-CLI",
                    description:
                        "Kommandozeilen-Tool zur Automatisierung von Deploys und lokalen Entwicklungsroutinen.",
                    tags: ["Node.js", "TypeScript", "Docker"],
                    category: "tools",
                },
            ],
        },
        certificates: {
            eyebrow: "Anerkennung",
            title: "Zertifikate & Badges",
            viewCredential: "Nachweis ansehen",
            items: [
                {
                    title: "Quantenrätsel",
                    issuer: "IBM",
                    date: "2026",
                    description: "Grundlegendes Verständnis des Quantencomputings, einschließlich Prinzipien wie Quantensuperposition, Verschränkung und Messung",
                    image: "assets/images/certificates/quantum-enigmas.png",
                    url: "https://www.credly.com/badges/1ad395cb-45c5-46a4-8c0b-4282011b51f4/public_url",
                },
                {
                    title: "Astrophysik I",
                    issuer: "UFSC",
                    date: "2026",
                    description: "Gravitation. Licht. Optik. Astrophysikalische Instrumente. Sonnensystem. Sonne. Exoplaneten. Entstehung von Planetensystemen. Leben. Leben auf der Erde. Nachweis von Leben. Bewohnbare Welten. Suche nach intelligentem Leben. Astrobiologie.",
                    image: "assets/images/logos/Brasao_UFSC_vertical_extenso.svg",
                    url: "#",
                },
                {
                    title: "Softwaretechnik im Zeitalter der KI",
                    issuer: "CertiProf",
                    date: "2024",
                    description: "Wie sich das Softwaretechnik im Zeitalter der KI anpasst, weiterentwickelt und eingesetzt wird.",
                    image: "assets/images/certificates/alura.png",
                    url: "#",
                },
                {
                    title: "Softwaretechnik im Zeitalter der KI",
                    issuer: "CertiProf",
                    date: "2024",
                    description: "Wie sich das Softwaretechnik im Zeitalter der KI anpasst, weiterentwickelt und eingesetzt wird.",
                    image: "assets/images/certificates/alura.png",
                    url: "#",
                },
                {
                    title: "Softwaretechnik im Zeitalter der KI",
                    issuer: "CertiProf",
                    date: "2024",
                    description: "Wie sich das Softwaretechnik im Zeitalter der KI anpasst, weiterentwickelt und eingesetzt wird.",
                    image: "assets/images/certificates/alura.png",
                    url: "#",
                },
                {
                    title: "Softwaretechnik im Zeitalter der KI",
                    issuer: "CertiProf",
                    date: "2024",
                    description: "Wie sich das Softwaretechnik im Zeitalter der KI anpasst, weiterentwickelt und eingesetzt wird.",
                    image: "assets/images/certificates/alura.png",
                    url: "#",
                },
                
            ],
        },
        experience: {
            eyebrow: "Werdegang",
            title: "Berufserfahrung",
            placeholderTitle: "Nächste Mission",
            placeholderText: "Ich habe noch keine formale Berufserfahrung, die ich hier auflisten kann — das ändert sich bald.",
        },
        contact: {
            eyebrow: "Kontakt",
            title: "Lust auf ein Gespräch?",
            description:
                "Offen für Gelegenheiten und Kooperationen. Und immer für ein gutes Gespräch über Technik zu haben — oder Astrophysik, wenn Zeit bleibt.",
            formName: "Name",
            formEmail: "E-Mail",
            formMessage: "Nachricht",
            formSubmit: "Nachricht senden",
            links: { github: "GitHub", linkedin: "LinkedIn", email: "E-Mail", resume: "Lebenslauf" },
        },
        footer: {
            rights: "Alle Rechte vorbehalten.",
            builtWith: "Erstellt mit HTML, CSS, JavaScript, Three.js und GSAP.",
        },
    },
};

/**
 * Resolve uma chave em dot.path (ex: "hero.ctaPrimary") dentro do objeto
 * de traduções do idioma informado. Retorna undefined caso a chave não exista,
 * permitindo que o chamador trate o fallback (nunca lançar exceção silenciosa).
 */
export function resolveTranslation(locale, dotPath) {
    const dict = translations[locale];
    if (!dict) return undefined;
    return dotPath.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dict);
}
