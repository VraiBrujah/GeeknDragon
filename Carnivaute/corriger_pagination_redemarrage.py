#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import codecs
import re

# Lire le contenu extrait
with codecs.open(r'C:\Users\Brujah\Documents\GitHub\Carnivaute\contenu_extrait.html', 'r', encoding='utf-8') as f:
    contenu_complet = f.read()

# Extraire SEULEMENT les titres H1 pour la table des matières simplifiée
titres_principaux = []
titre_pattern = r'<h1[^>]*id="([^"]*)"[^>]*>([^<]+)</h1>'
for match in re.finditer(titre_pattern, contenu_complet):
    id_titre = match.group(1)
    texte_titre = match.group(2)
    
    # Nettoyer le titre des caractères spéciaux
    texte_titre = re.sub(r'<[^>]+>', '', texte_titre)  # Supprimer les balises HTML
    texte_titre = texte_titre.strip()
    
    if texte_titre:
        titres_principaux.append({
            'id': id_titre,
            'texte': texte_titre
        })

# Générer la table des matières avec texte plus petit et pagination redémarrée
table_matieres = """
    <!-- TABLE DES MATIÈRES COMPACTE -->
    <div class="page-break toc-page">
        <h1>📚 Table des Matières</h1>
        <div class="toc-container">
"""

for i, titre in enumerate(titres_principaux):
    page_courante = i + 1  # Commencer à la page 1 du contenu
    
    # Assigner les icônes selon le contenu
    icone = "📖"
    titre_lower = titre['texte'].lower()
    
    if "introduction" in titre_lower: 
        icone = "🚀"
    elif "cru" in titre_lower: 
        icone = "🍣"
    elif "charcuterie" in titre_lower: 
        icone = "🥓"
    elif "sous" in titre_lower and "vide" in titre_lower: 
        icone = "🔬"
    elif "oeuf" in titre_lower or "œuf" in titre_lower: 
        icone = "🥚"
    elif "section 1" in titre_lower: 
        icone = "🔧"
    elif "section 2" in titre_lower: 
        icone = "🦴"
    elif "section 3" in titre_lower: 
        icone = "☀️"
    elif "section 4" in titre_lower: 
        icone = "⚡"
    elif "section 5" in titre_lower: 
        icone = "📦"
    elif "section 6" in titre_lower: 
        icone = "🎒"
    elif "section 7" in titre_lower and "famille" in titre_lower: 
        icone = "👨‍👩‍👧‍👦"
    elif "section 7" in titre_lower and "gourmet" in titre_lower: 
        icone = "🍽️"
    elif "section 8" in titre_lower: 
        icone = "🍽️"
    elif "section 9" in titre_lower: 
        icone = "💪"
    elif "section 10" in titre_lower: 
        icone = "💰"
    elif "section 11" in titre_lower: 
        icone = "🧈"
    elif "annexe" in titre_lower: 
        icone = "📚"
    
    table_matieres += f'''
            <div class="toc-item">
                <span class="toc-title">{icone} {titre['texte']}</span>
                <span class="toc-dots"></span>
                <span class="toc-page">{page_courante}</span>
            </div>'''

table_matieres += """
        </div>
        <div class="toc-summary">
            <p><strong>🎯 Navigation simplifiée</strong></p>
            <p>120 recettes • 5 chapitres spéciaux • 11 sections thématiques • 5 annexes</p>
        </div>
    </div>
"""

