#!/usr/bin/env python3
"""
Générateur de livre CARNIVAUTE Professional
==========================================

Générateur dédié avec rendu HTML professionnel et génération PDF directe.
Spécialement conçu pour le livre Carnivaute avec mise en page optimisée.
"""

import os
import sys
import re
from pathlib import Path
import yaml
import markdown
from datetime import datetime

# Import conditionnel pour WeasyPrint
try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    print("WeasyPrint non disponible - génération PDF désactivée")

class CarnivaUteGenerator:
    """Générateur professionnel pour le livre CarnivaUte."""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.config = None
        self.contenu_sections = []
        self.stats = {
            'sections_collectees': 0,
            'recettes_trouvees': 0,
            'tableaux_securite': 0,
            'encadres_saviezvous': 0,
            'taille_contenu': 0
        }
    
    def lire_configuration(self):
        """Charge la configuration YAML."""
        config_path = self.base_path / "carnivaute_config.yaml"
        if not config_path.exists():
            raise FileNotFoundError(f"Configuration non trouvée: {config_path}")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)
        
        # Extraction des métadonnées du livre
        self.livre_config = self.config.get('livre', self.config)
        print(f"Configuration chargée: {self.livre_config['titre']}")
    
    def collecter_contenu_manuscrit(self):
        """Collecte et organise tout le contenu du manuscrit."""
        manuscript_dir = self.base_path / "manuscript"
        if not manuscript_dir.exists():
            raise FileNotFoundError(f"Dossier manuscrit non trouvé: {manuscript_dir}")
        
        self.contenu_sections = []
        
        print("\nCollecte du contenu:")
        
        # 1. Introduction
        intro_path = manuscript_dir / "chapitres" / "01_introduction.md"
        if intro_path.exists():
            contenu = self._lire_fichier_markdown(intro_path)
            self.contenu_sections.append({
                'type': 'introduction',
                'titre': 'Introduction',
                'contenu': contenu,
                'fichier': intro_path.name
            })
            print(f"  Introduction ajoutée")
        
        # 2. Chapitres techniques spécialisés
        chapitres_dir = manuscript_dir / "chapitres"
        for chapitre_file in sorted(chapitres_dir.glob("*.md")):
            if chapitre_file.name != "01_introduction.md" and chapitre_file.name != "99_conclusion.md":
                contenu = self._lire_fichier_markdown(chapitre_file)
                titre = self._extraire_titre_principal(contenu)
                self.contenu_sections.append({
                    'type': 'chapitre_technique',
                    'titre': titre or chapitre_file.stem,
                    'contenu': contenu,
                    'fichier': chapitre_file.name
                })
                print(f"  {chapitre_file.name}")
        
        # 3. Sections de recettes
        recettes_dir = manuscript_dir / "recettes"
        for section_file in sorted(recettes_dir.glob("section_*.md")):
            contenu = self._lire_fichier_markdown(section_file)
            titre = self._extraire_titre_principal(contenu)
            nb_recettes = len(re.findall(r'^## [^#]', contenu, re.MULTILINE))
            self.stats['recettes_trouvees'] += nb_recettes
            
            self.contenu_sections.append({
                'type': 'section_recettes',
                'titre': titre or section_file.stem,
                'contenu': contenu,
                'fichier': section_file.name,
                'nb_recettes': nb_recettes
            })
            print(f"  {section_file.name} ({nb_recettes} recettes)")
        
        # 4. Annexes
        annexes_dir = manuscript_dir / "annexes"
        if annexes_dir.exists():
            for annexe_file in sorted(annexes_dir.glob("*.md")):
                contenu = self._lire_fichier_markdown(annexe_file)
                titre = self._extraire_titre_principal(contenu)
                self.contenu_sections.append({
                    'type': 'annexe',
                    'titre': titre or annexe_file.stem,
                    'contenu': contenu,
                    'fichier': annexe_file.name
                })
                print(f"  {annexe_file.name}")
        
        # 5. Conclusion
        conclu_path = manuscript_dir / "chapitres" / "99_conclusion.md"
        if conclu_path.exists():
            contenu = self._lire_fichier_markdown(conclu_path)
            self.contenu_sections.append({
                'type': 'conclusion',
                'titre': 'Conclusion',
                'contenu': contenu,
                'fichier': conclu_path.name
            })
            print(f"  Conclusion ajoutée")
        
        self.stats['sections_collectees'] = len(self.contenu_sections)
        print(f"\n{self.stats['sections_collectees']} sections collectées")
    
    def _lire_fichier_markdown(self, filepath):
        """Lit un fichier Markdown avec gestion des erreurs."""
        with open(filepath, 'r', encoding='utf-8') as f:
            contenu = f.read()
            self.stats['taille_contenu'] += len(contenu)
            
            # Comptage des éléments spéciaux Carnivaute
            self.stats['tableaux_securite'] += len(re.findall(r'\| France/UE \| USA \|', contenu))
            self.stats['encadres_saviezvous'] += len(re.findall(r'🔬 \*\*Le saviez-vous', contenu))
            
            return contenu
    
    def _extraire_titre_principal(self, contenu):
        """Extrait le premier titre principal du contenu."""
        match = re.search(r'^# (.+)$', contenu, re.MULTILINE)
        return match.group(1) if match else None
    
    def generer_table_matieres(self):
        """Génère une table des matières dynamique."""
        toc = []
        
        for i, section in enumerate(self.contenu_sections, 1):
            if section['type'] == 'section_recettes':
                toc.append(f"{i}. [{section['titre']}](#{self._ancre_titre(section['titre'])}) — {section['nb_recettes']} recettes")
            else:
                toc.append(f"{i}. [{section['titre']}](#{self._ancre_titre(section['titre'])})")
        
        return "\n".join(toc)
    
    def _ancre_titre(self, titre):
        """Convertit un titre en ancre HTML valide."""
        ancre = re.sub(r'[^a-zA-Z0-9\s]', '', titre.lower())
        ancre = re.sub(r'\s+', '-', ancre.strip())
        return ancre
    
    def generer_html_professionnel(self):
        """Génère un HTML avec mise en page professionnelle."""
        
        # CSS professionnel pour livre de cuisine
        css_style = """
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@300;400;600&display=swap');
        
        :root {
            --couleur-primaire: #8B4513;
            --couleur-secondaire: #D2691E;
            --couleur-accent: #CD853F;
            --couleur-texte: #2C1810;
            --couleur-fond: #FFF8F0;
            --couleur-encadre: #F5E6D3;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Source Sans Pro', sans-serif;
            line-height: 1.7;
            color: var(--couleur-texte);
            background: var(--couleur-fond);
            margin: 0;
            padding: 0;
            font-size: 16px;
        }
        
        .livre-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
        
        /* Typographie des titres */
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Playfair Display', serif;
            color: var(--couleur-primaire);
            margin-top: 2em;
            margin-bottom: 1em;
            line-height: 1.2;
        }
        
        h1 {
            font-size: 2.5em;
            text-align: center;
            border-bottom: 3px solid var(--couleur-secondaire);
            padding-bottom: 0.5em;
            margin-bottom: 1.5em;
        }
        
        h2 {
            font-size: 2em;
            color: var(--couleur-secondaire);
            border-left: 5px solid var(--couleur-accent);
            padding-left: 20px;
            margin-top: 3em;
        }
        
        h3 {
            font-size: 1.5em;
            color: var(--couleur-primaire);
        }
        
        h4 {
            font-size: 1.2em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Page de titre */
        .page-titre {
            text-align: center;
            padding: 60px 0;
            border-bottom: 2px solid var(--couleur-accent);
            margin-bottom: 60px;
        }
        
        .titre-principal {
            font-size: 3.5em;
            font-weight: 700;
            color: var(--couleur-primaire);
            margin-bottom: 0.3em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .sous-titre {
            font-size: 1.3em;
            color: var(--couleur-secondaire);
            font-style: italic;
            margin-bottom: 2em;
        }
        
        .auteur {
            font-size: 1.1em;
            font-weight: 300;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        /* Table des matières */
        .table-matieres {
            background: var(--couleur-encadre);
            padding: 30px;
            border-radius: 10px;
            margin: 40px 0;
            border-left: 5px solid var(--couleur-primaire);
        }
        
        .table-matieres h2 {
            margin-top: 0;
            border-left: none;
            padding-left: 0;
        }
        
        .table-matieres ol {
            counter-reset: section-counter;
            list-style: none;
            padding-left: 0;
        }
        
        .table-matieres ol li {
            counter-increment: section-counter;
            margin-bottom: 12px;
            padding-left: 30px;
            position: relative;
        }
        
        .table-matieres ol li::before {
            content: counter(section-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: var(--couleur-primaire);
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .table-matieres a {
            color: var(--couleur-texte);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .table-matieres a:hover {
            color: var(--couleur-primaire);
        }
        
        /* Recettes */
        .recette {
            background: white;
            border: 2px solid var(--couleur-encadre);
            border-radius: 12px;
            padding: 30px;
            margin: 40px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        
        .recette h3 {
            margin-top: 0;
            color: var(--couleur-primaire);
            border-bottom: 2px solid var(--couleur-accent);
            padding-bottom: 10px;
        }
        
        .ingredients, .preparation {
            margin: 25px 0;
        }
        
        .ingredients h4, .preparation h4 {
            color: var(--couleur-secondaire);
            margin-bottom: 15px;
        }
        
        .ingredients ul {
            columns: 2;
            column-gap: 30px;
            margin: 0;
            padding-left: 20px;
        }
        
        .ingredients li {
            margin-bottom: 8px;
            break-inside: avoid;
        }
        
        .preparation ol {
            counter-reset: step-counter;
            list-style: none;
            padding-left: 0;
        }
        
        .preparation ol li {
            counter-increment: step-counter;
            margin-bottom: 15px;
            padding-left: 40px;
            position: relative;
            line-height: 1.6;
        }
        
        .preparation ol li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: var(--couleur-secondaire);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        /* Tableaux */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 0.95em;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        th, td {
            padding: 15px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background: var(--couleur-primaire);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        tr:hover {
            background: var(--couleur-encadre);
        }
        
        /* Encadrés spéciaux */
        .encadre-saviezvous {
            background: linear-gradient(135deg, #f8f9fa, var(--couleur-encadre));
            border-left: 5px solid var(--couleur-accent);
            padding: 25px;
            margin: 30px 0;
            border-radius: 0 10px 10px 0;
            font-style: italic;
        }
        
        .encadre-saviezvous h4 {
            color: var(--couleur-primaire);
            margin-top: 0;
            display: flex;
            align-items: center;
        }
        
        .encadre-saviezvous h4::before {
            content: "SCIENCE: ";
            margin-right: 10px;
            font-weight: bold;
        }
        
        .encadre-securite {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .encadre-securite h4 {
            color: #856404;
            margin-top: 0;
        }
        
        .encadre-securite h4::before {
            content: "! ";
            font-weight: bold;
        }
        
        /* Métadonnées nutritionnelles */
        .metadonnees-nutritionnelles {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
            padding: 25px;
            background: var(--couleur-encadre);
            border-radius: 10px;
        }
        
        .metadonnee-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .metadonnee-valeur {
            font-size: 1.5em;
            font-weight: 600;
            color: var(--couleur-primaire);
            display: block;
        }
        
        .metadonnee-unite {
            font-size: 0.9em;
            color: var(--couleur-secondaire);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .livre-container {
                padding: 20px 10px;
            }
            
            .titre-principal {
                font-size: 2.5em;
            }
            
            .ingredients ul {
                columns: 1;
            }
            
            .metadonnees-nutritionnelles {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        /* Impression PDF */
        @media print {
            body {
                font-size: 12pt;
                line-height: 1.4;
            }
            
            .livre-container {
                max-width: none;
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
            
            .recette {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
                break-after: avoid;
            }
        }
        
        @page {
            margin: 2cm;
            size: A4;
        }
        """
        
        # Construction du HTML
        html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.livre_config['titre']} - {self.livre_config['sous_titre']}</title>
    <style>{css_style}</style>
