#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import codecs

# Lire le contenu extrait
with codecs.open(r'C:\Users\Brujah\Documents\GitHub\Carnivaute\contenu_extrait.html', 'r', encoding='utf-8') as f:
    contenu_complet = f.read()

# Template CSS et structure de pagination
template_html = '''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARNIVAUTE - Guide Culinaire Spatial - Version Complète Restaurée</title>
    <style>
/* PAGINATION UNIVERSELLE AVEC CONTENU COMPLET RESTAURÉ */

/* Variables */
:root {
    --rouge-carnivore: #C41E3A;
    --brun-chaud: #8B4513;
    --orange-accent: #FF6B35;
    --creme: #FFFBF7;
    --gris-texte: #2C2C2C;
    --gris-clair: #F8F9FA;
    --vert-nutrition: #27AE60;
    --bleu-info: #3498DB;
    --rouge-securite: #E74C3C;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Segoe UI', 'Georgia', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: var(--gris-texte);
    background: var(--creme);
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
}

/* SYSTÈME DE PAGINATION UNIVERSEL */
@media print {
    @page {
        size: A4;
        margin: 2.5cm 2cm 2.5cm 2cm;
    }
    
    @page {
        @top-left {
            content: "CARNIVAUTE - Guide Culinaire Spatial";
            font-family: Arial, sans-serif;
            font-size: 9pt;
            color: #666;
        }
        
        @top-right {
            content: "Page " counter(page);
            font-family: Arial, sans-serif;
            font-size: 9pt;
            font-weight: bold;
        }
        
        @bottom-center {
            content: counter(page);
            font-family: Arial, sans-serif;
            font-size: 10pt;
            font-weight: bold;
        }
    }
    
    @page :first {
        @top-left { content: none; }
        @top-right { content: none; }
        @bottom-center { content: none; }
    }
    
    body { padding: 20px; }
    .no-print { display: none !important; }
    
    h1, h2, h3, h4 { page-break-after: avoid; }
    .info-saviez-vous { page-break-inside: avoid; }
    table { page-break-inside: avoid; }
    .recette-container { page-break-inside: avoid; }
}

/* TITRES ÉLÉGANTS */
h1 {
    font-size: 4em;
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
}

h2 {
    font-size: 2.6em;
    font-weight: 700;
    color: var(--brun-chaud);
    margin: 4em 0 2em;
    padding: 30px 0 25px 35px;
    border-left: 12px solid var(--orange-accent);
    background: linear-gradient(90deg, var(--gris-clair), transparent);
    border-radius: 0 15px 15px 0;
    page-break-after: avoid;
}

h3 {
    font-size: 2em;
    font-weight: 600;
    color: var(--rouge-carnivore);
    margin: 3em 0 1.5em;
    padding-bottom: 12px;
    border-bottom: 4px solid var(--orange-accent);
}

h4 {
    font-size: 1.5em;
    font-weight: 600;
    color: var(--brun-chaud);
    margin: 2.5em 0 1.2em;
}

h5, h6 {
    font-size: 1.3em;
    font-weight: 600;
    color: var(--gris-texte);
    margin: 2em 0 1em;
}

/* TEXTE ET PARAGRAPHES */
p {
    margin-bottom: 1.5em;
    text-align: justify;
    line-height: 1.9;
}

strong, b {
    color: var(--rouge-carnivore);
    font-weight: 800;
}

em, i {
    color: var(--brun-chaud);
    font-style: italic;
}

/* BLOCKQUOTES ÉLÉGANTS */
blockquote {
    background: linear-gradient(135deg, #E8F4FD, #F0F8FF);
    border-left: 6px solid var(--bleu-info);
    border-radius: 0 12px 12px 0;
    padding: 25px 30px;
    margin: 2.5em 0;
    font-style: italic;
    position: relative;
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.1);
    page-break-inside: avoid;
}

blockquote::before {
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
}

/* Bulles "Le Saviez-Vous" spécialisées */
.info-saviez-vous {
    background: linear-gradient(135deg, #FFF8E1, #FFFBF0);
    border-left: 6px solid var(--orange-accent);
    border-radius: 0 12px 12px 0;
    padding: 25px 30px;
    margin: 2.5em 0;
    position: relative;
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.1);
    page-break-inside: avoid;
}

.info-saviez-vous::before {
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
}

.info-saviez-vous p {
    color: var(--brun-chaud);
    margin-bottom: 0;
    font-weight: 500;
    line-height: 1.8;
}

blockquote p {
    margin-bottom: 0;
    color: var(--bleu-info);
    font-weight: 500;
    line-height: 1.8;
}

/* LISTES ÉLÉGANTES */
ul, ol {
    margin: 2em 0;
    padding-left: 3em;
}

li {
    margin-bottom: 1em;
    line-height: 1.8;
}

ul li::marker {
    color: var(--orange-accent);
    font-size: 1.2em;
}

ol li::marker {
    color: var(--rouge-carnivore);
    font-weight: 800;
}

/* TABLEAUX PROFESSIONNELS */
table {
    width: 100%;
    margin: 3.5em 0;
    border-collapse: collapse;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 12px 35px rgba(44, 44, 44, 0.15);
    background: white;
    page-break-inside: avoid;
}

thead th {
    background: linear-gradient(135deg, var(--rouge-carnivore), var(--brun-chaud));
    color: white;
    font-weight: 800;
    padding: 25px 20px;
    text-align: center;
    font-size: 1.05em;
    letter-spacing: 0.8px;
    text-transform: uppercase;
}

tbody td {
    padding: 20px;
    border-bottom: 1px solid #E9ECEF;
    vertical-align: top;
    line-height: 1.7;
}

tbody tr:nth-child(even) {
    background: #FAFBFC;
}

tbody tr:hover {
    background: #F1F3F5;
    transition: background 0.3s ease;
}

/* STATUS COMPATIBILITÉ */
.compatibility-status {
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
}

@media print {
    .compatibility-status { display: none !important; }
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
    body { padding: 20px; }
    h1 { font-size: 2.5em; padding: 25px; }
    h2 { font-size: 2em; }
    h3 { font-size: 1.5em; }
}
</style>
</head>
<body>
    <div class="compatibility-status no-print">VERSION COMPLÈTE RESTAURÉE</div>

    <main class="main-content">
{CONTENU_COMPLET}
    </main>

    <footer style="text-align: center; margin-top: 4em; padding: 2em; border-top: 3px solid var(--orange-accent);">
        <p><strong>CARNIVAUTE</strong> - Excellence Culinaire Carnivore</p>
        <p><em>Science • Nutrition • Saveurs Authentiques</em></p>
        <p style="font-size: 0.9em; color: var(--gris-moyen); margin-top: 1em;">Version Complète Restaurée avec Pagination Professionnelle</p>
    </footer>

</body>
</html>'''

# Remplacer le placeholder par le contenu complet
html_final = template_html.replace('{CONTENU_COMPLET}', contenu_complet)

# Sauvegarder le fichier final
with codecs.open(r'C:\Users\Brujah\Documents\GitHub\Carnivaute\CARNIVAUTE_COMPLET_RESTAURE.html', 'w', encoding='utf-8') as f:
    f.write(html_final)

print('LIVRE COMPLET RESTAURE!')
print(f'Taille finale: {len(html_final)} caractères')
print('Fichier sauvé: CARNIVAUTE_COMPLET_RESTAURE.html')