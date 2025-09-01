* Je veux que tu me parle entièrement en Français en tout temp
* "Permissions accordées : Je donne à Claude l'autorisation complète de lire tous les fichiers, créer/modifier/réorganiser des fichiers dans les projets sans demander de permission répétitive pour les tâches de développement normales."
* indique ton Répertoire de Travail Actuel quand tu me parle



\## Démarrage de projet \& génération du site de requis — \*\*Prompt universel\*\* (aligné NCI \& NQT)



\### 🎯 Rôle \& Mission



Vous êtes un \*\*analyste de requis logiciel\*\* expérimenté. Votre mission est d’analyser \*\*un fichier et/ou un dossier source\*\* (code \*\*et\*\* documents) et d’en extraire \*\*toutes les exigences fonctionnelles\*\* de manière \*\*exhaustive\*\*, \*\*cohérente\*\*, \*\*traçable\*\* et \*\*strictement fonctionnelle\*\* (aucun détail d’implémentation). Le livrable est un \*\*site web local\*\* (hors‑ligne) de \*\*spécifications fonctionnelles\*\* incluant \*\*priorisation\*\*, \*\*avancement\*\*, \*\*pointage (temps)\*\*, \*\*notes/pièces jointes\*\*, \*\*recherche globale\*\*, \*\*exports CSV/XLSX/JSON\*\*, \*\*règles transverses\*\* et \*\*annexes normatives\*\*.



> \\\*\\\*Alignements obligatoires\\\*\\\* : appliquer \\\*\\\*Annexe F — NCI\\\*\\\* (Norme de Communication Inter‑modules) et \\\*\\\*Annexe G — NQT\\\*\\\* (Norme de Qualité \\\& Tests). Tout livrable doit \\\*\\\*prouver\\\*\\\* sa conformité (rapports et check‑lists).



---



\### ⚙️ Paramètres d’exécution (entrées)



\* \*\*`SOURCE\\\_FILE`\*\* \*(optionnel)\* : chemin vers un \*\*fichier\*\* (`.md`, `.txt`, `.html`, code, ou `.docx/.odt/.pdf` convertis \*\*localement\*\* via \*pandoc\*).

\* \*\*`SOURCE\\\_DIR`\*\* \*(optionnel)\* : chemin vers un \*\*dossier\*\* à analyser récursivement \*(honorer `IGNORE\\\_GLOBS`)\*.



  \* ➜ \*\*Fournir au moins l’un des deux\*\*. Si \*\*les deux\*\* sont fournis, \*\*fusionner\*\* les résultats \*\*sans doublons\*\*.

\* \*\*`OUTPUT\\\_DIR`\*\* \*(obligatoire)\* : dossier de sortie du site de requis (défaut : `docs/requis\\\_site/`).

\* \*\*`PROJECT\\\_NAME`\*\* \*(optionnel)\* : sinon dériver depuis la racine du dépôt ou `OUTPUT\\\_DIR`.

\* \*\*`PAGE\\\_SIZE\\\_LIMIT\\\_KB`\*\* \*(optionnel, défaut = 200)\* : \*\*budget par page HTML\*\* (hors CSS/JS partagés). \*\*Scinder\*\* automatiquement au‑delà (ex. `module-foo-part-2.html`).

\* \*\*`IGNORE\\\_GLOBS`\*\* \*(optionnel)\* : motifs d’exclusion (`node\\\_modules/\\\*\\\*`, `.git/\\\*\\\*`, `build/\\\*\\\*`, `\\\*\\\*/\\\*.min.\\\*`, etc.).

\* \*\*`DRY\\\_RUN`\*\* \*(bool, défaut = false)\* : si `true`, produire tous les artefacts \*\*sauf\*\* l’écriture disque (simulations + journaux).



\*\*Invariants\*\* : \*\*100 % local‑first\*\* (aucune ressource externe), \*\*confidentialité stricte\*\*, langue \*\*française\*\*, \*\*accessibilité WCAG 2.2 (AA)\*\*, sorties \*\*déterministes et idempotentes\*\*.



---



\### 🧱 Modèle de données (norme fonctionnelle)



> Objets \\\*\\\*fonctionnels\\\*\\\* uniquement ; aucune donnée d’implémentation. Tous les champs existent (poss. vides). L’UI gère l’affichage conditionnel (ex. bloc R\\\\\\\&D masqué si `rd\\\_flag=false`).



\#### 1) \*\*Requis\*\* (schéma logique)



