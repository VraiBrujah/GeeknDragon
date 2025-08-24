#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import codecs
import re

# Lire le contenu extrait
with codecs.open(r'C:\Users\Brujah\Documents\GitHub\Carnivaute\contenu_extrait.html', 'r', encoding='utf-8') as f:
    contenu_complet = f.read()

# Extraire les titres pour la table des matières
titres = []
titre_pattern = r'<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]+)</h[1-6]>'
for match in re.finditer(titre_pattern, contenu_complet):
    niveau = int(match.group(1))
    id_titre = match.group(2)
    texte_titre = match.group(3)
    
    # Nettoyer le titre des caractères spéciaux
    texte_titre = re.sub(r'<[^>]+>', '', texte_titre)  # Supprimer les balises HTML
    texte_titre = texte_titre.strip()
    
    if texte_titre and niveau <= 3:  # Seulement les niveaux 1, 2 et 3
        titres.append({
            'niveau': niveau,
            'id': id_titre,
            'texte': texte_titre,
            'page': len(titres) + 3  # Commencer à la page 3 (après couverture et table)
        })

# Générer la table des matières
table_matieres = """
    <!-- TABLE DES MATIÈRES -->
    <div class="page-break toc-page">
        <h1>📚 Table des Matières</h1>
        <div class="toc-container">
"""

page_courante = 3
for i, titre in enumerate(titres):
    if titre['niveau'] == 1:
        page_courante = i + 3
        icone = "🚀" if "introduction" in titre['texte'].lower() else "📖"
        if "cru" in titre['texte'].lower(): icone = "🍣"
        elif "charcuterie" in titre['texte'].lower(): icone = "🥓"
        elif "sous" in titre['texte'].lower(): icone = "🔬"
        elif "oeuf" in titre['texte'].lower(): icone = "🥚"
        elif "section" in titre['texte'].lower(): icone = "⭐"
        elif "annexe" in titre['texte'].lower(): icone = "📚"
        
        table_matieres += f'''
            <div class="toc-item niveau-{titre['niveau']}">
                <span class="toc-title">{icone} {titre['texte']}</span>
                <span class="toc-dots"></span>
                <span class="toc-page">{page_courante}</span>
            </div>'''
    elif titre['niveau'] == 2:
        page_courante += 1
        table_matieres += f'''
            <div class="toc-item niveau-{titre['niveau']}">
                <span class="toc-title">• {titre['texte']}</span>
                <span class="toc-dots"></span>
                <span class="toc-page">{page_courante}</span>
            </div>'''

table_matieres += """
        </div>
    </div>
"""

