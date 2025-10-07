# 🏗️ Architecture Technique du Visualiseur

## Vue d'Ensemble

Le visualiseur de manuscrits est une **application web autonome** construite selon une architecture **client-serveur simple** avec les principes suivants :

- ✅ **Autonomie complète** : Fonctionne indépendamment du site principal
- ✅ **Sécurité by design** : Validation stricte, pas de fuite de données
- ✅ **Performance optimale** : Cache localStorage, parsing asynchrone
- ✅ **Responsive** : Adapté desktop, tablette, mobile
- ✅ **Accessibilité** : Navigation clavier, ARIA labels

---

## 📊 Architecture en Couches

```
┌─────────────────────────────────────────┐
│         COUCHE PRÉSENTATION             │
│  (HTML + CSS + JavaScript Client)       │
│                                          │
│  • index.php (Structure HTML)           │
│  • viewer.css (Styles mode sombre)      │
│  • viewer.js (Logique client)           │
│  • marked.js (Parser Markdown)          │
└────────────────┬────────────────────────┘
                 │ HTTP GET
                 ▼
┌─────────────────────────────────────────┐
│         COUCHE API REST                  │
│        (Backend PHP)                     │
│                                          │
│  • api.php                               │
│    - GET ?action=list                    │
│    - GET ?action=book&name=X             │
│    - GET ?action=chapter&book=X&file=Y   │
└────────────────┬────────────────────────┘
                 │ File System
                 ▼
┌─────────────────────────────────────────┐
│         COUCHE DONNÉES                   │
│      (Fichiers .md statiques)            │
│                                          │
│  • Livre/[NomLivre]/NN_chapitre.md      │
└─────────────────────────────────────────┘
```

---

## 🔧 Composants Principaux

### 1. **index.php** (Point d'entrée)

**Rôle** : Structure HTML de la page avec zones dynamiques

**Zones clés** :
- `#bookTabs` : Conteneur onglets de navigation entre livres
- `#chaptersNav` : Sidebar navigation chapitres
- `#manuscritContent` : Zone d'affichage du contenu markdown parsé
- `#scrollToTop` : Bouton retour en haut

**Technologies** :
- HTML5 sémantique
- PHP pour cache-busting (`?v=<?= time() ?>`)
- Chargement CDN marked.js avec fallback

---

### 2. **api.php** (Backend REST)

**Rôle** : API REST sécurisée pour accès aux manuscrits

#### Endpoints

