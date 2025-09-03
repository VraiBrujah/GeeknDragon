# Analyse du projet et APIs recommandées

## Avis sur le projet

- **Ambition claire mais encore embryonnaire.** La documentation décrit un éditeur WYSIWYG comparable à Figma/Webflow avec 34 widgets, auto-layout, CRDT, etc. Cependant, le dépôt ne contient pour l’instant qu’un squelette : quelques pages HTML, un `BaseWidget` minimal en TypeScript et la configuration Tailwind.
- **Architecture conceptualisée.** Les fichiers `architecture.md`, `vision.md` et `CLAUDE.md` détaillent une vision très aboutie (hiérarchie de widgets, synchronisation Editor↔Viewer, sauvegarde locale…), ce qui offre un bon cadre pour la suite.
- **Risque de réinventer des briques complexes.** Beaucoup de fonctionnalités prévues existent déjà dans des outils open‑source ou des APIs Web ; capitaliser dessus permettra de se concentrer sur les éléments différenciants.

## APIs et bibliothèques utiles pour ne pas réinventer la roue

| Besoin annoncé | APIs / bibliothèques recommandées | Pourquoi |
| -- | -- | -- |
| Édition WYSIWYG rich text | ProseMirror, TipTap, Quill, Slate.js | Gestion avancée du texte, plugins, undo/redo, support Markdown. |
| Canvas & manipulation d’objets | Konva, Fabric.js, tldraw, Excalidraw | Interaction graphique, transformation, export en SVG/PNG. |
| Drag & drop / redimensionnement | Web Drag & Drop API, dnd-kit, interact.js, react-beautiful-dnd | Gestion du glisser-déposer et des contraintes de positionnement. |
| Auto‑layout & design tokens | CSS Grid/Flexbox, tailwindcss, style-dictionary | Layout responsive et variables globales. |
| Collaboration temps réel / CRDT | Yjs, Automerge, Liveblocks | Synchronisation multi‑utilisateurs, résolution de conflits, offline-first. |
| Persistance locale / historique | localStorage, IndexedDB via Dexie.js ou localForage, immer pour undo/redo | Stockage performant et historique persistant. |
| Édition de formulaires | React Hook Form, Yup ou Zod | Validation, messages d’erreur, gestion des champs. |
| Animations & prototypage | GSAP, anime.js | Easing, timelines, transitions complexes. |
| Export HTML/PNG/PDF | html2canvas, dom-to-image, jsPDF, JSZip | Génération d’assets et export ZIP de projets. |
| Internationalisation | Intl API native, i18next | Gestion multi‑langue et formatting. |
| Accessibilité | axe-core, aria Web APIs | Audit et conformité WCAG 2.x. |

## Conclusion

Le projet présente une vision ambitieuse mais encore préliminaire. S’appuyer sur des bibliothèques spécialisées pour la gestion de texte riche, la collaboration temps réel, le canvas ou l’export permettra de se concentrer sur la valeur ajoutée marketing et la structure modulaire des widgets sans réimplémenter des composants déjà éprouvés.