# Template HTML avec pagination qui redémarre
template_html = f'''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARNIVAUTE - Guide Culinaire Spatial - Pagination Redémarrée</title>
    <style>
/* CARNIVAUTE - PAGINATION QUI REDÉMARRE + TEXTE COMPACT */

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
    --gris-moyen: #666;
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

/* SYSTÈME DE PAGINATION QUI REDÉMARRE */
@media print {{
    @page {{
        size: A4;
        margin: 2.5cm 2cm 3cm 2cm;
    }}
    
    /* PAGINATION EN BAS AU CENTRE */
    @page {{
        @bottom-center {{
            content: counter(page);
            font-family: Arial, sans-serif;
            font-size: 12pt;
            font-weight: bold;
            color: var(--rouge-carnivore);
        }}
    }}
    
    /* Pages préliminaires sans numérotation */
    @page :first {{
        @bottom-center {{ content: none; }}
    }}
    
    .toc-page {{
        page: toc;
    }}
    
    @page toc {{
        @bottom-center {{ content: none; }}
    }}
    
    /* Le contenu principal redémarre la numérotation à 1 */
    .main-content {{
        page: content;
        counter-reset: page 1;
    }}
    
    @page content {{
        @bottom-center {{
            content: counter(page);
            font-family: Arial, sans-serif;
            font-size: 12pt;
            font-weight: bold;
            color: var(--rouge-carnivore);
        }}
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
    font-size: 3.2em;
    font-weight: 900;
    text-align: center;
    color: var(--rouge-carnivore);
    margin: 2.5em 0 1.8em;
    padding: 35px;
    background: linear-gradient(135deg, white, var(--gris-clair));
    border-radius: 18px;
    border: 3px solid var(--orange-accent);
    box-shadow: 0 12px 35px rgba(196, 30, 58, 0.15);
    page-break-after: avoid;
}}

h2 {{
    font-size: 2.2em;
    font-weight: 700;
    color: var(--brun-chaud);
    margin: 2.5em 0 1.3em;
    padding: 22px 0 18px 28px;
    border-left: 8px solid var(--orange-accent);
    background: linear-gradient(90deg, var(--gris-clair), transparent);
    border-radius: 0 12px 12px 0;
    page-break-after: avoid;
}}

h3 {{
    font-size: 1.6em;
    font-weight: 600;
    color: var(--rouge-carnivore);
    margin: 2.2em 0 1.1em;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--orange-accent);
}}

h4 {{
    font-size: 1.3em;
    font-weight: 600;
    color: var(--brun-chaud);
    margin: 1.8em 0 0.9em;
}}

h5, h6 {{
    font-size: 1.1em;
    font-weight: 600;
    color: var(--gris-texte);
    margin: 1.5em 0 0.7em;
}}

/* TEXTE ET PARAGRAPHES */
p {{
    margin-bottom: 1.3em;
    text-align: justify;
    line-height: 1.8;
}}

strong, b {{
    color: var(--rouge-carnivore);
    font-weight: 800;
}}

em, i {{
    color: var(--brun-chaud);
    font-style: italic;
}}

/* TABLE DES MATIÈRES COMPACTE */
.toc-container {{
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    border: 2px solid var(--orange-accent);
    border-radius: 15px;
    padding: 35px;
    margin: 2.5em 0;
    box-shadow: 0 10px 25px rgba(196, 30, 58, 0.1);
}}

.toc-item {{
    display: flex;
    align-items: center;
    margin: 1em 0;
    font-size: 1.05em;
    line-height: 1.5;
    font-weight: 600;
    color: var(--rouge-carnivore);
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0.7em;
    transition: all 0.2s ease;
}}

.toc-item:hover {{
    background: linear-gradient(90deg, #fff8f0, transparent);
    padding-left: 15px;
    border-radius: 8px;
}}

.toc-title {{
    flex-shrink: 0;
    font-size: 1em;
}}

.toc-dots {{
    flex-grow: 1;
    height: 1px;
    background: repeating-linear-gradient(
        to right,
        transparent 0px,
        transparent 4px,
        var(--orange-accent) 4px,
        var(--orange-accent) 7px
    );
    margin: 0 18px;
    opacity: 0.5;
}}

.toc-page {{
    flex-shrink: 0;
    font-weight: 800;
    color: white;
    background: var(--rouge-carnivore);
    padding: 6px 12px;
    border-radius: 20px;
    min-width: 35px;
    text-align: center;
    font-size: 0.95em;
    box-shadow: 0 2px 8px rgba(196, 30, 58, 0.3);
}}

.toc-summary {{
    text-align: center;
    margin-top: 2.5em;
    padding: 1.3em;
    background: var(--gris-clair);
    border-radius: 10px;
    border: 1px solid #ddd;
}}

.toc-summary p {{
    margin: 0.5em 0;
    font-size: 0.95em;
    color: var(--brun-chaud);
}}

.toc-summary p:first-child {{
    font-size: 1.05em;
    font-weight: 700;
}}

/* ENCADRÉS "LE SAVIEZ-VOUS" */
.info-saviez-vous {{
    background: linear-gradient(135deg, #FFF8E1, #FFFBF0);
    border-left: 6px solid var(--orange-accent);
    border-radius: 0 12px 12px 0;
    padding: 22px 26px;
    margin: 2.2em 0;
    position: relative;
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.1);
    page-break-inside: avoid;
}}

.info-saviez-vous::before {{
    content: "💡 Le Saviez-Vous ?";
    position: absolute;
    top: -13px;
    left: 22px;
    background: var(--orange-accent);
    color: white;
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 0.8em;
    font-weight: 700;
    font-style: normal;
}}

.info-saviez-vous p {{
    color: var(--brun-chaud);
    margin-bottom: 0;
    font-weight: 500;
    line-height: 1.7;
}}

/* BLOCKQUOTES */
blockquote {{
    background: linear-gradient(135deg, #E8F4FD, #F0F8FF);
    border-left: 6px solid var(--bleu-info);
    border-radius: 0 12px 12px 0;
    padding: 22px 26px;
    margin: 2.2em 0;
    font-style: italic;
    position: relative;
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.1);
    page-break-inside: avoid;
}}

blockquote::before {{
    content: "💡 Info";
    position: absolute;
    top: -13px;
    left: 22px;
    background: var(--bleu-info);
    color: white;
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 0.8em;
    font-weight: 700;
    font-style: normal;
}}

blockquote p {{
    margin-bottom: 0;
    color: var(--bleu-info);
    font-weight: 500;
    line-height: 1.7;
}}

/* LISTES ÉLÉGANTES */
ul, ol {{
    margin: 1.8em 0;
    padding-left: 2.8em;
}}

li {{
    margin-bottom: 0.8em;
    line-height: 1.7;
}}

ul li::marker {{
    color: var(--orange-accent);
    font-size: 1.1em;
}}

ol li::marker {{
    color: var(--rouge-carnivore);
    font-weight: 800;
}}

/* TABLEAUX PROFESSIONNELS */
table {{
    width: 100%;
    margin: 3em 0;
    border-collapse: collapse;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(44, 44, 44, 0.15);
    background: white;
    page-break-inside: avoid;
}}

thead th {{
    background: linear-gradient(135deg, var(--rouge-carnivore), var(--brun-chaud));
    color: white;
    font-weight: 800;
    padding: 20px 18px;
    text-align: center;
    font-size: 1em;
    letter-spacing: 0.6px;
    text-transform: uppercase;
}}

tbody td {{
    padding: 18px;
    border-bottom: 1px solid #E9ECEF;
    vertical-align: top;
    line-height: 1.6;
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
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}}

@media print {{
    .compatibility-status {{ display: none !important; }}
}}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {{
    body {{ padding: 18px; }}
    h1 {{ font-size: 2.2em; padding: 22px; }}
    h2 {{ font-size: 1.8em; }}
    h3 {{ font-size: 1.4em; }}
    .toc-item {{ font-size: 0.95em; margin: 0.8em 0; }}
    .toc-container {{ padding: 25px; }}
}}
</style>
</head>
<body>
    <div class="compatibility-status no-print">✅ PAGINATION REDÉMARRÉE</div>

    <!-- PAGE DE COUVERTURE -->
    <div class="title-page no-page-break">
        <h1>CARNIVAUTE</h1>
        <p style="text-align: center; font-size: 1.3em; margin: 1.8em 0; font-weight: 600;"><strong>Guide Culinaire de l'Exploration Carnivore</strong></p>
        <p style="text-align: center; font-style: italic; margin-bottom: 1.8em; font-size: 1.15em;"><em>Par L'Équipe Carnivaute</em></p>
        <p style="text-align: center; font-size: 1.05em; margin: 2.5em 0; line-height: 1.6;">120 recettes révolutionnaires pour explorer l'univers du régime carnivore avec rigueur scientifique et plaisir gustatif</p>
        <div style="text-align: center; margin-top: 3.5em; padding: 1.8em; background: var(--gris-clair); border-radius: 12px; border: 2px solid var(--orange-accent);">
            <p style="font-size: 1.05em; color: var(--brun-chaud); margin: 0;"><strong>🚀 Science • Nutrition • Saveurs Authentiques</strong></p>
        </div>
    </div>

{table_matieres}

    <!-- CONTENU PRINCIPAL (PAGINATION REDÉMARRE À 1) -->
    <main class="main-content page-break">
{contenu_complet}
    </main>

    <footer style="text-align: center; margin-top: 3.5em; padding: 1.8em; border-top: 2px solid var(--orange-accent);">
        <p><strong>CARNIVAUTE</strong> - Excellence Culinaire Carnivore</p>
        <p><em>Science • Nutrition • Saveurs Authentiques</em></p>
        <p style="font-size: 0.85em; color: var(--gris-moyen); margin-top: 0.8em;">Version Optimisée - Pagination Redémarrée & Table Compacte</p>
    </footer>

</body>
</html>'''

# Sauvegarder le fichier final avec pagination redémarrée
with codecs.open(r'C:\Users\Brujah\Documents\GitHub\Carnivaute\CARNIVAUTE_PAGINATION_RESTART.html', 'w', encoding='utf-8') as f:
    f.write(template_html)

print('PAGINATION REDEMARREE!')
print(f'Taille finale: {len(template_html)} caracteres')
print('✅ Pagination redemarre a 1 au debut du contenu')
print('✅ Table des matieres avec texte plus petit')
print(f'Chapitres affiches: {len(titres_principaux)}')
print('Fichier sauve: CARNIVAUTE_PAGINATION_RESTART.html')