##### `GET ?action=list`
**Fonction** : Liste tous les livres disponibles

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "name": "Eveil",
      "slug": "eveil",
      "chaptersCount": 2,
      "chapters": [...]
    }
  ]
}
```

##### `GET ?action=book&name={NomLivre}`
**Fonction** : Liste chapitres d'un livre

**Paramètres** :
- `name` : Nom exact du dossier du livre

**Réponse** :
```json
{
  "success": true,
  "data": {
    "name": "Eveil",
    "chapters": [
      {
        "file": "00_prologue.md",
        "order": 0,
        "title": "Prologue",
        "slug": "chapitre-0",
        "size": 38954
      }
    ]
  }
}
```

##### `GET ?action=chapter&book={Livre}&file={Fichier.md}`
**Fonction** : Récupère contenu brut d'un chapitre

**Paramètres** :
- `book` : Nom du livre
- `file` : Nom du fichier markdown

**Réponse** :
```json
{
  "success": true,
  "data": {
    "book": "Eveil",
    "file": "00_prologue.md",
    "content": "# Titre\n\nContenu markdown...",
    "size": 38954
  }
}
```

#### Sécurité

- ✅ **Validation stricte** : `sanitizeName()` nettoie les entrées
- ✅ **Protection path traversal** : Détection de `../`, `/`, `\`
- ✅ **Extension forcée** : Seuls les `.md` sont autorisés
- ✅ **Headers sécurisés** : `X-Content-Type-Options`, `X-Frame-Options`
- ✅ **Gestion erreurs** : Try-catch avec messages explicites

---

### 3. **viewer.js** (Logique Client)

**Rôle** : Orchestration complète côté client

#### Classe `ManuscritsViewer`

**Méthodes principales** :

```javascript
class ManuscritsViewer {
  constructor()           // Initialisation
  init()                  // Configuration marked.js + chargement livres
  loadBooks()             // Fetch API liste livres
  renderBookTabs()        // Génère onglets navigation
  switchBook(slug)        // Change livre affiché
  loadBookChapters(book)  // Charge tous chapitres d'un livre
  renderChaptersNav()     // Génère navigation sidebar
  loadAllChapters()       // Fetch + parse tous chapitres
  renderChapter()         // Affiche chapitre parsé
  scrollToChapter(slug)   // Scroll fluide vers chapitre
  saveReadingPosition()   // Sauvegarde en localStorage
  restoreReadingPosition()// Restaure dernière lecture
  handleScroll()          // Détecte chapitre visible + bouton top
}
```

#### Fonctionnalités Clés

**Navigation** :
- Détection automatique des livres via API
- Génération dynamique des onglets et ancres
- Scroll fluide avec `scrollIntoView({ behavior: 'smooth' })`

**Mémorisation** :
```javascript
// Structure sauvegardée
{
  bookSlug: "eveil",
  chapterSlug: "chapitre-0",
  scrollY: 1234,
  timestamp: 1696611234567
}
```

**Performance** :
- Debouncing du scroll (100ms)
- Sauvegarde périodique (5s)
- Sauvegarde avant fermeture (beforeunload)

---

### 4. **viewer.css** (Styles Autonomes)

**Rôle** : Design mode sombre optimisé lecture

#### Variables CSS Personnalisables

```css
:root {
  /* Couleurs */
  --couleur-fond-principal: #0f0f0f;
  --couleur-accent: #DAA520;
  --couleur-bordure-active: #8B0000;

  /* Typographie */
  --police-titre: 'Cinzel', 'Georgia', serif;
  --police-texte: 'Georgia', 'Times New Roman', serif;
  --taille-texte-lecture: clamp(1.05rem, 2vw, 1.15rem);
  --hauteur-ligne-texte: 1.8;

  /* Largeurs */
  --largeur-contenu-max: 800px;
  --largeur-nav-chapitres: 280px;
}
```

#### Responsive Breakpoints

```css
/* Desktop : > 1024px */
.manuscrits-chapters-nav { position: sticky; }

/* Tablette : 768-1024px */
.manuscrits-chapters-nav { width: 220px; }

/* Mobile : < 768px */
.manuscrits-chapters-nav {
  position: fixed;
  transform: translateX(-100%);
}
.manuscrits-chapters-nav.open {
  transform: translateX(0);
}
```

---

## 🔄 Flux de Données

### Chargement Initial

```
1. Utilisateur ouvre index.php
   ↓
2. viewer.js → fetch('api.php?action=list')
   ↓
3. api.php → scandir('Livre/') → liste dossiers
   ↓
4. Retour JSON → renderBookTabs()
   ↓
5. Sélection livre (via restoreReadingPosition ou premier)
   ↓
6. fetch('api.php?action=book&name=X')
   ↓
7. Retour chapitres → renderChaptersNav()
   ↓
8. Pour chaque chapitre:
   fetch('api.php?action=chapter&book=X&file=Y.md')
   ↓
9. marked.parse(content) → renderChapter()
   ↓
10. Restauration scroll position
```

### Changement de Livre

```
1. Clic onglet → switchBook(slug)
   ↓
2. Mise à jour onglet actif
   ↓
3. loadBookChapters(book)
   ↓
4. Chargement tous chapitres (étapes 6-9 ci-dessus)
   ↓
5. saveReadingPosition()
```

### Navigation Chapitre

```
1. Clic lien sidebar → scrollToChapter(slug)
   ↓
