# L-veil-de-l-toile-Pourpre

## Présentation

Ce dépôt héberge le roman *L'Éveil de l'Étoile Pourpre* ainsi que les
scripts permettant de rassembler les chapitres et de produire des
versions prêtes à la diffusion (HTML, PDF, Markdown, etc.).

## Organisation du dépôt

- `Livre/` : chapitres sources au format Markdown.
- `exports/` : fichiers générés après compilation.
- `templates/` : gabarits et ressources de mise en page.
- Scripts Python : `generer_livre_professionnel.py`,
  `generer_pdf_final.py`, `generer_pdf_simple.py`.

## Dépendances

- Python 3.8 ou supérieur.
- [Pandoc](https://pandoc.org) pour la conversion des formats.
- [WeasyPrint](https://weasyprint.org) (optionnel) pour la génération
  automatique de PDF.
- Un environnement LaTeX (ex. MiKTeX) peut être nécessaire pour les
  exports PDF avancés.

## Génération

Les principales commandes de génération sont résumées ci‑dessous ;
consultez [README_GENERATION.md](README_GENERATION.md) pour des
instructions détaillées.

- **Windows** : `build.bat`
- **Linux/Mac** : `chmod +x build.sh` puis `./build.sh`
- **Python** : `python build_livre.py` ou `python build_livre.py --format <format>`

## Tests

Des tests `pytest` vérifient la génération des fichiers HTML, PDF et du fichier de statistiques à partir d'un jeu de chapitres minimal. Pour les exécuter :

```bash
pytest
```