</head>
<body>
    <div class="livre-container">
        <!-- Page de titre -->
        <div class="page-titre">
            <h1 class="titre-principal">{self.livre_config['titre']}</h1>
            <p class="sous-titre">{self.livre_config['sous_titre']}</p>
            <p class="auteur">Par {self.livre_config['auteur']}</p>
            <p style="margin-top: 2em; font-style: italic; color: var(--couleur-secondaire);">
                {self.livre_config['description']}
            </p>
        </div>
        
        <!-- Table des matières -->
        <div class="table-matieres">
            <h2>Table des Matières</h2>
            <ol>
                {self._generer_toc_html()}
            </ol>
        </div>
        
        <!-- Contenu du livre -->
        {self._generer_contenu_html()}
        
        <!-- Pied de page -->
        <div style="text-align: center; margin-top: 60px; padding: 30px 0; border-top: 2px solid var(--couleur-accent); color: var(--couleur-secondaire);">
            <p><strong>{self.livre_config['titre']}</strong> - Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
            <p>{self.stats['sections_collectees']} sections • {self.stats['recettes_trouvees']} recettes • {self.stats['tableaux_securite']} tableaux de sécurité</p>
        </div>
    </div>
</body>
</html>"""
        
        return html_content
    
    def generer_markdown_complet(self):
        """Génère le Markdown complet du livre."""
        contenu_sections = []
        
        # En-tête du livre
        markdown_complet = f"""# {self.livre_config['titre']}

