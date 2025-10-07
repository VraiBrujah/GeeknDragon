# L'Éveil de l'Étoile Pourpre — Dépôt éditorial

## Présentation

Ce dépôt contient le manuscrit et la documentation éditoriale du roman « L'Éveil de l'Étoile Pourpre ».

Il ne contient pas (à ce jour) de pipeline de build/exports (HTML/PDF). Le dépôt sert principalement à organiser :
- le texte canonique (répertoire `Livre/`),
- les chapitres/drafts d’inspiration (`Inspiration/`),
- les brouillons (`Brouillon/`),
- la documentation éditoriale structurée (`docs/`).

## Arborescence (état actuel)

- `Livre/` : contenu canonique (prologue et documents d’univers)
- `Inspiration/` : chapitres 01→31 (versions d’inspiration)
- `Brouillon/` : brouillons (V1, V2, etc.)
- `docs/` : documentation éditoriale regroupée
  - `docs/audits/` : audits et rapports d’audit
  - `docs/guides/` : guides, conventions, exemples et matrices
  - `docs/projet/` : documents de pilotage (plan, stats, synopsis, canevas)
- `update_symbols.py` : script utilitaire (voir ci‑dessous)

## Scripts

- `update_symbols.py` : met à jour les symboles de dialogue dans `Livre/FICHES_REFERENCE_CANON.md` et `Livre/personnages.md`.
  - Usage (exemple) : `python update_symbols.py`

## Ce qui n’est pas inclus (actuellement)

- Pas de scripts de compilation/export (`build.sh`, `build.bat`, Pandoc/WeasyPrint, etc.)
- Pas de répertoire `exports/` ni `templates/`.

Si un pipeline de génération est souhaité plus tard, il pourra être ajouté dans `scripts/` avec une documentation dédiée.

## Processus éditorial (suggestion)

1) Rédaction et révisions dans `Inspiration/` → validation → passage en canon dans `Livre/`.
2) Documentation, décisions et audits centralisés dans `docs/`.
3) Script(s) utilitaires optionnels dans `scripts/` (à créer si besoin).

## Conventions

- Encodage UTF‑8, typographie française.
- Nom des fichiers lisible, accents autorisés (peuvent être normalisés si besoin multi‑plateforme).

## Licence / Contributions

Merci de vérifier avec l’auteur avant toute diffusion publique. Les contributions se font via PR en respectant les guides dans `docs/`.

