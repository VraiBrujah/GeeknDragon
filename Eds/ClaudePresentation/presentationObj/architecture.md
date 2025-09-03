# <a id="architecture-widgets"></a>🎨 NOUVELLE ARCHITECTURE WIDGETS - NIVEAU FIGMA 2024

### 🏗️ ARCHITECTURE BASEWIDGET (Classe Abstraite Universelle + Figma Features)
```
BaseWidget (Héritage obligatoire pour TOUS les widgets)
├── Propriétés Universelles
│   ├── Position (x, y, z-index relatif au parent)
│   ├── Taille (width, height en px, champs numériques)
│   ├── Marges (top, right, bottom, left en px)
│   ├── Alpha global (0-100% avec slider)
│   ├── Couleur arrière-plan (activable + picker couleur)
│   ├── Contour (activable + largeur + couleur + picker)
│   ├── Bordures arrondies (activable + degré d'arrondi)
│   ├── Surligange/Highlight (activable + couleur)
│   ├── Ombrage (activable + paramètres complets)
│   └── Gradient (activable + couleurs multiples + direction)
├── 🔥 AUTO-LAYOUT RESPONSIVE (Niveau Figma)
│   ├── Contraintes (left, right, center, scale, stretch)
│   ├── Breakpoints (desktop: 1200px+, tablet: 768px, mobile: 480px)
│   ├── Redimensionnement intelligent et proportionnel
│   └── Preview multi-devices intégré
├── 🎨 DESIGN TOKENS & VARIABLES GLOBALES
│   ├── Variables couleurs: {color.primary}, {color.secondary}...
│   ├── Variables espacement: {spacing.xs}, {spacing.sm}...
│   ├── Variables typographie: {font.h1}, {font.body}...
│   ├── Variables border-radius: {radius.small}, {radius.large}...
│   └── Synchronisation automatique sur tout le projet
├── ⚡ PROTOTYPAGE INTERACTIF (Comme Figma)
│   ├── États multiples: default, hover, active, disabled, focus
│   ├── Triggers: click, hover, key, scroll, timer
│   ├── Actions: navigate, overlay, scroll, animate, toggle
│   ├── Animations: duration, easing (ease-in, bounce...), properties
│   └── Navigation entre widgets/pages avec transitions
├── 🔄 MULTI-SÉLECTION AVANCÉE
│   ├── Sélection par rectangle (glisser zone)
│   ├── Sélection par type (Ctrl+clic = tous même type)
│   ├── Édition groupée (position, styles, propriétés)
│   └── Groupement/dégroupement de widgets
├── 🔒 PERMISSIONS & SÉCURITÉ (Phase 1)
│   ├── Permissions: editable, deletable, lockable, duplicable
│   ├── Verrouillage: protection par mot de passe optionnel
│   ├── Niveaux accès: public, restricted, private
│   └── Contrôle de modification par utilisateur
├── 👥 ÉDITION MULTI-COLLABORATEUR TEMPS RÉEL (Phase 1)
│   ├── Curseurs collaborateurs: position + nom utilisateur en temps réel
│   ├── Sélections simultanées: couleurs distinctes par utilisateur
│   ├── Édition concurrente: algorithme CRDT (horodatage + fusion LWW)
│   ├── Modèle de données: document JSON versionné par widget (id unique, propriétés, historique ops)
│   ├── Gestion hors ligne: file d'opérations locale + merge CRDT à la reconnexion
│   ├── Chat intégré: commentaires sur widgets + fil discussion
│   ├── Historique partagé: who/when/what pour chaque modification
│   ├── Permissions collaborateur: view, edit, admin par utilisateur
│   ├── Synchronisation WebSocket: mise à jour <50ms entre collaborateurs
│   ├── Gestion des versions: branches parallèles + merge
│   └── Notifications: entrées/sorties collaborateurs + modifications
├── ✓ VALIDATION & CONTRAINTES (Phase 1)
│   ├── Validation: required, minSize, maxSize
│   ├── Contraintes parent: allowedParents[], maxChildren
│   ├── Vérification intégrité hiérarchique
│   └── Messages d'erreur explicites
├── 🏷️ MÉTADONNÉES & SEO (Phase 1)
│   ├── SEO: title, description, keywords, author
│   ├── Versioning: version, lastModified, changelog
│   ├── Tracking: création, modification, utilisation
│   └── Export HTML optimisé SEO
├── ♿ ACCESSIBILITÉ WCAG 2.2 (Phase 2)
│   ├── Alt text: description images pour lecteurs écran
│   ├── ARIA: labels, roles, descriptions
│   ├── Navigation clavier: tabIndex, focus visible
│   ├── Contraste: vérification AA/AAA automatique
│   └── Audit accessibilité intégré
├── 🌐 INTERNATIONALISATION i18n (Phase 3)
│   ├── Langues supportées: fr, en, es, de, it
│   ├── Traductions: interface + contenu widgets
│   ├── RTL support: arabe, hébreu
│   └── Changement langue temps réel
├── 🔀 VERSIONING & BRANCHEMENT (Phase 2)
│   ├── Branches parallèles: main, develop, feature/nom-feature
│   ├── Merge automatique: résolution conflits + preview
│   ├── Tags versions: v1.0, v1.1 avec descriptions
│   ├── Compare versions: diff visuel side-by-side
│   ├── Rollback: retour version précédente en 1 clic
│   └── Archive projets: ZIP complet avec historique
├── 📱 PREVIEW MULTI-DEVICE (Phase 2)
│   ├── Simulateur intégré: iPhone, iPad, Android, Desktop
│   ├── Sizes réelles: pixels exacts des devices populaires
│   ├── Mode portrait/paysage: rotation automatique
│   ├── Tests responsive: breakpoints visuels
│   ├── Screenshot device: export PNG avec frame device
│   └── Mode présentation device: plein écran simulé
├── 💾 BACKUP & RÉCUPÉRATION (Phase 1)
│   ├── Auto-backup: sauvegarde toutes les 5min + manual
│   ├── Cloud sync: Dropbox, Google Drive, OneDrive optionnel
│   ├── Recovery mode: récupération après crash/panne
│   ├── Export projet: ZIP complet (editor + viewer + assets)
│   ├── Import projet: restauration complète depuis ZIP
│   └── Historique persistant: 30 jours minimum conservés
├── Conteneur Obligatoire (TOUS les widgets ont un conteneur)
├── Sync Temps Réel (editor↔viewer instantané)
├── Sauvegarde Auto (localStorage + JSON + historique)
├── Drag & Drop (glisser-déposer + contraintes parent)
└── Export (JSON widget + HTML statique + interactions + assets)
```

#### Exemple de séquence de modification simultanée
1. Alice et Bob ouvrent le widget **TexteAtomique#42**.
2. Alice change la propriété `texte` en « Promo A » et envoie l'opération A1 (ts=10).
3. Bob modifie la même propriété en « Promo B » et envoie l'opération B1 (ts=11).
4. Le serveur fusionne via CRDT LWW : B1 écrase A1 grâce à son horodatage plus récent.
5. Les deux clients reçoivent l'état final `texte = "Promo B"` ainsi que l'historique {A1, B1}.