**{self.livre_config['sous_titre']}**

*Par {self.livre_config['auteur']}*

---

{self.livre_config['description']}

---

## Table des Matières

"""
        
        # Table des matières
        for i, section in enumerate(self.contenu_sections, 1):
            if section['type'] == 'section_recettes':
                markdown_complet += f"{i}. [{section['titre']}](#{self._ancre_titre(section['titre'])}) — {section['nb_recettes']} recettes\n"
            else:
                markdown_complet += f"{i}. [{section['titre']}](#{self._ancre_titre(section['titre'])})\n"
        
        markdown_complet += "\n---\n\n"
        
        # Contenu complet
        for section in self.contenu_sections:
            markdown_complet += section['contenu'] + "\n\n---\n\n"
        
        return markdown_complet
    
    def _generer_toc_html(self):
        """Génère la table des matières en HTML."""
        toc_items = []
        
        for section in self.contenu_sections:
            ancre = self._ancre_titre(section['titre'])
            if section['type'] == 'section_recettes':
                toc_items.append(f'<li><a href="#{ancre}">{section["titre"]}</a> <em>({section["nb_recettes"]} recettes)</em></li>')
            else:
                toc_items.append(f'<li><a href="#{ancre}">{section["titre"]}</a></li>')
        
        return "\n".join(toc_items)
    
    def _generer_contenu_html(self):
        """Convertit le contenu Markdown en HTML enrichi."""
        contenu_html = []
        
        # Extensions Markdown pour un rendu professionnel
        md = markdown.Markdown(
            extensions=['extra', 'codehilite', 'toc', 'tables', 'attr_list'],
            extension_configs={
                'codehilite': {
                    'css_class': 'highlight',
                    'use_pygments': True
                },
                'toc': {
                    'anchorlink': True
                }
            }
        )
        
        for section in self.contenu_sections:
            ancre = self._ancre_titre(section['titre'])
            
            # Traitement spécial selon le type de section
            contenu_markdown = section['contenu']
            
            # Amélioration du contenu pour Carnivaute
            contenu_markdown = self._ameliorer_contenu_carnivaute(contenu_markdown)
            
            # Conversion en HTML
            html_section = md.convert(contenu_markdown)
            
            # Wrapper avec ancre
            contenu_html.append(f'<div id="{ancre}" class="section section-{section["type"]}">')
            contenu_html.append(html_section)
            contenu_html.append('</div>')
            
            # Séparateur entre sections
            if section != self.contenu_sections[-1]:
                contenu_html.append('<hr style="margin: 60px 0; border: none; border-top: 2px solid var(--couleur-accent);">')
        
        return "\n".join(contenu_html)
    
    def _ameliorer_contenu_carnivaute(self, contenu):
        """Applique des améliorations spécifiques au contenu Carnivaute."""
        
        # Amélioration des encadrés "Le saviez-vous ?"
        contenu = re.sub(
            r'🔬 \*\*Le saviez-vous \?\*\* (.+?)(?=\n\n|\n#|\Z)',
            r'<div class="encadre-saviezvous"><h4>Le saviez-vous ?</h4><p>\1</p></div>',
            contenu,
            flags=re.DOTALL
        )
        
        # Amélioration des recettes
        contenu = re.sub(
            r'## (.+?)\n\n(.+?)\n\n### Ingrédients',
            r'<div class="recette">\n## \1\n\n<p class="accroche-recette">\2</p>\n\n### Ingrédients',
            contenu,
            flags=re.DOTALL
        )
        
        # Fermeture des divs recettes (approximatif)
        contenu = re.sub(
            r'(\n---\n)',
            r'\n</div>\1',
            contenu
        )
        
        # Amélioration des tableaux de sécurité
        contenu = re.sub(
            r'\| France/UE \| USA \|',
            r'<div class="encadre-securite"><h4>Sécurité Alimentaire</h4>\n| France/UE | USA |',
            contenu
        )
        
        return contenu
    
    def generer_pdf(self, html_content):
        """Génère le PDF à partir du HTML."""
        if not WEASYPRINT_AVAILABLE:
            print("WeasyPrint non disponible - génération PDF sautée")
            return None
            
        try:
            # Configuration CSS spéciale pour PDF
            css_pdf = CSS(string="""
                @page {
                    size: A4;
                    margin: 2cm;
                }
                
                body {
                    font-size: 11pt;
                    line-height: 1.4;
                }
                
                .recette {
                    page-break-inside: avoid;
                }
                
                h1, h2, h3 {
                    page-break-after: avoid;
                }
                
                .page-titre {
                    page-break-after: always;
                }
                
                .table-matieres {
                    page-break-after: always;
                }
            """)
            
            # Génération PDF avec WeasyPrint
            html_obj = HTML(string=html_content)
            
            output_dir = self.base_path / "output_final"
            output_dir.mkdir(exist_ok=True)
            
            pdf_file = output_dir / "CARNIVAUTE_livre_complet.pdf"
            html_obj.write_pdf(pdf_file, stylesheets=[css_pdf])
            
            return pdf_file
            
        except Exception as e:
            print(f"Erreur génération PDF: {e}")
            print("Le fichier HTML sera disponible pour conversion manuelle")
            return None
    
    def generer_livre_complet(self):
        """Génère le livre complet (HTML + PDF)."""
        print("GÉNÉRATEUR CARNIVAUTE PROFESSIONNEL")
        print("=" * 50)
        
        try:
            # 1. Configuration
            print("\n1. Chargement de la configuration...")
            self.lire_configuration()
            
            # 2. Collecte du contenu
            print("\n2. Collecte du contenu...")
            self.collecter_contenu_manuscrit()
            
            # 3. Génération HTML
            print("\n3. Génération HTML professionnel...")
            html_content = self.generer_html_professionnel()
            
            output_dir = self.base_path / "output_final"
            output_dir.mkdir(exist_ok=True)
            
            # Sauvegarde HTML
            html_file = output_dir / "CARNIVAUTE_livre_complet.html"
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"OK HTML généré: {html_file}")
            
            # Sauvegarde Markdown
            contenu_markdown = self.generer_markdown_complet()
            markdown_file = output_dir / "CARNIVAUTE_livre_complet.md"
            with open(markdown_file, 'w', encoding='utf-8') as f:
                f.write(contenu_markdown)
            print(f"OK Markdown généré: {markdown_file}")
            
            # 4. Génération PDF (sautée par défaut car problématique)
            print("\n4. Génération PDF sautée (utilisez conversion manuelle)")
            pdf_file = None
            
            # 5. Statistiques finales
            print("\n" + "=" * 50)
            print("GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
            print("=" * 50)
            print(f"Titre: {self.livre_config['titre']}")
            print(f"Auteur: {self.livre_config['auteur']}")
            print(f"Sections: {self.stats['sections_collectees']}")
            print(f"Recettes: {self.stats['recettes_trouvees']}")
            print(f"Tableaux sécurité: {self.stats['tableaux_securite']}")
            print(f"Encadrés scientifiques: {self.stats['encadres_saviezvous']}")
            print(f"Taille contenu: {self.stats['taille_contenu']:,} caractères")
            
            print(f"\nFichiers générés dans: {output_dir}")
            print(f"  - {html_file.name}")
            print(f"  - CARNIVAUTE_livre_complet.md")
            print(f"  - PDF: Générer manuellement via navigateur")
            
            return True
            
        except Exception as e:
            print(f"\nERREUR: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Point d'entrée principal."""
    # Gestion des arguments de ligne de commande
    html_only = "--html-only" in sys.argv
    
    generator = CarnivaUteGenerator()
    
    if html_only:
        # Mode HTML uniquement
        print("MODE HTML UNIQUEMENT")
        print("=" * 30)
        
        try:
            # 1. Configuration
            print("\n1. Chargement de la configuration...")
            generator.lire_configuration()
            
            # 2. Collecte du contenu
            print("\n2. Collecte du contenu...")
            generator.collecter_contenu_manuscrit()
            
            # 3. Génération HTML seulement
            print("\n3. Génération HTML...")
            html_content = generator.generer_html_professionnel()
            
            output_dir = generator.base_path / "output_final"
            output_dir.mkdir(exist_ok=True)
            
            # Sauvegarde HTML
            html_file = output_dir / "CARNIVAUTE_livre_complet.html"
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"OK HTML généré: {html_file}")
            
            # Sauvegarde Markdown
            contenu_markdown = generator.generer_markdown_complet()
            markdown_file = output_dir / "CARNIVAUTE_livre_complet.md"
            with open(markdown_file, 'w', encoding='utf-8') as f:
                f.write(contenu_markdown)
            print(f"OK Markdown généré: {markdown_file}")
            
            print(f"\nHTML généré avec succès!")
            success = True
            
        except Exception as e:
            print(f"\nERREUR: {e}")
            success = False
    else:
        # Mode complet
        success = generator.generer_livre_complet()
    
    if success:
        print("\nLivre CARNIVAUTE généré avec succès!")
        sys.exit(0)
    else:
        print("\nErreur lors de la génération")
        sys.exit(1)


if __name__ == "__main__":
    main()