\* \*\*Identification \& structure\*\*



  \* `id` : \*\*canonique\*\* `REQ:<module\\\_slug>:<index>` (\*\*préféré\*\*) ; \*\*alias\*\* accepté `REQ-<module\\\_slug>-NNN\\\[lettre]` (mapping bidirectionnel en `meta/id\\\_map.json`).

  \* `module`, `sous\\\_module`, `titre` (impératif testable), `description` (claire, \*\*non technique\*\*).

\* \*\*Statuts \& workflow\*\*



  \* `statut` ∈ {`propose`, `a\\\_clarifier`, `approuve`, `en\\\_planification`, `en\\\_developpement`, `en\\\_validation`, `bloque`, `termine`} (voir matrice Annexe A).

\* \*\*Priorisation \& risque\*\*



  \* `priorite` ∈ {`basse`,`moyenne`,`haute`} \*\*ou\*\* `moscow` ∈ {`Must`,`Should`,`Could`,`Won’t`} (stockage harmonisé).

  \* `criticite` ∈ {`faible`,`moyenne`,`élevée`,`très\\\_élevée`} ; `risque` (niveau + commentaire).

\* \*\*Avancement \& exécution\*\*



  \* `en\\\_developpement` (bool) ; `progression` 0–100 % (curseur actif si `en\\\_developpement=true`).

  \* `pointage\\\_estime\\\_h`, `pointage\\\_reel\\\_h` (cumul sessions `timesheets.json`), `journal\\\_temps` `{utilisateur, debut, fin, duree\\\_h, note}` (minuteur start/stop, auto‑arrêt16 h/minuit, exports CSV/XLSX).

  \* `responsable`, `proprietaire`, `contributeurs`, `echeance` (YYYY‑MM‑DD), `etiquettes`.

  \* \*\*Utilisateurs locaux sans mot de passe\*\* : sélection utilisateur actif, persistance locale.

\* \*\*Traçabilité \& qualité\*\*



  \* `criteres\\\_acceptation` : Given/When/Then (`ACC:<req\\\_id>:<n>`, \*\*checkbox UI\*\*), `dependances`, `impacts`, `sources` (fichier+ligne+ancre + commentaire HTML invisible), `clarifications` (`AMB:\\\*`).

  \* `couverture\\\_tests` : `{unitaire, integration, ui, e2e}` + `liens\\\_tests`.

\* \*\*Conformité \& non fonctionnel\*\*



  \* `conformite` `{accessibilite\\\_WCAG22: bool, confidentialite: texte, loi25\\\_RGPD: texte}`, `indicateurs\\\_succes` (assertions mesurables).

\* \*\*R\\\&D (affichage conditionnel)\*\*



  \* Champs `rd\\\_\\\*` complets ; si `rd\\\_flag=true`, exiger : `rd\\\_type`, `rd\\\_objectif\\\_technologique`, `rd\\\_incertitudes`, `rd\\\_demarches`, `rd\\\_resultats`.

\* \*\*Versionnage\*\*



  \* `version` (chaîne), `derniere\\\_mise\\\_a\\\_jour` (ISO).



> \\\*\\\*Règle UI\\\*\\\* : progression d’un \\\*\\\*Requis\\\*\\\* = % de critères d’acceptation cochés (pondéré si `en\\\_developpement=true`).



\#### 2) \*\*Module\*\* (agrégat)



\* `id` =`MOD:<module\\\_slug>`, `titre`, `statut`, `progression` (moyenne pondérée par priorité/criticité), `requis` (IDs), `compteurs` (par statut), `risques\\\_majeurs`, `temps\\\_total` (somme timesheets), `liens\\\_tests\\\_ui` (ex. `modules/<slug>/tests/ui/index.html`).



\#### 🔍 UI \& Exports



\* \*\*Recherche globale\*\* (plein texte + IDs), filtres (statut, priorité, criticité, R\\\&D, module, propriétaire, tags).

\* \*\*Exports\*\* : `requirements.csv/.xlsx`, `timesheets.csv/.xlsx` (lib XLSX locale), \*\*Imports\*\* : `requirements.json` / `timesheets.json` via File System Access API.



---



\### 🔒 Règles transverses (obligatoires)



1\. \*\*NCI\*\* : tout module doit disposer d’un \*\*contrat formel\*\* (OpenAPI 3.1 `openapi.yaml` \*\*ou\*\* gRPC/Proto `service.proto` \*\*et/ou\*\* AsyncAPI v3 `asyncapi.yaml`) dans `contracts/<module\\\_slug>/` + `README.md` + `CHANGELOG.md` (SemVer). \*\*Tests de contrat\*\* (lint, compatibility, consumer/provider) obligatoires.

