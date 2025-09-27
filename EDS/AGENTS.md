# Guide du dépôt

## Structure du projet
- `presentation_Golf/`: présentation et ressources.
  - `presentation_golf.html`: point d’entrée (ouvrir dans un navigateur).
  - `images/`, `flags/`, `musique/`: médias utilisés par la présentation.
  - `data_clean.csv`, `data_en_clean.csv`, `formulas.csv`, `variables.csv`: données tabulaires consommées par les slides.

## Commandes locales (build/test/dev)
- Servir localement (Python): `python -m http.server 8000` puis ouvrir `http://localhost:8000/presentation_Golf/presentation_golf.html`.
- Servir localement (Node): `npx serve presentation_Golf` puis ouvrir l’URL affichée.
- Aucun build requis: projet statique; recharger la page suffit après modification.
- Lancer les tests: `python tests/smoke_test.py` (tests de fumée hors réseau).
- Lancer tous les tests (Windows/PowerShell): `./scripts/run_tests.ps1`.
- Valider les liens HTML: `python tests/validate_links.py`.

## Style de code et conventions
- Langue du code: identifiants, API et noms de fichiers en anglais; documentation, commentaires, commits et PRs en français.
- HTML/CSS/JS: indentation 2 espaces; limiter les scripts/styles inline; privilégier des fichiers externes.
- Nommage fichiers: minuscules avec tirets (ex.: `course-overview.png`); placer les assets dans `images/`, `flags/`, `musique/`.
- CSV: UTF-8, en-têtes stables; toute nouvelle colonne est documentée (but, format) en tête de fichier.

## Tests
- Vérifications manuelles: ouvrir l’HTML, contrôler le chargement des médias, la navigation des slides et l’absence d’erreurs console.
- Données: valider l’intégrité des CSV (types, délimiteur, formats numériques/dates).
- Visuel: contrôler un affichage desktop courant et un viewport mobile.

## Commits et Pull Requests
- Commits: courts, à l’impératif (historique majoritairement en français). Un changement par commit.
- Branches: une fonctionnalité par branche (`feat/…`, `fix/…`, `chore/…`).
- PRs: description brève, liste des changements notables, captures d’écran pour les impacts visuels, et mention des mises à jour de données.

## Sécurité, exécution et exigences agents
- Exécution 100% autonome (standalone): aucune dépendance réseau à l’exécution (pas d’API/CDN/téléchargements). Tout asset est local.
- Interdictions: pas de valeurs en dur (hardcodage) ni de données simulées en production. Externaliser la configuration dans des fichiers locaux versionnés (ou modèles `*.example`). Isoler les données de test dans un dossier dédié non consommé en production.
- Bonnes pratiques: principes SOLID/DRY/KISS, POO pertinente, composants faiblement couplés et extensibles, gestion d’erreurs explicite.
- Clean code: petites fonctions à responsabilité unique; docstrings/commentaires obligatoires en français et à jour.
- Médias: pas de fichiers volumineux inutiles; optimiser PNG/JPEG/WebP; chemins relatifs stables.

## Modèles (PR et Docstrings)
- Modèle PR: utiliser `.github/pull_request_template.md` (voir cases à cocher obligatoires).
- Docstring (ex. Python):
  ```python
  def compute_score(values: list[float]) -> float:
      """Calcule la moyenne pondérée.

      Paramètres:
          values: Liste de valeurs numériques.

      Retourne:
          Moyenne pondérée sous forme de flottant.
      """
      ...
  ```
- JavaScript: employer JSDoc en français au-dessus d’identifiants en anglais (ex.: `/** Calcule la moyenne… */`).
- Modèle de configuration: `config.example.json` (copier en `config.json` pour un usage local sans hardcodage).
