/**
 * Static Course Data
 *
 * This file contains AI-generated course content for the landing page and courses listing.
 * These are foundational courses that serve as the entry point for each domain.
 */

export interface CourseChapter {
  id: number;
  title: string;
  description: string;
  duration: string;
  order: number;
  topics: string[];
}

export interface StaticCourse {
  id: number;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  domain: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  chapters: CourseChapter[];
  learningObjectives: string[];
  prerequisites: string[];
  tools: string[];
}

/**
 * Foundation Courses - Featured on Homepage
 * One course per domain to introduce learners to the field
 */
export const foundationCourses: StaticCourse[] = [
  {
    id: 1,
    slug: "introduction-developpement-web-moderne",
    title: "Introduction au Développement Web Moderne",
    description:
      "Maîtrisez les fondamentaux du développement web avec HTML, CSS et JavaScript",
    fullDescription:
      "Ce cours complet vous guide à travers les bases essentielles du développement web moderne. Vous apprendrez à créer des sites web responsive et interactifs en utilisant les technologies web standard : HTML5 pour la structure, CSS3 pour le style et JavaScript pour l'interactivité. À la fin de ce cours, vous serez capable de construire vos propres sites web professionnels.",
    domain: "Développement Web",
    instructor: "Yassine Benali",
    thumbnail: "/react-course.png",
    duration: "12 semaines",
    level: "Débutant",
    learningObjectives: [
      "Créer des pages web structurées avec HTML5 sémantique",
      "Styliser des interfaces modernes avec CSS3 et Flexbox/Grid",
      "Ajouter de l'interactivité avec JavaScript ES6+",
      "Développer des sites responsive adaptés à tous les écrans",
      "Comprendre les bonnes pratiques du développement web",
      "Déployer vos projets en ligne",
    ],
    prerequisites: [
      "Aucune expérience en programmation requise",
      "Un ordinateur avec accès à Internet",
      "Motivation pour apprendre",
    ],
    tools: [
      "Visual Studio Code",
      "Google Chrome DevTools",
      "Git & GitHub",
      "Netlify/Vercel pour le déploiement",
    ],
    chapters: [
      {
        id: 1,
        title: "Les Fondamentaux du HTML",
        description:
          "Découvrez la structure de base d'une page web et les principales balises HTML5",
        duration: "2h 30min",
        order: 1,
        topics: [
          "Structure d'un document HTML",
          "Balises sémantiques (header, nav, main, footer)",
          "Formulaires et validation",
          "Tableaux et listes",
          "Liens et navigation",
        ],
      },
      {
        id: 2,
        title: "Styliser avec CSS3",
        description: "Apprenez à créer des designs attractifs avec CSS moderne",
        duration: "3h 15min",
        order: 2,
        topics: [
          "Sélecteurs CSS et spécificité",
          "Box Model et positionnement",
          "Flexbox pour les layouts flexibles",
          "CSS Grid pour les grilles complexes",
          "Animations et transitions",
          "Variables CSS et bonnes pratiques",
        ],
      },
      {
        id: 3,
        title: "JavaScript pour Débutants",
        description:
          "Ajoutez de l'interactivité à vos pages web avec JavaScript",
        duration: "4h",
        order: 3,
        topics: [
          "Variables, types de données et opérateurs",
          "Fonctions et portée (scope)",
          "Manipulation du DOM",
          "Événements utilisateur",
          "Conditions et boucles",
          "Tableaux et objets",
        ],
      },
      {
        id: 4,
        title: "Design Responsive",
        description: "Créez des sites qui s'adaptent à tous les appareils",
        duration: "2h 45min",
        order: 4,
        topics: [
          "Media queries et breakpoints",
          "Mobile-first approach",
          "Images responsive",
          "Unités relatives (rem, em, %, vw, vh)",
          "Frameworks CSS (introduction à Tailwind)",
        ],
      },
      {
        id: 5,
        title: "JavaScript Avancé et APIs",
        description: "Explorez les concepts avancés et l'intégration d'APIs",
        duration: "3h 30min",
        order: 5,
        topics: [
          "Asynchrone : Promises et Async/Await",
          "Fetch API et requêtes HTTP",
          "Local Storage et Session Storage",
          "Modules JavaScript (import/export)",
          "Gestion des erreurs",
        ],
      },
      {
        id: 6,
        title: "Projet Final : Portfolio Personnel",
        description: "Construisez votre portfolio professionnel from scratch",
        duration: "5h",
        order: 6,
        topics: [
          "Planification et wireframing",
          "Structure HTML complète",
          "Styles CSS avancés",
          "Interactivité JavaScript",
          "Optimisation des performances",
          "Déploiement sur Netlify/Vercel",
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "principes-design-graphique-digital",
    title: "Principes du Design Graphique Digital",
    description:
      "Apprenez les fondamentaux du design graphique et créez des visuels professionnels",
    fullDescription:
      "Plongez dans l'univers du design graphique digital et découvrez comment créer des visuels percutants et professionnels. Ce cours couvre les principes fondamentaux du design, la théorie des couleurs, la typographie, et l'utilisation des outils professionnels comme Figma et Adobe Creative Suite. Vous développerez un œil critique pour le design et créerez votre propre portfolio de projets.",
    domain: "Design Graphique",
    instructor: "Salma Idrissi",
    thumbnail: "/ux-ui-design-course.png",
    duration: "10 semaines",
    level: "Débutant",
    learningObjectives: [
      "Comprendre les principes fondamentaux du design graphique",
      "Maîtriser la théorie des couleurs et la psychologie visuelle",
      "Utiliser la typographie de manière efficace",
      "Créer des compositions équilibrées et harmonieuses",
      "Utiliser Figma pour créer des designs professionnels",
      "Développer votre identité visuelle personnelle",
    ],
    prerequisites: [
      "Aucune expérience en design requise",
      "Un ordinateur (Mac ou PC)",
      "Créativité et sens de l'esthétique",
    ],
    tools: [
      "Figma (gratuit)",
      "Adobe Photoshop (optionnel)",
      "Adobe Illustrator (optionnel)",
      "Canva pour prototypage rapide",
    ],
    chapters: [
      {
        id: 1,
        title: "Introduction au Design Graphique",
        description:
          "Découvrez l'histoire et les fondamentaux du design graphique",
        duration: "2h",
        order: 1,
        topics: [
          "Histoire du design graphique",
          "Rôle du designer dans le monde digital",
          "Processus de design thinking",
          "Analyse de cas d'études célèbres",
          "Tendances actuelles du design",
        ],
      },
      {
        id: 2,
        title: "Les Principes du Design",
        description:
          "Maîtrisez les règles de base pour créer des designs efficaces",
        duration: "3h",
        order: 2,
        topics: [
          "Équilibre et hiérarchie visuelle",
          "Contraste et emphase",
          "Alignement et proximité",
          "Répétition et cohérence",
          "Espace blanc (whitespace)",
          "La règle des tiers et le nombre d'or",
        ],
      },
      {
        id: 3,
        title: "Théorie des Couleurs",
        description:
          "Comprenez la psychologie des couleurs et créez des palettes harmonieuses",
        duration: "2h 30min",
        order: 3,
        topics: [
          "Le cercle chromatique",
          "Couleurs primaires, secondaires et tertiaires",
          "Harmonies de couleurs (complémentaires, analogues, triadiques)",
          "Psychologie et symbolique des couleurs",
          "Couleurs et accessibilité",
          "Outils pour créer des palettes (Coolors, Adobe Color)",
        ],
      },
      {
        id: 4,
        title: "Typographie et Lettering",
        description:
          "Apprenez l'art de la typographie et choisissez les bonnes polices",
        duration: "2h 45min",
        order: 4,
        topics: [
          "Anatomie d'une police de caractères",
          "Familles de polices (Serif, Sans-serif, Script)",
          "Hiérarchie typographique",
          "Pairings de polices",
          "Lisibilité et accessibilité",
          "Ressources de polices gratuites (Google Fonts, Adobe Fonts)",
        ],
      },
      {
        id: 5,
        title: "Maîtriser Figma",
        description:
          "Devenez expert dans l'utilisation de Figma pour vos designs",
        duration: "4h",
        order: 5,
        topics: [
          "Interface et outils de base",
          "Frames, groupes et auto-layout",
          "Composants et variants",
          "Prototypage et interactions",
          "Collaboration en temps réel",
          "Plugins essentiels",
          "Export et handoff développeur",
        ],
      },
      {
        id: 6,
        title: "Projet : Identité Visuelle Complète",
        description:
          "Créez une identité de marque complète pour un client fictif",
        duration: "5h",
        order: 6,
        topics: [
          "Brief client et recherche",
          "Moodboard et inspiration",
          "Logo design et déclinaisons",
          "Palette de couleurs et typographie",
          "Création de mockups",
          "Guide de style (brand guidelines)",
          "Présentation professionnelle",
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "fondamentaux-marketing-digital",
    title: "Fondamentaux du Marketing Digital",
    description:
      "Découvrez les stratégies essentielles du marketing digital moderne",
    fullDescription:
      "Entrez dans le monde dynamique du marketing digital et apprenez à promouvoir efficacement des produits et services en ligne. Ce cours complet couvre tous les aspects essentiels : SEO, réseaux sociaux, email marketing, publicité en ligne et analytics. Vous développerez des compétences pratiques pour créer et exécuter des campagnes marketing performantes.",
    domain: "Marketing Digital",
    instructor: "Karim Alami",
    thumbnail: "/marketing-course-concept.png",
    duration: "11 semaines",
    level: "Débutant",
    learningObjectives: [
      "Comprendre les fondamentaux du marketing digital",
      "Maîtriser les stratégies SEO pour améliorer la visibilité",
      "Créer du contenu engageant pour les réseaux sociaux",
      "Concevoir des campagnes email marketing efficaces",
      "Utiliser Google Ads et Facebook Ads",
      "Analyser les performances avec Google Analytics",
    ],
    prerequisites: [
      "Aucune expérience en marketing requise",
      "Familiarité avec Internet et les réseaux sociaux",
      "Un ordinateur avec accès à Internet",
    ],
    tools: [
      "Google Analytics",
      "Google Search Console",
      "Facebook Business Manager",
      "Mailchimp ou Sendinblue",
      "Canva pour le contenu visuel",
      "Hootsuite ou Buffer",
    ],
    chapters: [
      {
        id: 1,
        title: "Introduction au Marketing Digital",
        description: "Découvrez l'écosystème du marketing en ligne",
        duration: "2h 15min",
        order: 1,
        topics: [
          "Évolution du marketing traditionnel au digital",
          "Les canaux du marketing digital",
          "Funnel de conversion (AIDA model)",
          "Customer journey mapping",
          "KPIs et métriques essentielles",
          "Études de cas de campagnes réussies",
        ],
      },
      {
        id: 2,
        title: "SEO : Optimisation pour les Moteurs de Recherche",
        description: "Améliorez votre visibilité organique sur Google",
        duration: "3h 30min",
        order: 2,
        topics: [
          "Fonctionnement des moteurs de recherche",
          "Recherche de mots-clés (keyword research)",
          "SEO on-page : balises, structure, contenu",
          "SEO off-page : backlinks et autorité",
          "SEO technique : vitesse, mobile-first, Core Web Vitals",
          "Outils SEO (Google Search Console, SEMrush, Ahrefs)",
          "Local SEO pour les entreprises locales",
        ],
      },
      {
        id: 3,
        title: "Content Marketing et Stratégie de Contenu",
        description: "Créez du contenu qui attire et engage votre audience",
        duration: "2h 45min",
        order: 3,
        topics: [
          "Importance du content marketing",
          "Créer une stratégie de contenu",
          "Types de contenu (blog, vidéo, infographie, podcast)",
          "Storytelling et brand voice",
          "Calendrier éditorial",
          "Optimisation du contenu pour le SEO",
          "Mesurer les performances du contenu",
        ],
      },
      {
        id: 4,
        title: "Marketing sur les Réseaux Sociaux",
        description: "Développez votre présence sur les plateformes sociales",
        duration: "3h",
        order: 4,
        topics: [
          "Choisir les bonnes plateformes (Facebook, Instagram, LinkedIn, TikTok)",
          "Créer une stratégie social media",
          "Types de publications et formats",
          "Engagement et community management",
          "Publicités sociales (Social Ads)",
          "Influencer marketing",
          "Outils de gestion et planification",
        ],
      },
      {
        id: 5,
        title: "Email Marketing et Automation",
        description: "Construisez et nurturez votre liste d'abonnés",
        duration: "2h 30min",
        order: 5,
        topics: [
          "Building une liste email qualifiée",
          "Segmentation d'audience",
          "Design d'emails efficaces",
          "Copywriting pour l'email marketing",
          "A/B testing",
          "Automation et workflows (drip campaigns)",
          "Métriques : taux d'ouverture, CTR, conversions",
        ],
      },
      {
        id: 6,
        title: "Publicité en Ligne (PPC)",
        description: "Lancez des campagnes publicitaires rentables",
        duration: "3h 15min",
        order: 6,
        topics: [
          "Introduction au PPC (Pay-Per-Click)",
          "Google Ads : campagnes Search et Display",
          "Facebook Ads et Instagram Ads",
          "Ciblage d'audience (démographique, comportemental, retargeting)",
          "Création de landing pages optimisées",
          "Budget et enchères",
          "Optimisation des campagnes et ROAS",
        ],
      },
      {
        id: 7,
        title: "Analytics et Mesure de Performance",
        description: "Analysez vos données pour optimiser vos campagnes",
        duration: "2h 45min",
        order: 7,
        topics: [
          "Google Analytics : configuration et navigation",
          "Comprendre les rapports (audience, acquisition, comportement, conversions)",
          "Objectifs et événements",
          "Attribution modeling",
          "UTM parameters pour le tracking",
          "Google Tag Manager",
          "Dashboards et rapports personnalisés",
        ],
      },
      {
        id: 8,
        title: "Projet Final : Campagne Marketing Complète",
        description: "Créez et présentez une stratégie marketing intégrée",
        duration: "4h",
        order: 8,
        topics: [
          "Choix d'une entreprise ou produit",
          "Analyse de marché et concurrence",
          "Définition des personas",
          "Stratégie multi-canaux",
          "Calendrier et budget",
          "KPIs et objectifs mesurables",
          "Présentation professionnelle",
        ],
      },
    ],
  },
];

/**
 * Extended Courses - For "All Courses" Page
 * Building upon the foundation courses with more advanced and specialized content
 */
export const allStaticCourses: StaticCourse[] = [
  // Include foundation courses
  ...foundationCourses,

  // Additional Web Development Courses
  {
    id: 4,
    slug: "react-nextjs-applications-modernes",
    title: "React & Next.js : Applications Web Modernes",
    description:
      "Construisez des applications web performantes avec React et Next.js",
    fullDescription:
      "Approfondissez vos compétences en développement web avec React, la bibliothèque JavaScript la plus populaire, et Next.js, le framework React pour la production. Apprenez les hooks, le state management, le routing, le SSR et bien plus encore.",
    domain: "Développement Web",
    instructor: "Yassine Benali",
    thumbnail: "/react-course.png",
    duration: "14 semaines",
    level: "Intermédiaire",
    learningObjectives: [
      "Maîtriser React et ses hooks",
      "Développer avec Next.js 14 App Router",
      "Gérer l'état avec Context API et Zustand",
      "Implémenter l'authentification",
      "Optimiser les performances",
      "Déployer sur Vercel",
    ],
    prerequisites: [
      "Connaissance de JavaScript ES6+",
      "Compréhension de HTML et CSS",
      "Avoir complété le cours d'introduction au développement web",
    ],
    tools: ["React 18", "Next.js 14", "TypeScript", "Tailwind CSS", "Vercel"],
    chapters: [
      {
        id: 1,
        title: "Fondamentaux de React",
        description: "Composants, Props et State",
        duration: "4h",
        order: 1,
        topics: [
          "JSX",
          "Composants fonctionnels",
          "Props",
          "useState",
          "Événements",
        ],
      },
      {
        id: 2,
        title: "Hooks Avancés",
        description: "useEffect, useContext, useReducer et hooks personnalisés",
        duration: "3h 30min",
        order: 2,
        topics: [
          "useEffect",
          "useContext",
          "useReducer",
          "useMemo",
          "Custom Hooks",
        ],
      },
      {
        id: 3,
        title: "Next.js et App Router",
        description: "Server Components, Routing et Data Fetching",
        duration: "4h 30min",
        order: 3,
        topics: [
          "App Router",
          "Server Components",
          "Data Fetching",
          "Metadata",
          "Dynamic Routes",
        ],
      },
      {
        id: 4,
        title: "State Management",
        description: "Gérer l'état global de votre application",
        duration: "3h",
        order: 4,
        topics: [
          "Context API",
          "Zustand",
          "Redux Toolkit (introduction)",
          "Best practices",
        ],
      },
      {
        id: 5,
        title: "Authentification et Sécurité",
        description: "NextAuth, JWT et protection des routes",
        duration: "3h 30min",
        order: 5,
        topics: [
          "NextAuth.js",
          "JWT Tokens",
          "Protected Routes",
          "Role-based Access",
        ],
      },
      {
        id: 6,
        title: "Projet : Application SaaS Complète",
        description: "Dashboard avec authentification et API",
        duration: "6h",
        order: 6,
        topics: [
          "Architecture",
          "API Routes",
          "Database Integration",
          "Deployment",
        ],
      },
    ],
  },
  {
    id: 5,
    slug: "backend-nodejs-express-postgresql",
    title: "Backend avec Node.js, Express et PostgreSQL",
    description: "Créez des APIs robustes et scalables avec Node.js",
    fullDescription:
      "Maîtrisez le développement backend avec Node.js, Express et PostgreSQL. Apprenez à créer des APIs RESTful sécurisées, à gérer les bases de données relationnelles et à déployer vos applications en production.",
    domain: "Développement Web",
    instructor: "Yassine Benali",
    thumbnail: "/react-course.png",
    duration: "12 semaines",
    level: "Intermédiaire",
    learningObjectives: [
      "Créer des APIs RESTful avec Express",
      "Gérer des bases de données PostgreSQL",
      "Implémenter l'authentification JWT",
      "Sécuriser vos APIs",
      "Tester votre code",
      "Déployer sur des serveurs cloud",
    ],
    prerequisites: [
      "JavaScript intermédiaire",
      "Compréhension des concepts HTTP",
      "Bases de données (notions)",
    ],
    tools: [
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Drizzle ORM",
      "JWT",
      "Docker",
    ],
    chapters: [
      {
        id: 1,
        title: "Introduction à Node.js",
        description: "Environnement d'exécution et modules",
        duration: "2h 30min",
        order: 1,
        topics: [
          "Node.js runtime",
          "NPM",
          "Modules",
          "File System",
          "Event Loop",
        ],
      },
      {
        id: 2,
        title: "Express.js Fondamentaux",
        description: "Routing, Middleware et Error Handling",
        duration: "3h",
        order: 2,
        topics: [
          "Express setup",
          "Routes",
          "Middleware",
          "Error handling",
          "Validation",
        ],
      },
      {
        id: 3,
        title: "PostgreSQL et ORM",
        description: "Bases de données relationnelles avec Drizzle",
        duration: "4h",
        order: 3,
        topics: [
          "PostgreSQL basics",
          "Drizzle ORM",
          "Migrations",
          "Relations",
          "Queries",
        ],
      },
      {
        id: 4,
        title: "Authentification et Autorisation",
        description: "JWT, Sessions et Permissions",
        duration: "3h 30min",
        order: 4,
        topics: ["JWT tokens", "Bcrypt", "Refresh tokens", "RBAC", "OAuth"],
      },
      {
        id: 5,
        title: "Testing et Documentation",
        description: "Jest, Supertest et Swagger",
        duration: "2h 45min",
        order: 5,
        topics: [
          "Unit tests",
          "Integration tests",
          "Jest",
          "Supertest",
          "API documentation",
        ],
      },
      {
        id: 6,
        title: "Déploiement et DevOps",
        description: "Docker, CI/CD et Cloud",
        duration: "3h",
        order: 6,
        topics: [
          "Docker",
          "GitHub Actions",
          "Railway/Render",
          "Environment variables",
          "Monitoring",
        ],
      },
    ],
  },
  {
    id: 6,
    slug: "typescript-developpeur-pro",
    title: "TypeScript pour Développeurs Professionnels",
    description:
      "Maîtrisez TypeScript pour écrire du code type-safe et maintenable",
    fullDescription:
      "Élevez votre niveau de développement JavaScript avec TypeScript. Apprenez le système de types, les interfaces, les generics et les patterns avancés pour écrire du code robuste et scalable.",
    domain: "Développement Web",
    instructor: "Yassine Benali",
    thumbnail: "/react-course.png",
    duration: "8 semaines",
    level: "Intermédiaire",
    learningObjectives: [
      "Comprendre le système de types TypeScript",
      "Utiliser les types avancés et generics",
      "Configurer TypeScript dans vos projets",
      "Migrer du JavaScript vers TypeScript",
      "Patterns et best practices",
    ],
    prerequisites: [
      "JavaScript ES6+ solide",
      "Expérience avec des frameworks modernes",
    ],
    tools: ["TypeScript", "TS-Node", "ESLint", "Prettier"],
    chapters: [
      {
        id: 1,
        title: "Bases de TypeScript",
        description: "Types primitifs et configuration",
        duration: "2h",
        order: 1,
        topics: [
          "Types de base",
          "Interfaces",
          "Type aliases",
          "tsconfig.json",
          "Compilation",
        ],
      },
      {
        id: 2,
        title: "Types Avancés",
        description: "Union, Intersection, Conditional Types",
        duration: "3h",
        order: 2,
        topics: [
          "Union types",
          "Intersection",
          "Type guards",
          "Conditional types",
          "Mapped types",
        ],
      },
      {
        id: 3,
        title: "Generics",
        description: "Code réutilisable avec les génériques",
        duration: "2h 30min",
        order: 3,
        topics: [
          "Generic functions",
          "Generic classes",
          "Constraints",
          "Utility types",
        ],
      },
      {
        id: 4,
        title: "TypeScript avec React",
        description: "Typer vos composants React",
        duration: "2h 30min",
        order: 4,
        topics: [
          "Component types",
          "Props typing",
          "Hooks typing",
          "Event handlers",
          "Context API",
        ],
      },
      {
        id: 5,
        title: "Patterns Avancés",
        description: "Design patterns en TypeScript",
        duration: "2h",
        order: 5,
        topics: [
          "Decorators",
          "Abstract classes",
          "Mixins",
          "Module augmentation",
          "Declaration merging",
        ],
      },
    ],
  },

  // Additional Design Courses
  {
    id: 7,
    slug: "ux-ui-design-applications-mobiles",
    title: "UX/UI Design pour Applications Mobiles",
    description:
      "Créez des expériences utilisateur exceptionnelles pour mobile",
    fullDescription:
      "Spécialisez-vous dans le design d'applications mobiles. Apprenez les principes de l'UX/UI spécifiques au mobile, les patterns de navigation, les guidelines iOS et Android, et créez des prototypes interactifs avec Figma.",
    domain: "Design Graphique",
    instructor: "Salma Idrissi",
    thumbnail: "/ux-ui-design-course.png",
    duration: "10 semaines",
    level: "Intermédiaire",
    learningObjectives: [
      "Maîtriser les principes UX pour mobile",
      "Appliquer les guidelines iOS et Android",
      "Créer des wireframes et prototypes",
      "Conduire des tests utilisateurs",
      "Design systems pour mobile",
    ],
    prerequisites: [
      "Connaissance des bases du design",
      "Maîtrise de Figma",
      "Avoir complété le cours de design graphique",
    ],
    tools: [
      "Figma",
      "Sketch (optionnel)",
      "Principle pour animations",
      "Maze pour user testing",
    ],
    chapters: [
      {
        id: 1,
        title: "Fondamentaux UX Mobile",
        description: "Principes de l'expérience utilisateur mobile",
        duration: "2h 30min",
        order: 1,
        topics: [
          "Mobile-first thinking",
          "Touch interfaces",
          "Thumb zones",
          "Gestures",
          "User flows",
        ],
      },
      {
        id: 2,
        title: "iOS vs Android Guidelines",
        description: "Human Interface Guidelines et Material Design",
        duration: "3h",
        order: 2,
        topics: [
          "HIG iOS",
          "Material Design",
          "Navigation patterns",
          "Components",
          "Platform-specific design",
        ],
      },
      {
        id: 3,
        title: "Wireframing et Prototypage",
        description: "De l'idée au prototype interactif",
        duration: "3h 30min",
        order: 3,
        topics: [
          "Low-fi wireframes",
          "High-fi mockups",
          "Interactive prototypes",
          "Micro-interactions",
          "Animations",
        ],
      },
      {
        id: 4,
        title: "Design Systems Mobile",
        description: "Créer des systèmes de design cohérents",
        duration: "2h 45min",
        order: 4,
        topics: [
          "Component library",
          "Tokens",
          "Spacing systems",
          "Typography scale",
          "Documentation",
        ],
      },
      {
        id: 5,
        title: "User Testing",
        description: "Tester et itérer vos designs",
        duration: "2h",
        order: 5,
        topics: [
          "Usability testing",
          "A/B testing",
          "Heatmaps",
          "Analytics",
          "Feedback loops",
        ],
      },
      {
        id: 6,
        title: "Projet : Application Mobile Complète",
        description: "Design d'une app de A à Z",
        duration: "5h",
        order: 6,
        topics: [
          "Research",
          "User personas",
          "Information architecture",
          "Design",
          "Prototype",
          "Handoff",
        ],
      },
    ],
  },
  {
    id: 8,
    slug: "motion-design-animations",
    title: "Motion Design et Animations",
    description:
      "Donnez vie à vos designs avec des animations professionnelles",
    fullDescription:
      "Maîtrisez l'art du motion design et créez des animations captivantes. Apprenez After Effects, les principes de l'animation, et comment créer des animations pour le web, les réseaux sociaux et les interfaces.",
    domain: "Design Graphique",
    instructor: "Salma Idrissi",
    thumbnail: "/ux-ui-design-course.png",
    duration: "9 semaines",
    level: "Intermédiaire",
    learningObjectives: [
      "Maîtriser After Effects",
      "Comprendre les 12 principes de l'animation",
      "Créer des animations UI",
      "Exporter pour le web (Lottie)",
      "Motion branding",
    ],
    prerequisites: [
      "Bases du design graphique",
      "Maîtrise de Figma ou Illustrator",
    ],
    tools: [
      "Adobe After Effects",
      "Lottie",
      "Cinema 4D (introduction)",
      "Principle",
    ],
    chapters: [
      {
        id: 1,
        title: "Introduction au Motion Design",
        description: "Principes et histoire de l'animation",
        duration: "2h",
        order: 1,
        topics: [
          "12 principes d'animation",
          "Timing",
          "Easing",
          "Histoire",
          "Cas d'usage",
        ],
      },
      {
        id: 2,
        title: "After Effects Fondamentaux",
        description: "Interface et outils de base",
        duration: "3h 30min",
        order: 2,
        topics: [
          "Interface",
          "Keyframes",
          "Graph editor",
          "Parenting",
          "Masques",
          "Effects",
        ],
      },
      {
        id: 3,
        title: "Animations UI",
        description: "Micro-interactions et transitions",
        duration: "3h",
        order: 3,
        topics: [
          "Button animations",
          "Transitions",
          "Loading states",
          "Feedback animations",
          "Onboarding",
        ],
      },
      {
        id: 4,
        title: "Typography Animation",
        description: "Animer du texte de manière créative",
        duration: "2h 30min",
        order: 4,
        topics: [
          "Kinetic typography",
          "Text animators",
          "Expression",
          "Lower thirds",
          "Title sequences",
        ],
      },
      {
        id: 5,
        title: "Export et Integration",
        description: "Lottie et animations pour le web",
        duration: "2h",
        order: 5,
        topics: [
          "Lottie export",
          "JSON animations",
          "Bodymovin",
          "SVG animations",
          "Performance",
        ],
      },
      {
        id: 6,
        title: "Projet : Brand Animation",
        description: "Logo animation et brand video",
        duration: "4h",
        order: 6,
        topics: [
          "Logo reveal",
          "Brand colors",
          "Storyboard",
          "Sound design",
          "Final render",
        ],
      },
    ],
  },
  {
    id: 9,
    slug: "illustration-digitale-ipad",
    title: "Illustration Digitale avec iPad & Procreate",
    description: "Créez des illustrations professionnelles sur iPad",
    fullDescription:
      "Développez vos compétences en illustration digitale avec Procreate sur iPad. Apprenez les techniques de dessin, de coloration, et créez votre propre style artistique pour enrichir vos projets design.",
    domain: "Design Graphique",
    instructor: "Salma Idrissi",
    thumbnail: "/ux-ui-design-course.png",
    duration: "8 semaines",
    level: "Débutant",
    learningObjectives: [
      "Maîtriser Procreate",
      "Techniques de dessin digital",
      "Coloration et ombres",
      "Créer son style artistique",
      "Illustrations pour projets clients",
    ],
    prerequisites: [
      "iPad avec Apple Pencil",
      "Sens artistique",
      "Aucune expérience en dessin requise",
    ],
    tools: ["Procreate", "Adobe Fresco (optionnel)", "iPad Pro ou iPad Air"],
    chapters: [
      {
        id: 1,
        title: "Débuter avec Procreate",
        description: "Interface et outils essentiels",
        duration: "2h",
        order: 1,
        topics: [
          "Interface",
          "Brushes",
          "Layers",
          "Gestures",
          "Canvas setup",
          "Import/Export",
        ],
      },
      {
        id: 2,
        title: "Techniques de Dessin",
        description: "Lignes, formes et perspectives",
        duration: "3h",
        order: 2,
        topics: [
          "Line art",
          "Shapes",
          "Perspective",
          "Anatomy basics",
          "Character design",
          "Sketching",
        ],
      },
      {
        id: 3,
        title: "Couleur et Lumière",
        description: "Théorie et application",
        duration: "2h 30min",
        order: 3,
        topics: [
          "Color theory",
          "Palettes",
          "Shading",
          "Highlights",
          "Blending modes",
          "Atmosphere",
        ],
      },
      {
        id: 4,
        title: "Styles d'Illustration",
        description: "Explorer différents styles",
        duration: "2h 30min",
        order: 4,
        topics: [
          "Flat design",
          "Line art",
          "Watercolor",
          "Realistic",
          "Abstract",
          "Finding your style",
        ],
      },
      {
        id: 5,
        title: "Projet : Série d'Illustrations",
        description: "Portfolio de 5 illustrations",
        duration: "6h",
        order: 5,
        topics: [
          "Concept",
          "Thumbnails",
          "Sketches",
          "Final illustrations",
          "Consistency",
          "Portfolio presentation",
        ],
      },
    ],
  },

  // Additional Marketing Courses
  {
    id: 10,
    slug: "strategie-contenu-blogging",
    title: "Stratégie de Contenu et Blogging Professionnel",
    description: "Créez du contenu qui convertit et développe votre audience",
    fullDescription:
      "Devenez un expert en content marketing et blogging. Apprenez à créer une stratégie de contenu efficace, à écrire des articles optimisés SEO, à développer votre audience et à monétiser votre blog.",
    domain: "Marketing Digital",
    instructor: "Karim Alami",
    thumbnail: "/marketing-course-concept.png",
    duration: "9 semaines",
    level: "Intermédiaire",
    learningObjectives: [
      "Développer une stratégie de contenu",
      "Écrire des articles SEO-friendly",
      "Créer un calendrier éditorial",
      "Promouvoir votre contenu",
      "Analyser les performances",
      "Monétiser votre contenu",
    ],
    prerequisites: [
      "Bases du marketing digital",
      "Bonnes compétences rédactionnelles",
      "Avoir complété le cours de marketing digital fondamental",
    ],
    tools: [
      "WordPress",
      "Yoast SEO",
      "Google Analytics",
      "Semrush",
      "Grammarly",
      "Canva",
    ],
    chapters: [
      {
        id: 1,
        title: "Stratégie de Contenu",
        description: "Planifier votre content marketing",
        duration: "2h 30min",
        order: 1,
        topics: [
          "Content audit",
          "Buyer personas",
          "Content pillars",
          "Goals & KPIs",
          "Competitive analysis",
        ],
      },
      {
        id: 2,
        title: "Recherche de Sujets et Mots-clés",
        description: "Trouver les bons sujets à couvrir",
        duration: "2h 45min",
        order: 2,
        topics: [
          "Keyword research",
          "Search intent",
          "Topic clusters",
          "Content gaps",
          "Trending topics",
        ],
      },
      {
        id: 3,
        title: "Rédaction SEO",
        description: "Écrire pour les humains et les moteurs de recherche",
        duration: "3h",
        order: 3,
        topics: [
          "SEO copywriting",
          "Headlines",
          "Structure",
          "Meta descriptions",
          "Internal linking",
          "Featured snippets",
        ],
      },
      {
        id: 4,
        title: "Calendrier Éditorial",
        description: "Organiser et planifier votre contenu",
        duration: "2h",
        order: 4,
        topics: [
          "Content calendar",
          "Publishing frequency",
          "Batch creation",
          "Repurposing",
          "Evergreen content",
        ],
      },
      {
        id: 5,
        title: "Promotion de Contenu",
        description: "Diffuser votre contenu efficacement",
        duration: "2h 30min",
        order: 5,
        topics: [
          "Social media promotion",
          "Email newsletters",
          "Guest posting",
          "Influencer outreach",
          "Paid promotion",
        ],
      },
      {
        id: 6,
        title: "Analytics et Optimisation",
        description: "Mesurer et améliorer les performances",
        duration: "2h",
        order: 6,
        topics: [
          "Google Analytics",
          "Content metrics",
          "User engagement",
          "A/B testing",
          "Content refresh",
        ],
      },
      {
        id: 7,
        title: "Monétisation",
        description: "Générer des revenus avec votre contenu",
        duration: "2h",
        order: 7,
        topics: [
          "Affiliate marketing",
          "Sponsored content",
          "Digital products",
          "Memberships",
          "Ads",
          "Consulting",
        ],
      },
    ],
  },
  {
    id: 11,
    slug: "publicite-facebook-instagram-avancee",
    title: "Publicité Facebook & Instagram Avancée",
    description: "Maîtrisez les Facebook Ads pour générer des résultats",
    fullDescription:
      "Devenez expert en publicité sur Facebook et Instagram. Apprenez les stratégies avancées de ciblage, la création de campagnes performantes, l'optimisation du ROAS et le scaling de vos campagnes.",
    domain: "Marketing Digital",
    instructor: "Karim Alami",
    thumbnail: "/marketing-course-concept.png",
    duration: "10 semaines",
    level: "Avancé",
    learningObjectives: [
      "Maîtriser Facebook Ads Manager",
      "Créer des campagnes multi-objectifs",
      "Optimiser le coût par acquisition",
      "Retargeting et lookalike audiences",
      "Scaling stratégique",
      "Analytics avancés",
    ],
    prerequisites: [
      "Bases du marketing digital",
      "Connaissance des réseaux sociaux",
      "Budget publicitaire (même petit)",
    ],
    tools: [
      "Facebook Business Manager",
      "Facebook Ads Manager",
      "Facebook Pixel",
      "Google Analytics",
      "Canva pour créatives",
    ],
    chapters: [
      {
        id: 1,
        title: "Facebook Ads Manager Avancé",
        description: "Maîtriser l'interface et les options",
        duration: "2h 30min",
        order: 1,
        topics: [
          "Business Manager setup",
          "Campaign structure",
          "Ad sets",
          "Bidding strategies",
          "Budget optimization",
        ],
      },
      {
        id: 2,
        title: "Ciblage Avancé",
        description: "Atteindre la bonne audience",
        duration: "3h",
        order: 2,
        topics: [
          "Detailed targeting",
          "Custom audiences",
          "Lookalike audiences",
          "Audience insights",
          "Exclusions",
        ],
      },
      {
        id: 3,
        title: "Créatives qui Convertissent",
        description: "Images, vidéos et copywriting",
        duration: "2h 45min",
        order: 3,
        topics: [
          "Ad formats",
          "Image ads",
          "Video ads",
          "Carousel",
          "Stories",
          "Ad copy",
          "CTAs",
        ],
      },
      {
        id: 4,
        title: "Facebook Pixel et Tracking",
        description: "Mesurer et optimiser les conversions",
        duration: "2h 30min",
        order: 4,
        topics: [
          "Pixel installation",
          "Event setup",
          "Conversions API",
          "UTM parameters",
          "Attribution window",
        ],
      },
      {
        id: 5,
        title: "Stratégies de Campagne",
        description: "Du top of funnel au bottom of funnel",
        duration: "3h",
        order: 5,
        topics: [
          "Awareness campaigns",
          "Consideration",
          "Conversion",
          "Retargeting",
          "Full-funnel strategy",
        ],
      },
      {
        id: 6,
        title: "Optimisation et Scaling",
        description: "Améliorer le ROAS et scaler",
        duration: "2h 45min",
        order: 6,
        topics: [
          "A/B testing",
          "CBO vs ABO",
          "Scaling strategies",
          "Budget increases",
          "Creative testing",
        ],
      },
      {
        id: 7,
        title: "Projet : Campagne E-commerce",
        description: "Lancer une campagne complète",
        duration: "4h",
        order: 7,
        topics: [
          "Strategy",
          "Setup",
          "Créatives",
          "Launch",
          "Monitoring",
          "Optimization",
          "Reporting",
        ],
      },
    ],
  },
  {
    id: 12,
    slug: "growth-hacking-startups",
    title: "Growth Hacking pour Startups",
    description: "Techniques de croissance rapide avec un budget limité",
    fullDescription:
      "Découvrez les stratégies de growth hacking utilisées par les startups à succès. Apprenez à acquérir des utilisateurs rapidement, à optimiser votre funnel de conversion et à scaler votre croissance de manière virale.",
    domain: "Marketing Digital",
    instructor: "Karim Alami",
    thumbnail: "/marketing-course-concept.png",
    duration: "8 semaines",
    level: "Avancé",
    learningObjectives: [
      "Mindset de growth hacker",
      "Framework AARRR (Pirate Metrics)",
      "Acquisition hacks",
      "Optimisation du funnel",
      "Viral loops",
      "Product-market fit",
    ],
    prerequisites: [
      "Solide connaissance du marketing digital",
      "Expérience avec analytics",
      "Mindset entrepreneurial",
    ],
    tools: [
      "Google Analytics",
      "Mixpanel",
      "Hotjar",
      "Zapier",
      "Landing page builders",
      "Email automation",
    ],
    chapters: [
      {
        id: 1,
        title: "Introduction au Growth Hacking",
        description: "Mindset et méthodologie",
        duration: "2h",
        order: 1,
        topics: [
          "Growth mindset",
          "Pirate Metrics (AARRR)",
          "North Star Metric",
          "Experimentation",
          "Case studies",
        ],
      },
      {
        id: 2,
        title: "Acquisition Hacks",
        description: "Acquérir des utilisateurs rapidement",
        duration: "3h",
        order: 2,
        topics: [
          "Content hacking",
          "SEO hacks",
          "Product Hunt",
          "Reddit marketing",
          "Community building",
          "Referral programs",
        ],
      },
      {
        id: 3,
        title: "Activation et Onboarding",
        description: "Transformer visiteurs en utilisateurs actifs",
        duration: "2h 30min",
        order: 3,
        topics: [
          "Onboarding flows",
          "Aha moments",
          "Email sequences",
          "In-app messaging",
          "Gamification",
        ],
      },
      {
        id: 4,
        title: "Rétention et Engagement",
        description: "Garder vos utilisateurs actifs",
        duration: "2h 30min",
        order: 4,
        topics: [
          "Push notifications",
          "Email retention",
          "Feature adoption",
          "Habit formation",
          "Churn reduction",
        ],
      },
      {
        id: 5,
        title: "Viral Growth",
        description: "Créer des boucles virales",
        duration: "2h",
        order: 5,
        topics: [
          "Viral coefficient",
          "Referral programs",
          "Social sharing",
          "Invite mechanics",
          "Growth loops",
        ],
      },
      {
        id: 6,
        title: "Projet : Growth Strategy",
        description: "Plan de croissance complet",
        duration: "4h",
        order: 6,
        topics: [
          "Audit",
          "Hypotheses",
          "Experiments",
          "Metrics",
          "Implementation plan",
          "Pitch deck",
        ],
      },
    ],
  },
];

/**
 * Helper function to get courses by domain
 */
export function getCoursesByDomain(domain: string): StaticCourse[] {
  return allStaticCourses.filter((course) => course.domain === domain);
}

/**
 * Helper function to get a course by slug
 */
export function getCourseBySlug(slug: string): StaticCourse | undefined {
  return allStaticCourses.find((course) => course.slug === slug);
}

/**
 * Helper function to get a course by ID
 */
export function getCourseById(id: number): StaticCourse | undefined {
  return allStaticCourses.find((course) => course.id === id);
}

/**
 * Domain information
 */
export const domains = [
  {
    name: "Développement Web",
    slug: "developpement-web",
    description: "Apprenez à créer des sites web et applications modernes",
    icon: "Code",
    color: "blue",
    courseCount: allStaticCourses.filter(
      (c) => c.domain === "Développement Web"
    ).length,
  },
  {
    name: "Design Graphique",
    slug: "design-graphique",
    description: "Maîtrisez les outils et techniques du design digital",
    icon: "Palette",
    color: "purple",
    courseCount: allStaticCourses.filter((c) => c.domain === "Design Graphique")
      .length,
  },
  {
    name: "Marketing Digital",
    slug: "marketing-digital",
    description: "Développez vos compétences en marketing en ligne",
    icon: "TrendingUp",
    color: "green",
    courseCount: allStaticCourses.filter(
      (c) => c.domain === "Marketing Digital"
    ).length,
  },
];