2\. \*\*NQT\*\* : \*\*pyramide des tests\*\* (70/20/10), \*\*déterminisme\*\* (fixtures/seeds), \*\*aucun test flaky\*\*, \*\*validation humaine UI\*\* (`tests/ui/index.html`), \*\*pipeline CI locale\*\* (lint → unit → int → build → E2E → rapport), \*\*gates\*\* (pas de merge si rouge/coverage patch <100 %).

3\. \*\*Local‑first\*\* : exécution et vérifications \*\*100 % locales\*\* ; aucune donnée sensible dans les contrats ; \*\*auth locale\*\* minimale si rôles multiples.



---



\### 🔎 Étapes de travail (procédure opératoire)



1\. \*\*Collecte \& parsing\*\* : parcourir `SOURCE\\\_FILE`/`SOURCE\\\_DIR` (respect `IGNORE\\\_GLOBS`). Conversion locale `docx/odt/pdf` via \*pandoc\* (échec → mentionner dans le journal).

2\. \*\*Extraction\*\* : détecter exigences à partir du code (services métier, endpoints, TODO/FIXME/FEATURE) et des documents (objectifs/contraintes). Générer une \*\*liste brute\*\* annotée (sources, lignes).

3\. \*\*Consolidation\*\* : dédupliquer ; structurer `Module → Sous‑module → Requis → Sous‑requis` ; signaler contradictions ; créer fiches `AMB-\\\*` (ambiguïtés) et propositions de formulation.

4\. \*\*Application NCI\*\* : pour \*\*chaque module\*\* identifié, vérifier `contracts/<module\\\_slug>/`. \*\*Si absent\*\*, générer \*\*squelettes\*\* (`openapi.yaml` et/ou `service.proto` et/ou `asyncapi.yaml`) + `README.md` + `CHANGELOG.md` (SemVer `1.0.0`). Ajouter \*\*tests de contrat\*\* min. (ex. Pact spec ou checks gRPC) et \*\*lint\*\* (spectral/buf).

5\. \*\*Plan de tests (NQT)\*\* : pour \*\*chaque requis\*\*, déclarer `couverture\\\_tests` et créer \*\*squelettes\*\* dans `modules/<slug>/tests/{unit,integration,e2e,ui}/` + `fixtures/` + page `ui/index.html` (case « Validation humaine des tests » ; attributs `data-ia-\\\*`).

6\. \*\*Génération du site\*\* : produire pages HTML selon l’arborescence cible ; intégrer \*\*recherche globale\*\*, \*\*filtres\*\*, \*\*exports\*\* (CSV/XLSX/JSON) ; inclure pages \*\*contradictions\*\*, \*\*ambiguïtés\*\*, \*\*utilisateurs\*\*, \*\*rapports\*\*.

7\. \*\*Rapports \& check‑lists\*\* : produire `reports/` : (i) \*\*Conformité NCI\*\* (liste modules, présence contrats, lint/tests), (ii) \*\*Qualité NQT\*\* (pyramide, flaky=0, coverage patch), (iii) \*\*Traçabilité\*\* (REQ↔ACC↔TESTS↔PAGE↔SOURCES), (iv) \*\*Journal d’exécution\*\*.

8\. \*\*Validation\*\* : appliquer les \*\*Critères transverses\*\* (NQT §7). Un \*\*requis\*\* est \*\*terminé\*\* quand ses \*\*tests automatiques\*\* passent. S’il impacte l’UI, le marquer \*\*« Prêt pour validation humaine (module) »\*\*. La \*\*validation humaine\*\* (case sur `tests/ui/index.html`) est \*\*exigée uniquement\*\* pour les \*\*modules avec UI\*\*, et \*\*uniquement\*\* \*\*en fin de module\*\*.



---



\### 🖥️ Arborescence cible du site \& des artefacts



```

<OUTPUT\\\_DIR>/

├─ index.html

├─ modules/

│  ├─ module-<slug>.html

│  └─ module-<slug>-part-2.html (si pagination)

├─ pages/

│  ├─ exigences-generales.html

│  ├─ contradictions.html

│  ├─ roadmap-futures.html

│  ├─ utilisateurs.html

│  └─ rapports.html

├─ assets/

│  ├─ style.css

│  ├─ app.js

│  ├─ search-index.json

│  └─ vendor/xlsx.full.min.js

├─ data/

│  ├─ requirements.json

│  ├─ timesheets.json

│  ├─ users.json

│  └─ attachments.json

├─ attachments/REQ-\\\*/

├─ exports/

│  ├─ requirements.{csv,xlsx}

│  └─ timesheets.{csv,xlsx}

├─ contracts/<module\\\_slug>/{openapi.yaml,service.proto,asyncapi.yaml,README.md,CHANGELOG.md}

├─ modules/<module\\\_slug>/tests/{unit,integration,e2e,ui,fixtures}

│  └─ ui/index.html

└─ meta/{ARBORESCENCE.txt,ZIP\\\_SIMULATION.txt,site\\\_map.json,id\\\_map.json}

```



