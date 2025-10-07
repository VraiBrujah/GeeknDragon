# 📝 Changelog - Visualiseur de Manuscrits

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

---

## [1.1.0] - 2025-10-07

### 🔒 Sécurité - FIX CSP Hostpapa

#### Corrigé
- **Erreur CSP critique** : Migration de marked.js depuis CDN vers version locale
  - ❌ Avant : `https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js` (bloqué par CSP)
  - ✅ Après : `assets/js/marked.min.js` (35 KB, local)
  - Raison : CSP stricte d'Hostpapa n'autorise que `script-src 'self'`

#### Ajouté
- **marked.min.js local** : Téléchargé depuis jsdelivr et stocké localement
- **Cache-busting filemtime()** : `?v=<?= filemtime() ?>` pour forcer MAJ navigateur
- **Documentation CSP** : Nouveau fichier `NOTES_CSP.md`
- **Guide déploiement** : Nouveau fichier `DEPLOIEMENT.md` avec checklist complète

#### Modifié
- `index.php` : Suppression chargement CDN + fallback scripts
- `README.md` : Mise à jour section dépannage (marked.js local)
- `GUIDE_RAPIDE.md` : Ajout note CSP résolue
- `ARCHITECTURE.md` : Documentation stack technique (CSP-compliant)

#### Performance
- ✅ Compatibilité CSP stricte garantie
- ✅ Aucune dépendance externe
- ✅ Fonctionne 100% offline

---

## [1.0.0] - 2025-10-06

### 🎉 Release Initiale

#### Ajouté - Fonctionnalités Principales

- **Détection automatique des livres** : Scan dynamique du dossier `Livre/`
- **Navigation par onglets** : Interface multi-livres intuitive
- **Chapitres ordonnés** : Tri automatique par numéro (00_, 01_, 02_...)
- **Ancres de navigation** : Table des matières interactive avec scroll fluide
- **Mémorisation position** : localStorage conserve livre/chapitre/scroll
- **Mode sombre élégant** : Design optimisé pour lecture prolongée
- **Parsing Markdown complet** : Titres, emphases, citations, listes via marked.js
- **Responsive design** : Adapté desktop, tablette, mobile

#### Ajouté - Backend & API

- **API REST sécurisée** (`api.php`)
  - `GET ?action=list` : Liste tous les livres
  - `GET ?action=book&name=X` : Chapitres d'un livre
  - `GET ?action=chapter&book=X&file=Y` : Contenu d'un chapitre
  - Validation stricte (sanitizeName, protection path traversal)
  - Headers sécurisés (X-Content-Type-Options, X-Frame-Options)

#### Ajouté - Frontend

- **index.php** : Structure HTML5 sémantique
- **viewer.css** (11 KB) : Styles CSS autonomes avec variables personnalisables
- **viewer.js** (13 KB) : Logique client complète (classe ManuscritsViewer)
  - Fetch API asynchrone
  - Gestion événements (scroll, navigation, mémorisation)
  - Parsing markdown avec marked.js
  - Détection chapitre visible

#### Ajouté - Configuration

- **.htaccess** : Configuration Apache (sécurité, compression, cache)
- **.gitignore** : Exclusions Git (brouillons, fichiers temporaires)

#### Ajouté - Documentation

- **README.md** (15 KB) : Documentation technique complète
- **GUIDE_RAPIDE.md** (8 KB) : Guide utilisateur 3 étapes
- **ACCES.md** (5 KB) : URLs d'accès et tests
- **ARCHITECTURE.md** (25 KB) : Architecture technique détaillée

#### Sécurité

- ✅ Validation stricte des entrées utilisateur
- ✅ Protection path traversal (`../` bloqué)
- ✅ Extension `.md` forcée
- ✅ Échappement HTML (protection XSS)
- ✅ Headers sécurisés HTTP
- ✅ Pas de robots (`noindex, nofollow`)
- ✅ Données 100% locales (aucune fuite)

#### Performance

- ✅ Debouncing scroll (100ms)
- ✅ Sauvegarde périodique (5s + beforeunload)
- ✅ Cache-busting automatique
- ✅ Compression Gzip activée
- ✅ Total assets : ~59 KB (très léger)

#### Tests

- ✅ API fonctionnelle (tests PHP CLI)
- ✅ Détection multi-livres validée
- ✅ Parsing markdown opérationnel
- ✅ Responsive desktop/mobile testé

---

## Structure des Versions

Le projet suit le [Semantic Versioning](https://semver.org/) :

- **MAJOR** : Changements incompatibles (breaking changes)
- **MINOR** : Nouvelles fonctionnalités rétro-compatibles
- **PATCH** : Corrections de bugs rétro-compatibles

---

## Roadmap Future

### [1.2.0] - Prévu

- [ ] **Recherche plein texte** : Recherche dans tous les manuscrits
- [ ] **Export PDF** : Génération PDF d'un livre complet
- [ ] **Mode clair** : Basculement clair/sombre
- [ ] **Support images** : Affichage images dans chapitres

### [1.3.0] - Considéré

- [ ] **Annotations** : Commentaires et notes personnelles
- [ ] **Bookmarks** : Marque-pages multiples
- [ ] **Statistiques** : Temps de lecture, progression
- [ ] **Audio** : Lecture text-to-speech

---

## Support & Contributions

- **Issues** : Rapporter bugs via système de tickets
- **Documentation** : Consulter `README.md` et `GUIDE_RAPIDE.md`
- **Contact** : Brujah - Geek & Dragon

---

**Répertoire** : `E:\GitHub\GeeknDragon\Livre`
**Dernière mise à jour** : 2025-10-07