2. element.scrollIntoView({ behavior: 'smooth' })
   ↓
3. updateActiveChapter(slug)
   ↓
4. saveReadingPosition()
```

---

## 💾 Persistance des Données

### localStorage

**Clé** : `manuscrits_reading_position`

**Valeur** :
```json
{
  "bookSlug": "eveil",
  "chapterSlug": "chapitre-0",
  "scrollY": 1234,
  "timestamp": 1696611234567
}
```

**Durée** : Permanente (jusqu'à effacement manuel ou navigateur)

**Gestion** :
- Sauvegarde toutes les 5 secondes (si position changée)
- Sauvegarde avant fermeture (event `beforeunload`)
- Restauration au chargement suivant

---

## 🔒 Sécurité

### Validation Entrées (api.php)

```php
function sanitizeName(string $name): ?string
{
    // Protection path traversal
    if (str_contains($name, '..') ||
        str_contains($name, '/') ||
        str_contains($name, '\\')) {
        return null;
    }

    // Whitelist caractères autorisés
    $clean = preg_replace(
        '/[^a-zA-Z0-9_\-\s.éèêëàâäôöùûüçÉÈÊËÀÂÄÔÖÙÛÜÇ]/u',
        '',
        $name
    );

    return empty($clean) ? null : $clean;
}
```

### Protection XSS (viewer.js)

```javascript
escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text; // Échappe automatiquement
  return div.innerHTML;
}
```

### Headers HTTP (.htaccess)

```apache
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "no-referrer-when-downgrade"
```

---

## 📈 Performance

### Optimisations

1. **Cache-busting** : `?v=<?= time() ?>` sur CSS/JS
2. **Compression Gzip** : `.htaccess` active deflate
3. **Debouncing scroll** : 100ms pour éviter surcharge
4. **Parsing asynchrone** : `async/await` pour chargement chapitres
5. **localStorage** : Évite rechargement complet à chaque visite

### Métriques Cibles

- **Chargement initial** : < 500ms
- **Parsing markdown** : < 100ms par chapitre
- **Scroll fluide** : 60 FPS
- **Taille page** : < 50 KB (HTML + CSS + JS minifiés)

---

## 🧪 Tests

### Tests Manuels

```bash
# Test API liste livres
curl http://localhost/GeeknDragon/Livre/api.php?action=list

# Test API chapitres
curl "http://localhost/GeeknDragon/Livre/api.php?action=book&name=Eveil"

# Test API contenu
curl "http://localhost/GeeknDragon/Livre/api.php?action=chapter&book=Eveil&file=00_prologue.md"
```

### Tests Navigateur

1. **Console F12** : Vérifier absence d'erreurs
2. **Network** : Vérifier requêtes API (200 OK)
3. **localStorage** : Vérifier sauvegarde position
4. **Responsive** : Tester mobile (Ctrl+Shift+M)

---

## 🔮 Extensions Futures Possibles

- [ ] **Search** : Recherche plein texte dans tous manuscrits
- [ ] **Export PDF** : Génération PDF d'un livre complet
- [ ] **Annotations** : Commentaires et notes personnelles
- [ ] **Bookmarks** : Marque-pages multiples
- [ ] **Stats** : Temps de lecture, progression, mots lus
- [ ] **Mode clair** : Basculement clair/sombre
- [ ] **Images** : Support images dans chapitres
- [ ] **Audio** : Lecture audio text-to-speech

---

## 📚 Stack Technologique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | HTML5, CSS3 (Variables, Grid, Flexbox), JavaScript ES6+ |
| **Backend** | PHP 8.1+ (strict types, typed properties) |
| **Parser** | marked.js 11.0.0 |
| **Serveur** | Apache 2.4+ (mod_rewrite, mod_deflate, mod_headers) |
| **Storage** | localStorage (Web Storage API) |
| **HTTP** | REST API (JSON) |

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-10-06
**Répertoire** : `E:\GitHub\GeeknDragon\Livre`