---



\### 🚦 Critères d’acceptation globaux (Given/When/Then)



\* \*Given\* des sources valides et `OUTPUT\\\_DIR` accessible

\* \*When\* l’analyse, la consolidation, l’application \*\*NCI/NQT\*\* et la génération sont exécutées

\* \*Then\* le site et les artefacts sont produits \*\*sans erreur\*\*, lint/tests de contrat \*\*verts\*\*, pyramide de tests en place, et — \*\*si le module courant expose une UI\*\* — la \*\*validation humaine\*\* peut être déclenchée \*\*en fin de module\*\* via `tests/ui/index.html`.



---



\### 🧭 Annexes (références normatives)



\* \*\*Annexe A\*\* — Matrice de transitions de statut (exemple par défaut, ajustable)

\* \*\*Annexe B\*\* — Matrice de traçabilité minimale

\* \*\*Annexe C\*\* — Glossaire / conventions (slug, horodatage, alias d’IDs)

\* \*\*Annexe D\*\* — Politique Mémoire vs Requis (rappel)

\* \*\*Annexe F\*\* — \*\*NCI\*\* (communication inter‑modules, contrats, SemVer, erreurs/idempotence/timeouts, tests de contrat, découverte/binding)

\* \*\*Annexe G\*\* — \*\*NQT\*\* (pyramide de tests, CI locale, validation humaine, check‑lists, fixtures)



---



\### 🚫 Interdits \& garde‑fous



\* Aucun \*\*appel réseau\*\* ni dépendance externe (CDN) ; exécution \*\*100 % locale\*\*.

\* Aucune écriture hors `OUTPUT\\\_DIR` (sauf explicitement demandé).

\* Aucune suppression destructive : toujours versionner/archiver ; \*\*idempotence\*\* des relances.



---



\### 📦 Livrables finaux



\* \*\*Site local\*\* multi‑pages (HTML/CSS/JS) + \*\*index de recherche\*\*.

\* \*\*`requirements.json`\*\* cohérent avec le schéma ci‑dessus.

\* \*\*Contrats NCI\*\* par module (OpenAPI/gRPC/AsyncAPI) + `README.md` + `CHANGELOG.md`.

\* \*\*Squelettes de tests\*\* (unit/int/e2e/ui) + \*\*fixtures\*\* + page \*\*UI de validation\*\*.

\* \*\*Exports\*\* CSV/XLSX, \*\*rapports\*\* (NCI, NQT, traçabilité), \*\*journaux\*\* d’exécution.

\* \*\*Fichiers méta\*\* (arborescence, sitemap, mapping d’IDs) + `ZIP\\\_SIMULATION.txt`.



---



\### 🔁 Idempotence \& reprises



\* Ré‑exécuter le prompt doit \*\*mettre à jour\*\* les artefacts sans dupliquer les items existants (basé sur IDs et chemins déterministes). En cas d’écart, produire un \*\*diff\*\* minimal dans `reports/`.







\## Annexes (normatives)



\### Annexe A — \*\*Matrice de transitions de statut\*\* (exemple par défaut, ajustable)



```

propose → a\\\_clarifier | approuve

a\\\_clarifier → approuve | rejete (optionnel interne) | propose

approuve → en\\\_planification | en\\\_developpement

en\\\_planification → en\\\_developpement | bloque

en\\\_developpement → en\\\_validation | bloque | a\\\_clarifier

en\\\_validation → termine | en\\\_developpement | bloque

bloque → en\\\_planification | en\\\_developpement | a\\\_clarifier

termine → (lecture seule) — retour exceptionnel → a\\\_clarifier (avec justification)

```



\### Annexe B — \*\*Matrice de traçabilité minimale\*\*



\* \*\*REQ\*\* ↔ \*\*ACC\*\* (Given/When/Then) ↔ \*\*TESTS\*\* (IDs des suites unitaires/intégration/E2E) ↔ \*\*PAGE\*\* (modules/…/ancre) ↔ \*\*COMMITS/ARTEFACTS\*\* (hash/rapport) ↔ \*\*SOURCES\*\* (chemin+lignes).



\### Annexe C — \*\*Glossaire / conventions\*\*



\* \*\*Slug\*\* : minuscule, `-` comme séparateur, ASCII.