# Template HTML corrigé avec pagination unique et table des matières
template_html = f'''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARNIVAUTE - Guide Culinaire Spatial - Version Finale</title>
    <style>
/* CARNIVAUTE - VERSION FINALE AVEC TABLE DES MATIÈRES */

/* Variables */
:root {{
    --rouge-carnivore: #C41E3A;
    --brun-chaud: #8B4513;
    --orange-accent: #FF6B35;
    --creme: #FFFBF7;
    --gris-texte: #2C2C2C;
    --gris-clair: #F8F9FA;
    --vert-nutrition: #27AE60;
    --bleu-info: #3498DB;
    --rouge-securite: #E74C3C;
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: 'Segoe UI', 'Georgia', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: var(--gris-texte);
    background: var(--creme);
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
}}

/* SYSTÈME DE PAGINATION UNIQUE EN BAS AU CENTRE */
@media print {{
    @page {{
        size: A4;
        margin: 2.5cm 2cm 3cm 2cm;
    }}
    
    /* SEULE PAGINATION EN BAS AU CENTRE */
    @page {{
        @bottom-center {{
            content: counter(page);
            font-family: Arial, sans-serif;
            font-size: 12pt;
            font-weight: bold;
            color: var(--rouge-carnivore);
        }}
    }}
    
    /* Page de couverture sans numérotation */
    @page :first {{
        @bottom-center {{ content: none; }}
    }}
    
    /* Page de table des matières sans numérotation */
    .toc-page {{
        page: toc;
    }}
    
    @page toc {{
        @bottom-center {{ content: none; }}
    }}
    
    body {{ padding: 20px; }}
    .no-print {{ display: none !important; }}
    
    h1, h2, h3, h4 {{ page-break-after: avoid; }}
    .info-saviez-vous {{ page-break-inside: avoid; }}
    table {{ page-break-inside: avoid; }}
    .recette-container {{ page-break-inside: avoid; }}
    .page-break {{ page-break-before: always; }}
}}

/* TITRES ÉLÉGANTS */
h1 {{
    font-size: 3.5em;
    font-weight: 900;
    text-align: center;
    color: var(--rouge-carnivore);
    margin: 3em 0 2em;
    padding: 40px;
    background: linear-gradient(135deg, white, var(--gris-clair));
    border-radius: 20px;
    border: 4px solid var(--orange-accent);
    box-shadow: 0 15px 40px rgba(196, 30, 58, 0.15);
    page-break-after: avoid;
}}

h2 {{
    font-size: 2.4em;
    font-weight: 700;
    color: var(--brun-chaud);
    margin: 3em 0 1.5em;
    padding: 25px 0 20px 30px;
    border-left: 10px solid var(--orange-accent);
    background: linear-gradient(90deg, var(--gris-clair), transparent);
    border-radius: 0 15px 15px 0;
    page-break-after: avoid;
}}

h3 {{
    font-size: 1.8em;
    font-weight: 600;
    color: var(--rouge-carnivore);
    margin: 2.5em 0 1.2em;
    padding-bottom: 10px;
    border-bottom: 3px solid var(--orange-accent);
}}

h4 {{
    font-size: 1.4em;
    font-weight: 600;
    color: var(--brun-chaud);
    margin: 2em 0 1em;
}}

h5, h6 {{
    font-size: 1.2em;
    font-weight: 600;
    color: var(--gris-texte);
    margin: 1.5em 0 0.8em;
}}

/* TEXTE ET PARAGRAPHES */
p {{
    margin-bottom: 1.5em;
    text-align: justify;
    line-height: 1.9;
}}

strong, b {{
    color: var(--rouge-carnivore);
    font-weight: 800;
}}

em, i {{
    color: var(--brun-chaud);
    font-style: italic;
}}

/* TABLE DES MATIÈRES */
.toc-container {{
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    border: 2px solid var(--orange-accent);
    border-radius: 15px;
    padding: 40px;
    margin: 2em 0;
    box-shadow: 0 10px 30px rgba(196, 30, 58, 0.1);
}}

.toc-item {{
    display: flex;
    align-items: center;
    margin: 1.2em 0;
    font-size: 1.1em;
    line-height: 1.6;
}}

.toc-item.niveau-1 {{
    font-weight: 700;
    font-size: 1.3em;
    color: var(--rouge-carnivore);
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5em;
    margin: 1.5em 0;
}}

.toc-item.niveau-2 {{
    font-weight: 600;
    font-size: 1.1em;
    color: var(--brun-chaud);
    margin-left: 2em;
}}

.toc-item.niveau-3 {{
    font-weight: 500;
    font-size: 1em;
    color: var(--gris-texte);
    margin-left: 4em;
}}

.toc-title {{
    flex-shrink: 0;
}}

.toc-dots {{
    flex-grow: 1;
    height: 1px;
    background: repeating-linear-gradient(
        to right,
        transparent 0px,
        transparent 3px,
        var(--gris-texte) 3px,
        var(--gris-texte) 6px
    );
    margin: 0 15px;
    opacity: 0.5;
}}

.toc-page {{
    flex-shrink: 0;
    font-weight: 800;
    color: var(--rouge-carnivore);
    background: var(--gris-clair);
    padding: 5px 10px;
    border-radius: 20px;
    min-width: 40px;
    text-align: center;
}}

/* ENCADRÉS "LE SAVIEZ-VOUS" */
.info-saviez-vous {{
    background: linear-gradient(135deg, #FFF8E1, #FFFBF0);
    border-left: 6px solid var(--orange-accent);
    border-radius: 0 12px 12px 0;
    padding: 25px 30px;
    margin: 2.5em 0;
    position: relative;
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.1);
    page-break-inside: avoid;
}}

.info-saviez-vous::before {{
    content: "💡 Le Saviez-Vous ?";
    position: absolute;
    top: -15px;
    left: 25px;
    background: var(--orange-accent);
    color: white;
    padding: 8px 18px;
    border-radius: 25px;
    font-size: 0.85em;
    font-weight: 700;
    font-style: normal;
}}

.info-saviez-vous p {{
    color: var(--brun-chaud);
    margin-bottom: 0;
    font-weight: 500;
    line-height: 1.8;
}}

/* BLOCKQUOTES */
blockquote {{
    background: linear-gradient(135deg, #E8F4FD, #F0F8FF);
    border-left: 6px solid var(--bleu-info);
    border-radius: 0 12px 12px 0;
    padding: 25px 30px;
    margin: 2.5em 0;
    font-style: italic;
    position: relative;
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.1);
    page-break-inside: avoid;
}}

blockquote::before {{
    content: "💡 Info";
    position: absolute;
    top: -15px;
    left: 25px;
    background: var(--bleu-info);
    color: white;
    padding: 8px 18px;
    border-radius: 25px;
    font-size: 0.85em;
    font-weight: 700;
    font-style: normal;
}}

blockquote p {{
    margin-bottom: 0;
    color: var(--bleu-info);
    font-weight: 500;
    line-height: 1.8;
}}

/* LISTES ÉLÉGANTES */
ul, ol {{
    margin: 2em 0;
    padding-left: 3em;
}}

li {{
    margin-bottom: 1em;
    line-height: 1.8;
}}

ul li::marker {{
    color: var(--orange-accent);
    font-size: 1.2em;
}}

ol li::marker {{
    color: var(--rouge-carnivore);
    font-weight: 800;
}}

/* TABLEAUX PROFESSIONNELS */
table {{
    width: 100%;
    margin: 3.5em 0;
    border-collapse: collapse;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 12px 35px rgba(44, 44, 44, 0.15);
    background: white;
    page-break-inside: avoid;
}}

thead th {{
    background: linear-gradient(135deg, var(--rouge-carnivore), var(--brun-chaud));
    color: white;
    font-weight: 800;
    padding: 25px 20px;
    text-align: center;
    font-size: 1.05em;
    letter-spacing: 0.8px;
    text-transform: uppercase;
}}

tbody td {{
    padding: 20px;
    border-bottom: 1px solid #E9ECEF;
    vertical-align: top;
    line-height: 1.7;
}}

tbody tr:nth-child(even) {{
    background: #FAFBFC;
}}

tbody tr:hover {{
    background: #F1F3F5;
    transition: background 0.3s ease;
}}

/* STATUS COMPATIBILITÉ */
.compatibility-status {{
    position: fixed;
    top: 10px;
    right: 10px;
    background: #28a745;
    color: white;
    padding: 8px 15px;
    border-radius: 25px;
    font-size: 12px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 3px 15px rgba(0,0,0,0.2);
}}

@media print {{
    .compatibility-status {{ display: none !important; }}
}}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {{
    body {{ padding: 20px; }}
    h1 {{ font-size: 2.5em; padding: 25px; }}
    h2 {{ font-size: 2em; }}
    h3 {{ font-size: 1.5em; }}
    .toc-item {{ font-size: 1em; }}
    .toc-item.niveau-1 {{ font-size: 1.1em; }}
}}
</style>
</head>
<body>
    <div class="compatibility-status no-print">✅ VERSION FINALE CORRIGÉE</div>

    <!-- PAGE DE COUVERTURE -->
    <div class="title-page no-page-break">
        <h1>CARNIVAUTE</h1>
        <p style="text-align: center; font-size: 1.4em; margin: 2em 0; font-weight: 600;"><strong>Guide Culinaire de l'Exploration Carnivore</strong></p>
        <p style="text-align: center; font-style: italic; margin-bottom: 2em; font-size: 1.2em;"><em>Par L'Équipe Carnivaute</em></p>
        <p style="text-align: center; font-size: 1.1em; margin: 3em 0; line-height: 1.6;">120 recettes révolutionnaires pour explorer l'univers du régime carnivore avec rigueur scientifique et plaisir gustatif</p>
        <div style="text-align: center; margin-top: 4em; padding: 2em; background: var(--gris-clair); border-radius: 15px; border: 2px solid var(--orange-accent);">
            <p style="font-size: 1.1em; color: var(--brun-chaud); margin: 0;"><strong>🚀 Science • Nutrition • Saveurs Authentiques</strong></p>
        </div>
    </div>

{table_matieres}

    <!-- CONTENU PRINCIPAL -->
    <main class="main-content page-break">
{contenu_complet}
    </main>

    <footer style="text-align: center; margin-top: 4em; padding: 2em; border-top: 3px solid var(--orange-accent);">
        <p><strong>CARNIVAUTE</strong> - Excellence Culinaire Carnivore</p>
        <p><em>Science • Nutrition • Saveurs Authentiques</em></p>
        <p style="font-size: 0.9em; color: var(--gris-moyen); margin-top: 1em;">Version Finale avec Table des Matières et Pagination Unique</p>
    </footer>

</body>
</html>'''

# Sauvegarder le fichier final corrigé
with codecs.open(r'C:\Users\Brujah\Documents\GitHub\Carnivaute\CARNIVAUTE_FINAL_CORRIGE.html', 'w', encoding='utf-8') as f:
    f.write(template_html)

print('LIVRE FINAL CORRIGÉ!')
print(f'Taille finale: {len(template_html)} caractères')
print('✅ Double pagination supprimée (seule pagination en bas au centre)')
print('✅ Table des matières créée avec numérotation des pages')
print('Fichier sauvé: CARNIVAUTE_FINAL_CORRIGE.html')