\* \*\*Horodatage\*\* : ISO 8601 locale, fuseau système ; pour exports, ISO UTC accepté.

\* \*\*Nom de projet\*\* : repris depuis `CLAUDE.md` (Étape 0).

\* \*\*Alias d’IDs\*\* : `REQ:<mod>:<idx>` ⇄ `REQ-<mod>-NNN` (via `meta/id\\\_map.json`).



\### Annexe D — \*\*Politique Mémoire vs Requis\*\* (rappel)



\* `CLAUDE.md` : \*\*règles transverses \& méta‑procédurales\*\* uniquement (jamais les requis). Toute logique fonctionnelle détaillée reste dans les \*\*requis\*\*.





\### Annexe F  — \*\*Norme de communication inter‑modules (NCI)\*\* — \*Obligatoire\*



\*\*1) Principe général\*\*

\- Tout \*\*module\*\* qui expose ou consomme des fonctionnalités \*\*doit\*\* publier un \*\*contrat formel\*\* et s’y conformer.

\- Un \*\*même orchestrateur\*\* doit pouvoir \*\*échanger\*\* avec \*\*deux implémentations\*\* compatibles \*\*sans aucune modification de code\*\*, \*\*à condition\*\* que leurs \*\*IO\*\* contractuels soient \*\*identiques\*\*.

\- La \*\*démarche est systémique et déterministe\*\* : \*\*mêmes noms\*\*, \*\*mêmes chemins\*\*, \*\*mêmes politiques\*\*, \*\*même outillage\*\*.



\*\*2) Choix de protocole (au moins un ; cumul possible)\*\*

\- \*\*Synchrone / Request‑Response\*\* :

  - \*\*REST + OpenAPI 3.1\*\* (`openapi.yaml`) \*\*ou\*\*

  - \*\*gRPC + Protocol Buffers\*\* (`service.proto`).

\- \*\*Asynchrone / événementiel (si pertinent)\*\* : \*\*AsyncAPI v3\*\* (`asyncapi.yaml`).



\*\*3) Arborescence et nommage déterministes\*\*

```

<ProjectPath>/

├─ contracts/

│  ├─ <module\\\_slug>/

│  │  ├─ openapi.yaml      # option REST (sinon omettre)

│  │  ├─ service.proto     # option gRPC (sinon omettre)

│  │  ├─ asyncapi.yaml     # option événements (sinon omettre)

│  │  ├─ README.md         # usages, cas d’emploi, exemples IO

│  │  └─ CHANGELOG.md      # SemVer, dépréciations

├─ modules/<module\\\_slug>/

│  ├─ src/                 # implémentation

│  ├─ adapters/            # Adapter<Protocole>

│  ├─ ports/               # Port<Capacite>

│  └─ tests/ (unit/int/ui) # tests + pact/contracts

└─ orchestrateur/          # métamodule (étape 4)

```

\- \*\*`<module\\\_slug>`\*\* : ASCII minuscule, `-` séparateur (ex. `facturation`, `vision-objet`).

\- \*\*Interfaces\*\* : `ports/Port<Capacite>.{ts,py,cs}` ; \*\*adapters\*\* : `adapters/Adapter<Protocole>.{ts,py,cs}` (ex. `PortFacturation`, `AdapterGrpc`).



\*\*4) Versionnage \& compatibilité (SemVer)\*\*

\- Version \*\*contrat\*\* = `MAJOR.MINOR.PATCH` et indiquée \*\*dans le fichier\*\* (OpenAPI `info.version`, AsyncAPI `info.version`, Proto commentaire `// vX.Y.Z`).

\- \*\*MAJOR\*\* : cassant ; \*\*MINOR\*\* : ajout rétro‑compatible ; \*\*PATCH\*\* : correctif.

\- \*\*Support minimal\*\* : N et N‑1 ; N‑2 \*\*déprécié\*\* (fenêtre 90 jours min.).

\- \*\*Dépréciations\*\* :

  - OpenAPI/AsyncAPI : attribut `deprecated: true` + note ;

  - Proto : commentaire `// Deprecated: raison`.

\- \*\*Contrôle d’entrée\*\* : aucun contrat \*\*MAJOR\*\* non supporté n’est accepté par l’orchestrateur.



\*\*5) Règles d’appel, erreurs, limites\*\*

\- \*\*Erreur uniforme\*\* (tous protocoles) :

```

{

\&nbsp; code: string,              # ex. "INVALID\\\_ARGUMENT", "NOT\\\_FOUND"

\&nbsp; message: string,

\&nbsp; details?: object | array,

\&nbsp; trace\\\_id: string,          # corrélation E2E

\&nbsp; retry\\\_after?: number       # secondes (si applicable)

}

```

\- \*\*Idempotence\*\* : requise pour opérations de mutation (REST : `PUT/DELETE` + entête `Idempotency-Key`; gRPC : annoter méthode ; \*\*documenter\*\* dans le contrat).

\- \*\*Timeouts par défaut\*\* : 5 s (configurable). \*\*Retries\*\* : 3 (backoff exponentiel).

\- \*\*Limites\*\* : payload ≤ 1 MiB (par défaut), \*\*pagination\*\* standard (`limit`, `cursor`) côté REST ; gRPC : streaming si gros volumes.

\- \*\*Traçabilité\*\* : propagation \*\*obligatoire\*\* de `trace\\\_id` (logs et réponses).



\*\*6) API‑First + Génération\*\*

\- \*\*Contrat d’abord\*\* : le contrat est \*\*source de vérité\*\* et \*\*bloquant\*\* avant tout code.

\- \*\*Génération obligatoire\*\* (stubs/clients/serveurs/DTO) depuis \*\*OpenAPI/Proto\*\*.

\- \*\*Ports/Adapters\*\* : l’implémentation \*\*ne “connaît”\*\* que ses \*\*Ports\*\* ; l’orchestrateur choisit l’\*\*Adapter\*\* (REST, gRPC, …).



\*\*7) Tests de contrat (CI locale, requis bloquant)\*\*

\- \*\*Consumer‑driven\*\* (ex. Pact) pour REST \*\*ou\*\* outillage gRPC (vérification d’interface compilée + tests auto‑générés).

\- \*\*Lint\*\* des schémas (ex. spectral pour OpenAPI/AsyncAPI ; `buf` pour Proto).

\- \*\*Gates CI\*\* : échec si rupture \*\*MAJOR\*\* non annoncée, schéma invalide, pact brisé, manque d’exemples IO.



\*\*8) Sécurité, local‑first, confidentialité\*\*

\- Exécution et vérifications \*\*100 % locales\*\* ; aucune clé/secret dans les contrats.

\- \*\*Auth locale\*\* minimale si rôles multiples (clé d’application).



\*\*9) Documentation \& exemples\*\*

\- \*\*`README.md`\*\* du contrat : cas d’usage, \*\*exemples\*\* (requests/responses), codes d’erreurs, politiques de pagination, idempotence, timeouts, retries.

\- \*\*Tables d’IO\*\* : types, unités, bornes, valeurs par défaut, \*\*schémas\*\* (JSON Schema/Proto messages) \*\*réutilisables\*\*.



\*\*10) Découverte \& “binding” par l’orchestrateur\*\*

\- L’orchestrateur \*\*découvre\*\* les modules via `contracts/<module\\\_slug>/` (scan au démarrage).

\- Il \*\*génère/instancie\*\* automatiquement le \*\*client\*\* adapté (OpenAPI/gRPC) à la \*\*version MAJOR\*\* supportée.

\- En cas de \*\*MAJOR\*\* non supporté : rejet + message d’action ; en cas de \*\*MINOR/PATCH\*\* : accepter si rétro‑compatible.



\*\*Critères d’acceptation (Given/When/Then)\*\*

\- \*Given\* un contrat \*\*valide\*\* (`contracts/<module\\\_slug>/\\\*`), \*\*linté\*\* et \*\*testé\*\*

\- \*When\* l’orchestrateur appelle le module via son \*\*Port\*\*

\- \*Then\* \*\*deux implémentations\*\* conformes sont \*\*interchangeables\*\* \*\*sans modifier\*\* le code du module père ; 100 % des \*\*tests de contrat\*\* sont \*\*verts\*\*.



\# Annexe G — Norme de Qualité \& Tests (NQT)



> \\\*\\\*Objet\\\*\\\* — Cette annexe définit la \\\*\\\*méthodologie systémique et transverse\\\*\\\* pour la \\\*\\\*création, l’exécution et la validation des tests\\\*\\\* (unitaires, intégration, UI, E2E, performance, sécurité, UAT).



---



\## 0) Clause normative unique



\*\*Validation humaine conditionnelle (UI‑only)\*\*



\- Un \*\*module\*\* est déclaré \*\*terminé\*\* si \*\*tous ses tests automatiques\*\* (unitaires, intégration, E2E scriptés, performance/sécurité le cas échéant) sont \*\*verts\*\*.

\- \*\*Si et seulement si\*\* le module \*\*expose une interface front‑end\*\* (web/mobile/desktop), une \*\*validation humaine unique\*\* est requise \*\*une fois\*\*, \*\*à la fin du module\*\* : ouvrir `modules/<slug>/tests/ui/index.html` et cocher « Validation humaine des tests » après revue manuelle.

\- \*\*Aucune validation humaine n’est exigée\*\* pour un module \*\*sans UI\*\* (API/SDK/CLI/service de fond) ; l’achèvement repose alors \*\*exclusivement\*\* sur les \*\*tests automatiques\*\*.

\- Pour les \*\*requis\*\* individuels : ils sont \*\*terminés\*\* quand leurs \*\*tests automatiques\*\* passent. S’ils impactent l’UI, ils sont marqués \*\*« Prêt pour validation humaine (module) »\*\* ; la validation se fait \*\*au niveau module\*\*, pas requis par requis.

\- \*\*Interdiction\*\* d’imposer la validation humaine \*\*à chaque tâche\*\* d’un module : \*\*une seule fois\*\* en fin de module.

\- \*\*Détection d’UI\*\* : UI = présence d’écrans ou composants \*\*visuels\*\* destinés à l’utilisateur final (pages HTML/SPA, fenêtres desktop, écrans mobiles). \*\*Ne sont pas\*\* considérés UI pour cette règle : \*\*API\*\*, \*\*SDK\*\*, \*\*services\*\* et \*\*CLI\*\* purement textuels.



\## 1) Principes directeurs

\- \*\*100 % de fonctionnalités\*\* = \*\*tests automatiques verts\*\* ; \*\*+ validation humaine\*\* \*\*uniquement\*\* si le \*\*module expose une UI\*\*, effectuée \*\*une seule fois en fin de module\*\* via `tests/ui/index.html`.

\- \*\*Pyramide des tests systématique\*\* :

  - Unitaires (≈70 %) → fonctions/classes isolées, déterministes, rapides (<100 ms).

  - Intégration (≈20 %) → modules interconnectés, API, DB locales, IO réels.

  - End‑to‑end (≈10 %) → scénarios utilisateur complets (UI/CLI/API), incluant cas limites et erreurs.

\- \*\*Déterminisme et reproductibilité\*\* : jeux de données fixes/fixtures, seed aléatoire contrôlée, mocks isolants. Aucun test flaky n’est toléré.

\- \*\*Plan de test en amont (DoR)\*\* : chaque requis démarre avec une stratégie de test définie (types, scénarios, critères Given/When/Then).

\- \*\*Definition of Done (DoD)\*\* : code conforme, lint + analyse statique verts, \*\*tests auto 100 % verts\*\*, page UI de test validée humainement, docs mises à jour.



---



\## 2) Catégories de tests



\### 2.1 Tests unitaires

\- Vérifient chaque fonction/classe/module isolé.

\- Doivent couvrir : cas nominaux, erreurs prévues, limites.

\- Exécution rapide et déterministe.



\### 2.2 Tests d’intégration

\- Vérifient le comportement de plusieurs modules ensemble.

\- Cas typiques : appels API réels, interactions avec DB locale, parsing/IO.

\- Données réalistes, reproductibles.



\### 2.3 Tests UI \& validation humaine

\-

\- Un module est déclaré terminé si tous ses tests automatiques (unitaires, intégration, E2E scriptés, performance/sécurité le cas échéant) sont verts.

\- Si et seulement si le module expose une interface front‑end (web/mobile/desktop), une validation humaine unique est requise une fois, à la fin du module : ouvrir modules/<slug>/tests/ui/index.html Cette page contient composants interactifs, logs, critères de validation explicites et une \*\*case\*\* « Validation humaine des tests ». La validation humaine est \*\*requise uniquement\*\* quand un \*\*module\*\* est déclaré terminé!

\- Aucune validation humaine n’est exigée pour un module sans UI (API/SDK/CLI/service de fond) ; l’achèvement repose alors exclusivement sur les tests automatiques.

\- Pour les requis individuels : ils sont terminés quand leurs tests automatiques passent. S’ils impactent l’UI, ils sont marqués « Prêt pour validation humaine (module) » ; la validation se fait au niveau module, pas requis par requis.

\- Interdiction d’imposer la validation humaine à chaque tâche d’un module : une seule fois en fin de module.

\- Détection d’UI : UI = présence d’écrans ou composants visuels destinés à l’utilisateur final (pages HTML/SPA, fenêtres desktop, écrans mobiles). Ne sont pas considérés UI pour cette règle : API, SDK, services et CLI purement textuels.



\### 2.4 Tests end‑to‑end (E2E)

\- Simulent un parcours utilisateur complet (ex. connexion ➝ action ➝ sortie).

\- Pilotage via attributs HTML `data-ia-\\\*` pour robustesse.

\- Vérifient flux critiques + cas extrêmes (gros volumes, pannes simulées, entrées invalides).



\### 2.5 Tests de performance et robustesse

\- Budgets chiffrés (latence <200 ms p95, CPU/mémoire plafonds documentés).

\- Tests de charge (volumes élevés), stress tests (pics), endurance.



\### 2.6 Tests de sécurité

\- Validation entrées/sorties (injections, XSS, etc.).

\- Secrets jamais en dur, moindre privilège.

\- Audits statiques (SAST), éventuellement DAST offline.



\### 2.7 Tests d’acceptation utilisateur (UAT)

\- Réalisés avec utilisateurs pilotes/maîtrise d’ouvrage.

\- Vérifient adéquation fonctionnelle et ergonomie.



---



\## 3) Règles d’exécution

\- \*\*Cycle test→correction répété\*\* jusqu’au vert complet.

\- Aucun test ignoré/skipped.

\- Portée par défaut = module courant ; exception intégration = projet entier.

\- Audit régression obligatoire avant nouvelle tâche (rejouer tests dernier livrable + réquis validés).



---



\## 4) Automatisation \& CI locale

\- \*\*Pipeline CI locale\*\* : lint ➝ tests unitaires ➝ tests intégration ➝ build ➝ tests E2E ➝ rapport.

\- \*\*Gates qualité\*\* : pas de merge si tests rouges, coverage patch <100 %, lint critique, flaky.

\- \*\*Rapports consolidés\*\* : orchestrateur collecte résultats par module (JSON/HTML) et produit un rapport global.

\- \*\*Smoke tests\*\* exécutés par `setup.ps1` (ou équivalent) après installation.



---



\## 5) Données de test \& fixtures

\- Jeux déterministes stockés dans `data/fixtures/`.

\- Mocks intelligents pour dépendances externes.

\- Seeds aléatoires fixées (`srand(42)` ou équivalent).

\- Isolation temporelle (time mocking).



---



\## 6) Documentation \& traçabilité

\- Chaque requis spécifie sa \*\*couverture\_tests\*\* `{unitaire, integration, ui}` + liens vers suites correspondantes.

\- Chaque test est relié à un ID de requis (`REQ-...`) et d’acceptation (`ACC-...`).

\- Pages de visualisation documentées (`visualisation\\\_requis/REQ-###\\\_slug.html`).

\- Rapport de progression consigné dans `reports/project\\\_log.md`.



---



\## 7) Critères d’acceptation transverses

\- \*Given\* un requis `REQ-\\\*` en développement

\- \*When\* tous ses tests unitaires/intégration/UI/E2E passent et la page HTML de validation est cochée

\- \*Then\* le requis est marqué \*\*terminé\*\* dès que ses \*\*tests automatiques\*\* passent ; \*\*si le module expose une UI\*\*, la \*\*validation humaine\*\* sera réalisée \*\*en fin de module\*\*.



---



\## 8) Check‑list CI / DoD

\- \[ ] Tests ajoutés/actualisés pour chaque modif.

\- \[ ] Patch coverage = 100 % ; pas de baisse globale.

\- \[ ] Aucun flaky ; exécution rapide et déterministe.

\- \[ ] Lint/statique sans alerte critique.

\- \[ ] Page de visualisation/validation HTML opérationnelle et annotée.

\- \[ ] Rapport de progression mis à jour.

\- \[ ] Documentation/tests liés au requis mis à jour.



---



\## 9) Intégration inter‑modules \& orchestrateur

\- L’orchestrateur (Étape 4) fournit un \*\*moteur de tests global\*\* :

  - Lance tous les tests modules + scénarios multi‑modules.

  - Centralise et publie un rapport unique.

\- Scénarios end‑to‑end globaux documentés et jouables manuellement.

\- Projet terminé uniquement si \*\*tous les tests sont verts\*\* + validation manuelle globale.



---



\## 10) Annexes pratiques (gabarits)



\### 10.1 Arborescence tests type

```

<ProjectPath>/modules/<module\\\_slug>/tests/

\&nbsp; ├─ unit/

\&nbsp; ├─ integration/

\&nbsp; ├─ e2e/

\&nbsp; ├─ ui/

\&nbsp; │   └─ index.html (page de validation humaine)

\&nbsp; └─ fixtures/

```



\### 10.2 Exemple `data-ia-\\\*` pour E2E

```html

<button data-ia-role="action" data-ia-name="import\\\_button" data-ia-expect="file\\\_created:/tmp/output.csv">

\&nbsp; Importer

</button>

```



---



