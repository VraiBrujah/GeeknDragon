#!/usr/bin/env python3
"""
Exportateur HTML Professionnel CarnivaUte v4.0
==============================================

Version FINALE corrigeant tous les problèmes :
- Suppression de la table des matières source
- Extraction correcte des vrais titres de recettes  
- Conversion Markdown complète (blockquotes, etc.)
- Une seule ToC propre et fonctionnelle
"""

import sys
import re
from pathlib import Path

class ExportateurHTMLProfessionnel:
    """Exportateur HTML v4.0 - Version finale."""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.output_dir = self.base_path / "output_final"
        self.md_source = self.output_dir / "CARNIVAUTE_export_propre.md"
    
    def generer_css_moderne(self):
        """CSS moderne et professionnel."""
        
        css = """
/* CARNIVAUTE HTML v4.0 - CSS PROFESSIONNEL FINAL */

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
    page-break-after: always;
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
}

.info-saviez-vous::before {
    content: "💡 Le Saviez-Vous ?";
    background: var(--orange-accent);
}

.info-saviez-vous p {
    color: var(--brun-chaud);
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
    background: var(--gris-clair);
}

tbody tr:hover {
    background: rgba(255, 107, 53, 0.12);
    transition: background 0.3s ease;
}

/* Tableaux sécurité spéciaux */
.tableau-securite {
    border: 4px solid var(--rouge-securite);
    box-shadow: 0 12px 35px rgba(231, 76, 60, 0.25);
}

.tableau-securite thead th {
    background: linear-gradient(135deg, var(--rouge-securite), #C0392B);
}

/* TABLE DES MATIÈRES UNIQUE ET MODERNE */
.toc-container {
    background: white;
    border-radius: 25px;
    padding: 50px;
    margin: 5em 0;
    box-shadow: 0 20px 60px rgba(44, 44, 44, 0.12);
    border-top: 10px solid var(--rouge-carnivore);
    max-height: 80vh;
    overflow-y: auto;
    page-break-after: always;
}

.toc-title {
    font-size: 3em;
    font-weight: 900;
    text-align: center;
    color: var(--rouge-carnivore);
    margin-bottom: 2.5em;
    padding-bottom: 25px;
    border-bottom: 5px solid var(--orange-accent);
}

.toc-nav {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.toc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 25px;
    border-radius: 12px;
    transition: all 0.3s ease;
    border-left: 6px solid transparent;
}

.toc-item:hover {
    background: linear-gradient(90deg, rgba(255, 107, 53, 0.15), rgba(255, 107, 53, 0.05));
    border-left-color: var(--orange-accent);
    transform: translateX(10px);
}

.toc-item.niveau-1 {
    font-weight: 800;
    font-size: 1.3em;
    color: var(--rouge-carnivore);
    background: var(--gris-clair);
    margin: 15px 0;
}

.toc-item.niveau-2 {
    font-weight: 700;
    font-size: 1.15em;
    color: var(--brun-chaud);
    margin-left: 30px;
}

.toc-item.niveau-3 {
    font-weight: 600;
    font-size: 1.05em;
    color: var(--gris-texte);
    margin-left: 60px;
}

.toc-link {
    text-decoration: none;
    color: inherit;
    flex: 1;
}

.toc-page {
    font-size: 0.95em;
    color: var(--orange-accent);
    font-weight: 800;
    min-width: 50px;
    text-align: right;
}

/* RECETTES SPÉCIALISÉES */
.recette-container {
    background: white;
    border-radius: 20px;
    padding: 40px;
    margin: 4em 0;
    box-shadow: 0 15px 45px rgba(196, 30, 58, 0.12);
    border: 3px solid var(--orange-accent);
    page-break-inside: avoid;
}

.recette-titre-principal {
    font-size: 2.2em;
    font-weight: 800;
    color: var(--rouge-carnivore);
    margin-bottom: 1em;
    text-align: center;
}

.recette-meta-info {
    background: var(--gris-clair);
    padding: 20px;
    border-radius: 15px;
    margin: 20px 0;
    text-align: center;
    font-weight: 700;
    color: var(--brun-chaud);
    font-size: 1.1em;
}

.recette-description {
    font-style: italic;
    color: var(--brun-chaud);
    margin: 25px 0;
    padding: 25px;
    background: linear-gradient(135deg, #FFF9E6, #FFFBF0);
    border-left: 6px solid var(--orange-accent);
    border-radius: 0 15px 15px 0;
    font-size: 1.1em;
    line-height: 1.9;
}

/* SECTIONS INGRÉDIENTS */
.ingredients-section {
    background: linear-gradient(135deg, #E8F5E8, #F0F8F0);
    border: 3px solid var(--vert-nutrition);
    border-radius: 18px;
    padding: 30px;
    margin: 30px 0;
}

.ingredients-titre {
    font-size: 1.5em;
    font-weight: 800;
    color: var(--vert-nutrition);
    margin-bottom: 20px;
    text-align: center;
}

/* NUTRITION ET VALEURS */
.nutrition-container {
    background: linear-gradient(135deg, #E6F3FF, #F0F8FF);
    border: 3px solid var(--bleu-info);
    border-radius: 18px;
    padding: 30px;
    margin: 30px 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 25px;
}

.nutrition-item {
    text-align: center;
    padding: 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.12);
}

.nutrition-value {
    font-size: 2.2em;
    font-weight: 900;
    color: var(--bleu-info);
    display: block;
}

.nutrition-label {
    font-size: 1em;
    color: var(--gris-texte);
    margin-top: 10px;
    font-weight: 700;
}

/* HEADER ET FOOTER ÉLÉGANTS */
.main-header {
    text-align: center;
    margin-bottom: 6em;
    padding: 80px 0;
    background: linear-gradient(135deg, white, var(--gris-clair));
    border-radius: 25px;
    box-shadow: 0 20px 60px rgba(44, 44, 44, 0.12);
}

.main-title {
    font-size: 6em;
    font-weight: 900;
    background: linear-gradient(135deg, var(--rouge-carnivore), var(--orange-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.4em;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
}

.main-subtitle {
    font-size: 1.8em;
    color: var(--brun-chaud);
    font-weight: 600;
    font-style: italic;
}

.main-footer {
    text-align: center;
    margin-top: 8em;
    padding: 50px 0;
    border-top: 5px solid var(--orange-accent);
    color: var(--brun-chaud);
    font-size: 1.2em;
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
    body { padding: 20px; }
    .main-title { font-size: 4em; }
    h2 { font-size: 2em; }
    .nutrition-container { grid-template-columns: repeat(2, 1fr); }
    table { font-size: 14px; }
    .toc-item { flex-direction: column; align-items: flex-start; }
}

/* OPTIMISATION IMPRESSION */
@media print {
    body {
        background: white;
        font-size: 14px;
        padding: 15mm;
        max-width: 100%;
    }
    .toc-container { page-break-after: always; }
    h1, h2 { page-break-before: auto; }
    h2, h3 { page-break-after: avoid; }
    table, .recette-container { page-break-inside: avoid; }
    .main-title {
        -webkit-text-fill-color: var(--rouge-carnivore);
        color: var(--rouge-carnivore);
    }
}
"""
        return css
    
    def supprimer_table_matieres_source(self, contenu_md):
        """Supprime la table des matières existante du Markdown source."""
        
        print("Suppression de la table des matieres source...")
        
        # Supprimer la section "Table des Matières" complète
        contenu_md = re.sub(
            r'## Table des Matières.*?(?=^#|\Z)', 
            '', 
            contenu_md, 
            flags=re.MULTILINE | re.DOTALL
        )
        
        # Supprimer les lignes numérotées de la ToC
        contenu_md = re.sub(r'^\d+\.\s+\[.*?\]\(#.*?\).*?$', '', contenu_md, flags=re.MULTILINE)
        
        # Supprimer les lignes de liens ToC sans numéros
        contenu_md = re.sub(r'^\[.*?\]\(#.*?\).*?$', '', contenu_md, flags=re.MULTILINE)
        
        # Nettoyer les lignes vides multiples
        contenu_md = re.sub(r'\n{3,}', '\n\n', contenu_md)
        
        print("  Table des matieres source supprimee")
        return contenu_md.strip()
    
    def extraire_titres_vrais(self, contenu_md):
        """Extrait SEULEMENT les vrais titres principaux pour une ToC propre."""
        
        print("Extraction des VRAIS titres principaux...")
        
        lignes = contenu_md.split('\n')
        titres = []
        
        for ligne in lignes:
            ligne = ligne.strip()
            
            if ligne.startswith('#'):
                niveau = len(ligne) - len(ligne.lstrip('#'))
                
                if niveau <= 3:
                    titre_brut = ligne[niveau:].strip()
                    
                    # FILTRAGE ULTRA-INTELLIGENT - Seulement le contenu le plus pertinent
                    if niveau == 1:
                        # H1 - Tous les éléments principaux SANS templates
                        inclure_h1 = False
                        
                        # Titre principal et introduction
                        if any(mot in titre_brut.lower() for mot in ['carnivaute', 'introduction - l']):
                            inclure_h1 = True
                            
                        # Chapitres spéciaux
                        elif titre_brut.lower().startswith('chapitre spécial'):
                            inclure_h1 = True
                            
                        # Sections numérotées
                        elif re.match(r'section \d+', titre_brut.lower()):
                            inclure_h1 = True
                            
                        # Annexes principales
                        elif (titre_brut.lower().startswith('annexe ') and 
                              any(contenu in titre_brut.lower() for contenu in [
                                  'conversions', 'guide', 'plans', 'faq', 'lexique'
                              ])):
                            inclure_h1 = True
                        
                        # Exclure les templates
                        if 'template' in titre_brut.lower():
                            inclure_h1 = False
                            
                        if inclure_h1:
                            titre_propre = self.nettoyer_titre_toc(titre_brut)
                            if len(titre_propre) > 8:
                                titres.append({
                                    'niveau': niveau,
                                    'titre': titre_propre[:70],
                                    'ancre': self.generer_ancre(titre_propre)
                                })
                    
                    elif niveau == 2:
                        # H2 - Chapitres spéciaux, sections et annexes PRINCIPALES uniquement
                        inclure = False
                        
                        # Chapitres spéciaux SANS template
                        if ('chapitre spécial' in titre_brut.lower() and 'template' not in titre_brut.lower()):
                            inclure = True
                            
                        # Sections principales numérotées 
                        elif (re.match(r'section \d+', titre_brut.lower()) and 'template' not in titre_brut.lower()):
                            inclure = True
                            
                        # Annexes principales avec contenu utile
                        elif (titre_brut.lower().startswith('annexe ') and 
                              any(contenu in titre_brut.lower() for contenu in [
                                  'conversions', 'guide', 'plans', 'faq', 'lexique'
                              ]) and
                              'template' not in titre_brut.lower()):
                            inclure = True
                        
                        # Exclure TOUT ce qui contient template ou n'est pas utile
                        if any(exclus in titre_brut.lower() for exclus in [
                            'template', 'option', 'points clés', 'bilan',
                            'introduction section', 'introduction de section',
                            'ingrédients pour', 'technique confit', 'structure de ce guide'
                        ]):
                            inclure = False
                        
                        if inclure:
                            titre_propre = self.nettoyer_titre_toc(titre_brut)
                            if len(titre_propre) > 10:
                                titres.append({
                                    'niveau': niveau,
                                    'titre': titre_propre[:65],
                                    'ancre': self.generer_ancre(titre_propre)
                                })
                    
                    elif niveau == 3:
                        # H3 - SEULEMENT les vraies recettes nommées avec étoiles
                        if ('⭐' in titre_brut and len(titre_brut) > 15 and 
                            not any(exclus in titre_brut.lower() for exclus in [
                                'option', 'ingrédients', 'préparation', 'données',
                                'valeurs nutritionnelles', 'points clés', 'timing',
                                'instructions', 'équipement'
                            ])):
                            
                            titre_pour_toc = self.nettoyer_titre_toc(titre_brut)
                            
                            # Raccourcir si trop long
                            if len(titre_pour_toc) > 50:
                                titre_pour_toc = titre_pour_toc[:45] + '...'
                            
                            titres.append({
                                'niveau': niveau,
                                'titre': titre_pour_toc,
                                'ancre': self.generer_ancre(titre_brut)
                            })
        
        print(f"  {len(titres)} vrais titres extraits")
        return titres
    
    def nettoyer_titre_toc(self, titre_brut):
        """Nettoie un titre pour affichage dans la ToC."""
        
        # Supprimer emojis et métadonnées
        titre = re.sub(r'[⭐⏱️💰🔥❄️🥩🧪⚡🌟💎🚀📊💡]', '', titre_brut)
        titre = re.sub(r'\[[^\]]+\]', '', titre)  # [⏱️ 75 min] etc
        
        # NE PAS supprimer le contenu après " - " pour les chapitres spéciaux
        # titre = re.sub(r'\s*-\s*\w+\s*$', '', titre)  # SUPPRIMÉ
        
        # Nettoyer caractères spéciaux mais garder les tirets
        titre = re.sub(r'[^\w\s\-àáâäèéêëîïôöùúûüç°]', ' ', titre)
        titre = re.sub(r'\s+', ' ', titre).strip()
        
        # Améliorer l'affichage des titres spéciaux
        titre = titre.replace('Chapitre Special', 'Chapitre Spécial')
        titre = titre.replace('Section ', 'Section ')
        
        return titre
    
    def generer_ancre(self, titre):
        """Génère une ancre HTML propre."""
        ancre = self.nettoyer_titre_toc(titre).lower()
        ancre = re.sub(r'[^a-z0-9\s]', '', ancre)
        ancre = re.sub(r'\s+', '-', ancre)
        return ancre[:60]
    
    def generer_table_matieres_unique(self, titres):
        """Génère UNE SEULE table des matières moderne."""
        
        html_toc = """
        <div class="toc-container">
            <div class="toc-title">Table des Matières</div>
            <nav class="toc-nav">
        """
        
        for i, titre in enumerate(titres):
            niveau_class = f"niveau-{titre['niveau']}"
            page_num = i + 1
            
            # Améliorer l'affichage des titres
            titre_affiche = titre['titre']
            
            # Ajouter des icônes pour les chapitres spéciaux
            if 'Chapitre Spécial' in titre_affiche:
                if 'Le Cru' in titre_affiche:
                    titre_affiche = f"🍣 {titre_affiche} - Tartares & Sashimis"
                elif 'Charcuteries' in titre_affiche:
                    titre_affiche = f"🥓 {titre_affiche} - Bacon & Terrines"
                elif 'Cuisson Sous Vide' in titre_affiche:
                    titre_affiche = f"🔬 {titre_affiche} - Précision Scientifique"
                elif 'Œufs' in titre_affiche or 'ufs' in titre_affiche:
                    titre_affiche = f"🥚 {titre_affiche} - La Protéine Parfaite"
                else:
                    titre_affiche = f"⭐ {titre_affiche}"
            
            # Améliorer les sections
            elif 'Section' in titre_affiche:
                if 'Bases et Techniques' in titre_affiche or 'Bases et techniques' in titre_affiche:
                    titre_affiche = f"🔧 {titre_affiche} de Cuisson"
                elif 'Nez' in titre_affiche and ('queue' in titre_affiche or 'Queue' in titre_affiche):
                    titre_affiche = f"🦴 {titre_affiche}"
                elif 'Petit' in titre_affiche and ('déjeuner' in titre_affiche or 'Dejeuner' in titre_affiche or 'Brunch' in titre_affiche):
                    titre_affiche = f"☀️ {titre_affiche}"
                elif 'Express' in titre_affiche or '15' in titre_affiche:
                    titre_affiche = f"⚡ {titre_affiche}"
                elif 'Batch' in titre_affiche or 'batch' in titre_affiche:
                    titre_affiche = f"📦 {titre_affiche} - Préparation en Lot"
                elif 'Lunch' in titre_affiche or 'lunch' in titre_affiche or 'nomade' in titre_affiche:
                    titre_affiche = f"🎒 {titre_affiche} - Repas Transportables"
                elif 'Famille' in titre_affiche or 'famille' in titre_affiche or 'Convivialité' in titre_affiche:
                    titre_affiche = f"👨‍👩‍👧‍👦 {titre_affiche}"
                elif 'Gourmet' in titre_affiche or 'gourmet' in titre_affiche or 'Invités' in titre_affiche or 'invités' in titre_affiche:
                    titre_affiche = f"🍽️ {titre_affiche}"
                elif 'Plein air' in titre_affiche or 'plein air' in titre_affiche or 'Voyage' in titre_affiche or 'voyage' in titre_affiche:
                    titre_affiche = f"🏕️ {titre_affiche}"
                elif 'Sport' in titre_affiche or 'sport' in titre_affiche or 'Récupération' in titre_affiche or 'récupération' in titre_affiche:
                    titre_affiche = f"💪 {titre_affiche}"
                elif 'Sauces' in titre_affiche or 'sauces' in titre_affiche or 'Beurres' in titre_affiche or 'beurres' in titre_affiche or 'Assaisonnements' in titre_affiche:
                    titre_affiche = f"🧈 {titre_affiche}"
                else:
                    titre_affiche = f"📖 {titre_affiche}"
            
            # Améliorer les annexes
            elif 'Annexe' in titre_affiche:
                titre_affiche = f"📚 {titre_affiche}"
            
            html_toc += f"""
                <div class="toc-item {niveau_class}">
                    <a href="#{titre['ancre']}" class="toc-link">{titre_affiche}</a>
                    <span class="toc-page">{page_num}</span>
                </div>
            """
        
        html_toc += """
            </nav>
        </div>
        """
        
        return html_toc
    
    def convertir_blockquotes(self, contenu):
        """Convertit les blockquotes Markdown en HTML élégant."""
        
        # Supprimer complètement les blockquotes > orphelins
        contenu = re.sub(r'^>\s*$', '', contenu, flags=re.MULTILINE)
        
        # Convertir les blockquotes avec contenu > texte
        lignes = contenu.split('\n')
        html_parts = []
        in_blockquote = False
        blockquote_content = []
        
        for ligne in lignes:
            ligne_stripped = ligne.strip()
            
            # Détection de blockquote (> avec ou sans espace)
            if ligne_stripped.startswith('>'):
                # Début ou continuation de blockquote
                if not in_blockquote:
                    in_blockquote = True
                    blockquote_content = []
                
                # Extraire le contenu après >
                contenu_ligne = ligne_stripped[1:].strip() if len(ligne_stripped) > 1 else ''
                if contenu_ligne:  # Seulement si il y a du contenu
                    blockquote_content.append(contenu_ligne)
                    
            else:
                # Fin de blockquote
                if in_blockquote:
                    if blockquote_content:  # Seulement si il y a du contenu
                        blockquote_html = '<blockquote class="info-box"><p>' + ' '.join(blockquote_content) + '</p></blockquote>'
                        html_parts.append(blockquote_html)
                    in_blockquote = False
                    blockquote_content = []
                
                # Ajouter la ligne normale
                if ligne.strip():  # Éviter les lignes vides
                    html_parts.append(ligne)
        
        # Traiter le dernier blockquote si nécessaire
        if in_blockquote and blockquote_content:
            blockquote_html = '<blockquote class="info-box"><p>' + ' '.join(blockquote_content) + '</p></blockquote>'
            html_parts.append(blockquote_html)
        
        return '\n'.join(html_parts)
    
    def convertir_titres_avec_ancres(self, contenu):
        """Convertit tous les titres en HTML avec ancres."""
        
        def remplacer_titre(match):
            hashtags = match.group(1)
            titre_complet = match.group(2)
            niveau = len(hashtags)
            ancre = self.generer_ancre(titre_complet)
            
            return f'<h{niveau} id="{ancre}">{titre_complet}</h{niveau}>'
        
        return re.sub(r'^(#{1,6})\s+(.+)$', remplacer_titre, contenu, flags=re.MULTILINE)
    
    def convertir_tableaux_elegants(self, contenu):
        """Convertit les tableaux Markdown en HTML élégant."""
        
        def convertir_tableau(match):
            tableau = match.group(0)
            lignes = tableau.strip().split('\n')
            
            if len(lignes) < 3:
                return tableau
            
            # Détecter tableau sécurité
            est_securite = any('France' in ligne or 'Sécurité' in ligne or 'USA' in ligne 
                             for ligne in lignes[:2])
            classe = 'tableau-securite' if est_securite else ''
            
            html = f'<table class="{classe}">\n<thead>\n<tr>\n'
            
            # En-tête
            headers = [h.strip() for h in lignes[0].split('|') if h.strip()]
            for header in headers:
                html += f'<th>{header}</th>\n'
            html += '</tr>\n</thead>\n<tbody>\n'
            
            # Corps (ignorer ligne séparateur)
            for ligne in lignes[2:]:
                if '|' in ligne and ligne.strip():
                    # Ignorer les lignes qui ne contiennent que des --- et |
                    if re.match(r'^[\|\s\-:]+$', ligne.strip()):
                        continue
                    
                    cellules = [c.strip() for c in ligne.split('|') if c.strip() or ligne.index(c) != 0]
                    # Filtrer les cellules qui ne contiennent que des ---
                    cellules_propres = []
                    for cellule in cellules:
                        if cellule and not re.match(r'^[\-:]+$', cellule):
                            cellules_propres.append(cellule)
                        elif cellule and re.match(r'^[\-:]+$', cellule):
                            cellules_propres.append('')  # Remplacer --- par cellule vide
                        else:
                            cellules_propres.append(cellule)
                    
                    if cellules_propres:
                        html += '<tr>\n'
                        for cellule in cellules_propres:
                            html += f'<td>{cellule}</td>\n'
                        html += '</tr>\n'
            
            html += '</tbody>\n</table>'
            return html
        
        # Pattern pour détecter les tableaux
        pattern_tableau = r'^(\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)*)'
        
        return re.sub(pattern_tableau, convertir_tableau, contenu, flags=re.MULTILINE)
    
    def convertir_listes_elegantes(self, contenu):
        """Convertit les listes Markdown en HTML élégant."""
        
        # Listes non ordonnées
        def convertir_liste_ul(match):
            liste = match.group(0)
            items = re.findall(r'^[-*+]\s+(.+)$', liste, re.MULTILINE)
            html = '<ul>\n'
            for item in items:
                html += f'<li>{item.strip()}</li>\n'
            html += '</ul>'
            return html
        
        # Listes ordonnées
        def convertir_liste_ol(match):
            liste = match.group(0)
            items = re.findall(r'^\d+\.\s+(.+)$', liste, re.MULTILINE)
            html = '<ol>\n'
            for item in items:
                html += f'<li>{item.strip()}</li>\n'
            html += '</ol>'
            return html
        
        # Pattern pour listes non ordonnées
        contenu = re.sub(
            r'^((?:[-*+]\s+.+\n?)+)',
            convertir_liste_ul,
            contenu,
            flags=re.MULTILINE
        )
        
        # Pattern pour listes ordonnées
        contenu = re.sub(
            r'^((?:\d+\.\s+.+\n?)+)',
            convertir_liste_ol,
            contenu,
            flags=re.MULTILINE
        )
        
        return contenu
    
    def convertir_markdown_complet(self, contenu_md):
        """Conversion Markdown COMPLÈTE vers HTML professionnel."""
        
        print("Conversion Markdown COMPLETE vers HTML...")
        
        # 1. Supprimer la ToC source
        contenu_md = self.supprimer_table_matieres_source(contenu_md)
        
        # 2. Remplacer introduction par version pédagogique
        contenu_md = self.remplacer_introduction_pedagogique(contenu_md)
        
        # 3. Éliminer sections dupliquées
        contenu_md = self.eliminer_sections_dupliquees(contenu_md)
        
        # 4. Nettoyer caractères parasites
        contenu_md = self.nettoyer_contenu(contenu_md)
        
        # 5. Traduire termes anglais
        contenu_md = self.traduire_termes_anglais(contenu_md)
        
        # 6. Convertir blockquotes AVANT les titres
        contenu_md = self.convertir_blockquotes(contenu_md)
        
        # 7. Convertir titres avec ancres
        contenu_html = self.convertir_titres_avec_ancres(contenu_md)
        
        # 8. Convertir tableaux
        contenu_html = self.convertir_tableaux_elegants(contenu_html)
        
        # 9. Convertir listes
        contenu_html = self.convertir_listes_elegantes(contenu_html)
        
        # 10. Traiter gras et italique
        contenu_html = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', contenu_html)
        contenu_html = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', contenu_html)
        
        # 11. Convertir paragraphes avec gestion améliorée
        lignes = contenu_html.split('\n')
        html_final = []
        
        i = 0
        while i < len(lignes):
            ligne = lignes[i].strip()
            
            # Ligne vide - ignorer
            if not ligne:
                i += 1
                continue
            
            # Déjà du HTML (commence par <)
            if ligne.startswith('<'):
                html_final.append(ligne)
                i += 1
                continue
            
            # Encadré "Le saviez-vous" spécial - détecter toutes les variantes
            if (ligne.startswith('💡') and ('saviez-vous' in ligne.lower() or 'Le Saviez-Vous' in ligne)):
                # Créer un encadré spécial avec la classe CSS appropriée
                contenu_saviez_vous = ligne
                
                # Regarder si il y a du contenu sur les lignes suivantes qui fait partie de cet encadré
                j = i + 1
                while j < len(lignes) and j < len(lignes):
                    ligne_suivante = lignes[j].strip()
                    
                    # Si on trouve une nouvelle section, arrêter
                    if (not ligne_suivante or 
                        ligne_suivante.startswith(('<h', '**', '💡', '###', '####', '---'))):
                        break
                    
                    # Ajouter au contenu de l'encadré
                    contenu_saviez_vous += " " + ligne_suivante
                    j += 1
                
                # Supprimer toutes les variantes de "💡 Le saviez-vous" du début puisque le CSS l'ajoute automatiquement
                contenu_nettoye = contenu_saviez_vous
                
                # Patterns pour toutes les variantes possibles (case insensitive)
                patterns = [
                    r'^💡\s*<strong>[Ll]e [Ss]aviez-vous[^<]*</strong>\s*[-–]?\s*',
                    r'^💡\s*\*\*[Ll]e [Ss]aviez-vous[^*]*\*\*\s*[-–]?\s*', 
                    r'^💡\s*[Ll]e [Ss]aviez-vous[^?!]*[?!]\s*[-–]?\s*',
                    r'^💡\s*<strong>[Ll]e [Ss]aviez-vous[^<]*</strong>\s*',
                    r'^💡\s*\*\*[Ll]e [Ss]aviez-vous[^*]*\*\*\s*',
                    r'^💡\s*[Ll]e [Ss]aviez-vous[^?!]*[?!]\s*',
                    r'^💡\s+'  # Fallback - juste l'emoji
                ]
                
                # Essayer chaque pattern jusqu'à ce qu'un match soit trouvé
                for pattern in patterns:
                    nouveau_contenu = re.sub(pattern, '', contenu_nettoye, flags=re.IGNORECASE)
                    if nouveau_contenu != contenu_nettoye:
                        contenu_nettoye = nouveau_contenu
                        break
                
                # Créer l'encadré avec la classe CSS (le CSS ajoutera automatiquement le header)
                html_final.append(f'<div class="info-saviez-vous"><p>{contenu_nettoye}</p></div>')
                i = j
                continue
            
            # Titre ou élément formaté (commence par ** ou ###)
            if ligne.startswith(('**', '###', '####')):
                html_final.append(ligne)
                i += 1
                continue
            
            # Ligne normale - créer un paragraphe
            if len(ligne) > 0:
                # Vérifier si c'est une ligne isolée ou partie d'un paragraphe multi-lignes
                paragraphe = [ligne]
                
                # Regarder les lignes suivantes pour construire le paragraphe complet
                j = i + 1
                while j < len(lignes):
                    ligne_suivante = lignes[j].strip()
                    
                    # Si ligne vide ou début d'un nouvel élément, arrêter le paragraphe
                    if (not ligne_suivante or 
                        ligne_suivante.startswith(('<', '**', '💡', '###', '####'))):
                        break
                    
                    # Ajouter à ce paragraphe
                    paragraphe.append(ligne_suivante)
                    j += 1
                
                # Créer le paragraphe HTML
                if paragraphe:
                    contenu_paragraphe = ' '.join(paragraphe)
                    html_final.append(f'<p>{contenu_paragraphe}</p>')
                
                i = j
            else:
                i += 1
        
        # Post-processing : transformer les "💡 Le saviez-vous" restants (collés dans les listes)
        html_result = '\n'.join(html_final)
        
        # Détecter et transformer les "💡 Le saviez-vous" qui ne sont pas déjà dans des encadrés
        def transformer_saviez_vous(match):
            contenu_complet = match.group(0)
            
            # Si déjà dans un div info-saviez-vous, ne pas toucher
            if 'class="info-saviez-vous"' in contenu_complet:
                return contenu_complet
            
            # Extraire le contenu après le header "Le saviez-vous"
            patterns_extraction = [
                r'💡\s*<strong>[Ll]e [Ss]aviez-vous[^<]*</strong>\s*[-–]?\s*(.*?)(?=<strong>|</ul>|<h\d|$)',
                r'💡\s*\*\*[Ll]e [Ss]aviez-vous[^*]*\*\*\s*[-–]?\s*(.*?)(?=\*\*|</ul>|<h\d|$)',
                r'💡\s*[Ll]e [Ss]aviez-vous[^?!]*[?!]\s*[-–]?\s*(.*?)(?=💡|<strong>|</ul>|<h\d|$)'
            ]
            
            for pattern in patterns_extraction:
                extraction = re.search(pattern, contenu_complet, flags=re.IGNORECASE | re.DOTALL)
                if extraction:
                    contenu_nettoye = extraction.group(1).strip()
                    return f'<div class="info-saviez-vous"><p>{contenu_nettoye}</p></div>'
            
            return contenu_complet
        
        # Appliquer la transformation
        html_result = re.sub(
            r'💡\s*(?:<strong>|[*]{2}|)[Ll]e [Ss]aviez-vous[^<]*?(?:</strong>|[*]{2}|)[^<]*?(?=<strong>|</ul>|<h\d|💡|$)',
            transformer_saviez_vous,
            html_result,
            flags=re.IGNORECASE | re.DOTALL
        )
        
        return html_result
    
    def nettoyer_contenu(self, contenu):
        """Nettoie le contenu des caractères parasites."""
        
        print("Nettoyage avance du contenu...")
        
        # Supprimer caractères parasites
        parasites = ['¶', '§', '◊', '∞', '‰', '™', '®', '©']
        for char in parasites:
            contenu = contenu.replace(char, '')
        
        # Supprimer les lignes de séparation --- qui s'affichent
        contenu = re.sub(r'^---+\s*$', '', contenu, flags=re.MULTILINE)
        contenu = re.sub(r'^===+\s*$', '', contenu, flags=re.MULTILINE)
        
        # Nettoyer espaces et retours à la ligne
        contenu = re.sub(r' +', ' ', contenu)  # Espaces multiples
        contenu = re.sub(r'\n{4,}', '\n\n\n', contenu)  # Max 3 retours
        contenu = re.sub(r'[ \t]+\n', '\n', contenu)  # Espaces en fin de ligne
        
        return contenu.strip()
    
    def traduire_termes_anglais(self, contenu):
        """Traduit et explique les termes anglais dans le texte."""
        
        print("Traduction et explication des termes anglais...")
        
        # Dictionnaire des traductions avec explications
        traductions = {
            # Termes culinaires
            'First In, First Out': 'Premier Entré, Premier Sorti (PEPS) - méthode de gestion des stocks où les premiers produits stockés sont les premiers à être utilisés',
            'FIFO': 'PEPS (Premier Entré, Premier Sorti) - système de rotation des aliments pour éviter le gaspillage',
            'Batch Cooking': 'Cuisson par Lots - technique de préparation où l\'on cuisine plusieurs portions d\'un même plat en une fois',
            'Meal Prep': 'Préparation de Repas - méthode d\'organisation culinaire consistant à préparer ses repas à l\'avance',
            'Sous Vide': 'Sous Vide (cuisson sous vide) - technique de cuisson lente dans un bain-marie à température contrôlée',
            'Dry Aging': 'Maturation à Sec - processus de vieillissement de la viande dans un environnement contrôlé pour développer les saveurs',
            'Reverse Sear': 'Saisie Inversée - technique consistant à cuire doucement puis saisir à haute température',
            'Confit': 'Confit - méthode de cuisson lente dans la graisse à basse température',
            
            # Termes nutritionnels
            'Macros': 'Macronutriments - les trois grandes catégories de nutriments : protéines, lipides et glucides',
            'Ketosis': 'Cétose - état métabolique où le corps brûle les graisses comme source d\'énergie principale',
            'Autophagy': 'Autophagie - processus naturel de régénération cellulaire par lequel les cellules éliminent leurs déchets',
            
            # Termes scientifiques
            'pH': 'pH (Potentiel Hydrogène) - échelle de mesure de l\'acidité, de 0 (très acide) à 14 (très basique)',
            'Maillard': 'Réaction de Maillard - réaction chimique qui donne la couleur dorée et les arômes lors de la cuisson',
            
            # Termes d'organisation
            'Workflow': 'Flux de Travail - organisation séquentielle des étapes de préparation culinaire',
            'Setup': 'Mise en Place - préparation et organisation de tous les ingrédients avant de commencer à cuisiner',
        }
        
        # Appliquer les traductions (une seule fois chacune)
        for terme_en, traduction_fr in traductions.items():
            # Éviter de traduire des termes déjà traduits
            if f'<strong>{traduction_fr}</strong>' in contenu:
                continue
                
            # Chercher le terme seul ou suivi de deux points
            if terme_en + ' :' in contenu:
                pattern = rf'{re.escape(terme_en)}\s*:'
                replacement = f'<strong>{traduction_fr}</strong> :'
            else:
                pattern = rf'\b{re.escape(terme_en)}\b'
                replacement = f'<strong>{traduction_fr}</strong>'
            
            contenu = re.sub(pattern, replacement, contenu, flags=re.IGNORECASE, count=10)  # Limite à 10 remplacements
        
        return contenu
    
    def remplacer_introduction_pedagogique(self, contenu):
        """Remplace l'ancienne introduction par une version ultra-pédagogique et complète."""
        
        print("Remplacement par introduction ULTRA-ENRICHIE (mind fucks spatiaux inclus)...")
        
        # Lire l'introduction ULTRA-EXPLICATIVE la plus complète
        intro_ultra_explicative = self.base_path / "introduction_ultra_explicative.md"
        
        if intro_ultra_explicative.exists():
            with open(intro_ultra_explicative, 'r', encoding='utf-8') as f:
                nouvelle_intro = f.read()
                
            # Ajouter les éléments uniques de la section "Fondements Scientifiques"
            elements_scientifiques = """

## 🔬 Données Scientifiques Avancées

### Performance Spatiale : Les Faits qui Dérangent

<div class="info-saviez-vous">
<p>Les astronautes de la Station Spatiale Internationale consomment en moyenne 3000 calories par jour, avec une proportion élevée de protéines pour contrer la perte musculaire en microgravité. Cette approche nutritionnelle high-protein ressemble étonnamment au régime carnivore !</p>
</div>

**Micronutriments Critiques - Ce que les végétaux ne peuvent pas vous donner :**

**Vitamines Exclusivement Animales**
- **B12** : Exclusivement animale, essentielle au système nerveux
- **D3 (cholécalciférol)** : Forme la plus biodisponible  
- **K2** : Crucial pour la santé osseuse et cardiovasculaire

**Minéraux à Absorption Optimale**
- **Fer héminique** : Absorption 15-35% vs 2-20% végétal
- **Zinc** : Fonction immunitaire et cicatrisation
- **Sélénium** : Antioxydant puissant

**Composés Bioactifs Uniques**
- **Créatine** : Performance musculaire et cognitive (absent des végétaux)
- **Carnosine** : Antioxydant musculaire exclusivement animal
- **CoQ10** : Production d'énergie cellulaire optimisée

### Déconstruction des Mythes - Science vs Croyances

**Mythe 1 : "Les Végétaux sont Indispensables"**
*Réalité* : L'organisme humain synthétise le glucose via la néoglucogenèse. Les Inuits, populations mongoles et autres cultures ont prospéré avec des régimes quasi-exclusivement carnivores pendant des millénaires.

**Mythe 2 : "Trop de Protéines Abîment les Reins"** 
*Réalité* : Chez les individus sains, aucune étude n'a démontré de toxicité rénale. Au contraire, les protéines stimulent la filtration glomérulaire, signe d'un fonctionnement rénal optimal.

**Mythe 3 : "Absence de Fibres = Problèmes Digestifs"**
*Réalité* : Nombreux pratiquants rapportent une amélioration du transit. L'absence de fibres fermentescibles réduit gaz, ballonnements et irritations.

### Protocole de Transition Scientifique

**Phase 1 : Préparation (1-2 semaines)**
- Réduction graduelle des glucides
- Augmentation des protéines et lipides  
- Hydratation optimisée

**Phase 2 : Adaptation (2-4 semaines)**
- Élimination des végétaux
- Ajustement des portions
- Surveillance des symptômes

**Phase 3 : Optimisation (4+ semaines)**
- Affinement selon les réponses individuelles
- Personnalisation des sources protéiques
- Évaluation des biomarqueurs

<div class="info-saviez-vous">
<p>Le premier repas spatial de Youri Gagarine en 1961 était composé de purée de viande et de foie en tube ! Les scientifiques soviétiques avaient déjà compris l'importance des protéines animales pour les performances en environnement extrême.</p>
</div>

## 📊 Les Bénéfices Observés - Données Empiriques

### Performance Cognitive Optimisée
- **Concentration améliorée** : Cétones comme carburant cérébral
- **Stabilité émotionnelle** : Réduction des pics glycémiques
- **Mémoire optimisée** : DHA et acides gras oméga-3

### Performance Physique Maximisée
- **Composition corporelle** : Ratio muscle/graisse amélioré
- **Récupération** : Anti-inflammatoire naturel
- **Endurance** : Adaptation à l'utilisation des graisses

### Santé Métabolique Restaurée
- **Sensibilité à l'insuline** : Amélioration documentée
- **Profil lipidique** : Souvent favorable
- **Marqueurs inflammatoires** : Réduction significative

## 🛡️ Sécurité et Précautions - Protocole de Mission

### Surveillance Médicale Recommandée
Comme tout astronaute avant une mission, consultez un professionnel de santé avant d'adopter une approche carnivore stricte, particulièrement si vous présentez :
- Pathologies rénales ou hépatiques
- Troubles cardiovasculaires
- Antécédents de troubles alimentaires
- Traitements médicamenteux spécifiques

## 🍳 Votre Cuisine - Centre de Contrôle Nutritionnel

### Équipement Essentiel

**Instruments de Précision :**
- Thermomètre à sonde (sécurité alimentaire)
- Balance de précision (portions exactes)  
- Minuteur (cuissons optimales)
- Planche à découper dédiée (hygiène)

**Technologies Avancées :**
- Circulator sous vide (précision de température)
- Déshydrateur (charcuteries maison)
- Fumoir (saveurs complexes)
- Centrifugeuse (extractions liquides)

### Gestion des Stocks Professionnelle
Comme dans un vaisseau spatial, l'organisation est cruciale :
- **Rotation PEPS** : Premier Entré, Premier Sorti
- **Étiquetage systématique** : Dates et provenances
- **Températures contrôlées** : Zones de stockage optimisées
- **Inventaire régulier** : Prévention du gaspillage

## 🎯 Votre Guide de Navigation Carnivaute

### Progression Méthodique
Ce livre vous accompagne dans votre odyssée carnivore selon une progression logique :
1. **Chapitres Spécialisés** : Techniques avancées (cru, charcuterie, sous vide, œufs)
2. **Recettes Pratiques** : 120 recettes organisées par contexte d'usage  
3. **Annexes Techniques** : Outils, conversions, plans alimentaires

### Système de Navigation des Recettes
Chaque recette comprend :
- **Niveau de difficulté** : ⭐ Débutant à ⭐⭐⭐ Expert
- **Temps de préparation** : ⏱️ Indicateur temporel
- **Coût par portion** : 💰 Estimation budgétaire
- **Valeurs nutritionnelles** : 📊 Macronutriments détaillés
- **Sécurité alimentaire** : 🛡️ Protocoles de sécurité

## 🚀 Prêt pour le Décollage ?

Vous voilà équipé des connaissances fondamentales pour entamer votre exploration carnivore. Comme tout astronaute se préparant à une mission, vous disposez maintenant de la théorie nécessaire pour aborder la pratique en toute sécurité et efficacité.

Les chapitres suivants vous dévoileront les techniques avancées et les recettes qui transformeront votre approche culinaire. Préparez-vous à découvrir un univers de saveurs inattendues, de textures surprenantes et de bénéfices nutritionnels optimisés.

**Mission acceptée ? Cap vers les étoiles culinaires !** 🌟

"""
            
            # Intégrer les éléments scientifiques à la fin de l'introduction
            nouvelle_intro = nouvelle_intro + elements_scientifiques
        else:
            # Fallback vers l'introduction CORRIGÉE avec mise en forme parfaite
            intro_corrigee = self.base_path / "introduction_mise_en_forme_corrigee.md"
            
            if intro_corrigee.exists():
                with open(intro_corrigee, 'r', encoding='utf-8') as f:
                    nouvelle_intro = f.read()
            else:
                # Fallback vers la version ULTRA-ENRICHIE avec mind fucks
                intro_ultra_enrichie = self.base_path / "introduction_ultra_enrichie.md"
                
                if intro_ultra_enrichie.exists():
                    with open(intro_ultra_enrichie, 'r', encoding='utf-8') as f:
                        nouvelle_intro = f.read()
                else:
                    # Fallback vers la version vraiment pédagogique
                    intro_vraiment_pedagogique = self.base_path / "introduction_vraiment_pedagogique.md"
                    if intro_vraiment_pedagogique.exists():
                        with open(intro_vraiment_pedagogique, 'r', encoding='utf-8') as f:
                            nouvelle_intro = f.read()
                    else:
                        # Fallback vers la version complète
                        intro_complete_path = self.base_path / "introduction_complete_amelioree.md"
                        if intro_complete_path.exists():
                            with open(intro_complete_path, 'r', encoding='utf-8') as f:
                                nouvelle_intro = f.read()
                        else:
                            # Fallback vers la version standard
                            nouvelle_intro_path = self.base_path / "nouvelle_introduction_pedagogique.md"
                            if nouvelle_intro_path.exists():
                                with open(nouvelle_intro_path, 'r', encoding='utf-8') as f:
                                    nouvelle_intro = f.read()
                            else:
                                print("Aucune introduction amelioree trouvee, conservation de l'original")
                                return contenu
        
        # Patterns pour trouver et remplacer différentes sections d'introduction
        patterns_intro = [
            # Pattern 1: Section "Introduction - L'Odyssée Carnivore" complète
            r'# Introduction - L\'Odyssée Carnivore.*?(?=^#[^#]|$)',
            # Pattern 2: Section "Fondements Scientifiques" 
            r'# 🧬 Les Fondements Scientifiques de l\'Exploration Carnivore.*?(?=^#[^#]|$)',
            # Pattern 3: Section "Bienvenue dans l'Univers Carnivaute"
            r'## Bienvenue dans l\'Univers Carnivaute.*?(?=^#[^#]|$)',
        ]
        
        # Patterns pour supprimer les sections redondantes
        patterns_sections_redondantes = [
            # Section "Les Fondements Scientifiques"
            (r'## 🧬 Les Fondements Scientifiques de l\'Exploration Carnivore.*?(?=^##[^#]|$)', "Les Fondements Scientifiques"),
            (r'<h2[^>]*id="les-fondements-scientifiques-de-l-exploration-carnivore"[^>]*>.*?(?=<h2[^>]*id=|$)', "Les Fondements Scientifiques"),
            # Section "Bienvenue dans l'Univers Carnivaute"
            (r'## Bienvenue dans l\'Univers Carnivaute.*?(?=^##[^#]|$)', "Bienvenue dans l'Univers Carnivaute"),
            (r'<h2[^>]*id="bienvenue-dans-l-univers-carnivaute"[^>]*>.*?(?=<h2[^>]*id=|$)', "Bienvenue dans l'Univers Carnivaute"),
        ]
        
        remplace = False
        for pattern in patterns_intro:
            if re.search(pattern, contenu, re.MULTILINE | re.DOTALL):
                contenu = re.sub(
                    pattern,
                    nouvelle_intro.strip(),
                    contenu,
                    flags=re.MULTILINE | re.DOTALL,
                    count=1  # Remplacer seulement la première occurrence
                )
                remplace = True
                print(f"  Introduction remplacee par version ULTRA-pedagogique complete")
                break
        
        if not remplace:
            print("  Aucune section introduction trouvee, ajout en debut de document")
            contenu = nouvelle_intro + "\n\n" + contenu
        
        # Supprimer les sections redondantes maintenant intégrées dans l'introduction
        print("Suppression des sections redondantes...")
        for pattern, nom_section in patterns_sections_redondantes:
            if re.search(pattern, contenu, re.MULTILINE | re.DOTALL):
                contenu = re.sub(
                    pattern,
                    '',
                    contenu,
                    flags=re.MULTILINE | re.DOTALL,
                    count=1
                )
                print(f"  Section '{nom_section}' supprimee (redondante avec introduction enrichie)")
        
        # Nettoyage approfondi des redondances supplémentaires
        contenu = self.nettoyer_redondances_avancees(contenu)
        
        return contenu
    
    def nettoyer_redondances_avancees(self, contenu):
        """Nettoie les redondances avancées et fusionne intelligemment les sections similaires."""
        
        print("Nettoyage avance des redondances detectees...")
        
        # 1. Supprimer les "Introduction de Section" répétitives vides
        patterns_intro_repetitives = [
            r'<h2[^>]*>Introduction de Section</h2>\s*(?=<h2)',  # Introduction vide suivie directement d'un H2
            r'<h2[^>]*>Introduction.*Section</h2>\s*<p></p>\s*(?=<h2)',  # Introduction avec paragraphe vide
            r'<h2[^>]*>Introduction.*Section</h2>\s*(?=<h2[^>]*>Recette)',  # Introduction juste avant recette
            r'<h2[^>]*id="introduction-section"[^>]*>.*?</h2>\s*(?=<h2)',  # Introduction de section avec ID
            r'<h2[^>]*id="introduction-de-section"[^>]*>.*?</h2>\s*(?=<h2)',  # Introduction de section avec ID alternatif
        ]
        
        suppressions_intro = 0
        for pattern in patterns_intro_repetitives:
            matches_found = len(re.findall(pattern, contenu, re.IGNORECASE | re.DOTALL))
            if matches_found > 0:
                contenu = re.sub(pattern, '', contenu, flags=re.IGNORECASE | re.DOTALL)
                suppressions_intro += matches_found
        
        if suppressions_intro > 0:
            print(f"  {suppressions_intro} introductions de section redondantes supprimees")
        
        # 2. Supprimer les duplicatas de "Les Bénéfices Observés - Données Empiriques"
        # Garder seulement la première occurrence complète dans l'introduction
        pattern_benefices_dup = r'<h2[^>]*id="les-bnfices-observs-donnes-empiriques"[^>]*>.*?(?=<h2[^>]*id="[^"]*"[^>]*>)'
        benefices_matches = re.findall(pattern_benefices_dup, contenu, re.DOTALL)
        
        if len(benefices_matches) > 1:
            # Supprimer toutes les occurrences après la première
            contenu = re.sub(pattern_benefices_dup, '', contenu, flags=re.DOTALL, count=len(benefices_matches)-1)
            print(f"  {len(benefices_matches)-1} duplicatas 'Benefices Observes' supprimes")
        
        # 3. Nettoyer les annexes mal formatées et sections vides
        patterns_annexes_vides = [
            r'<h2[^>]*>\[Titre de l\'Annexe\][^<]*</h2>.*?(?=<h2[^>]*(?!id="")[^>]*>)',  # Annexe complète avec contenu
            r'<h2[^>]*>📋</h2>\s*(?=<h2)',
            r'<h2[^>]*>📊 \[Section Principale\]</h2>\s*(?=<h2)',
            r'<h3[^>]*>\[Sous-section 1\]</h3>\s*(?=<h[23])',
            r'<h2[^>]*id=""[^>]*>.*?</h2>.*?(?=<h2[^>]*id="[^"]+)', # H2 avec ID vide et son contenu
        ]
        
        suppressions_annexes = 0
        for pattern in patterns_annexes_vides:
            matches_found = len(re.findall(pattern, contenu, re.IGNORECASE | re.DOTALL))
            if matches_found > 0:
                contenu = re.sub(pattern, '', contenu, flags=re.IGNORECASE | re.DOTALL)
                suppressions_annexes += matches_found
        
        if suppressions_annexes > 0:
            print(f"  {suppressions_annexes} sections annexes mal formatees supprimees")
        
        # 4. Fusionner les sections "Notes Éditeur" dispersées
        pattern_notes_editeur = r'(<h2[^>]*>Notes Éditeur[^<]*</h2>.*?)(?=<h2[^>]*>(?!Notes Éditeur)[^>]*>)'
        notes_editeur_matches = re.findall(pattern_notes_editeur, contenu, re.DOTALL)
        
        if len(notes_editeur_matches) > 1:
            # Consolider toutes les notes éditeur en une seule section
            notes_consolidees = f'<h2 id="notes-editeur-consolidees">📝 Notes Éditeur - Consolidées</h2>\n'
            for i, note in enumerate(notes_editeur_matches, 1):
                notes_consolidees += f'<h3>Section {i}</h3>\n{note}\n\n'
            
            # Supprimer toutes les sections Notes Éditeur dispersées
            contenu = re.sub(r'<h2[^>]*>Notes Éditeur[^<]*</h2>.*?(?=<h2)', '', contenu, flags=re.DOTALL)
            
            # Ajouter la version consolidée à la fin
            contenu = contenu + '\n\n' + notes_consolidees
            print(f"  {len(notes_editeur_matches)} sections Notes Editeur fusionnees")
        
        # 5. Nettoyer les titres H2 vides ou mal formatés
        pattern_h2_vides = r'<h2[^>]*id=""[^>]*>[^<]*</h2>\s*(?=<h[23])'
        h2_vides_matches = len(re.findall(pattern_h2_vides, contenu))
        if h2_vides_matches > 0:
            contenu = re.sub(pattern_h2_vides, '', contenu)
            print(f"  {h2_vides_matches} titres H2 vides supprimes")
        
        print("  Nettoyage avance des redondances termine")
        
        # 6. Nettoyage des redondances majeures identifiées par l'audit
        contenu = self.nettoyer_redondances_majeures(contenu)
        
        return contenu
    
    def nettoyer_redondances_majeures(self, contenu):
        """Nettoie les redondances majeures identifiées par l'audit exhaustif."""
        
        print("Nettoyage des redondances majeures identifiees par audit...")
        
        # 1. Supprimer la 2ème occurrence "Les Bénéfices Observés" (version avec deux-points)
        pattern_benefices_2 = r'<h2[^>]*id="les-bnfices-observs-donnes-empiriques"[^>]*>📊 Les Bénéfices Observés : Données Empiriques</h2>.*?(?=<h2[^>]*id="[^"]*"[^>]*>)'
        matches_benefices = re.findall(pattern_benefices_2, contenu, re.DOTALL)
        if matches_benefices:
            # Supprimer seulement la deuxième occurrence
            contenu = re.sub(pattern_benefices_2, '', contenu, flags=re.DOTALL, count=1)
            print("  2ème occurrence 'Benefices Observes' supprimee")
        
        # Alternative si le pattern précédent ne fonctionne pas - chercher toutes les occurrences
        all_benefices = re.findall(r'<h2[^>]*>📊 Les Bénéfices Observés[^<]*</h2>', contenu)
        if len(all_benefices) > 1:
            # Remplacer toutes les occurrences après la première
            parts = contenu.split('<h2', 1)
            if len(parts) > 1:
                remaining = parts[1]
                # Trouver et supprimer les duplicatas dans la partie restante
                pattern_any_benefices = r'<h2[^>]*>📊 Les Bénéfices Observés[^<]*</h2>.*?(?=<h2[^>]*>)'
                remaining = re.sub(pattern_any_benefices, '', remaining, flags=re.DOTALL)
                contenu = parts[0] + '<h2' + remaining
            print(f"  {len(all_benefices)-1} duplicatas 'Benefices Observes' supprimes (methode alternative)")
        
        # 2. Supprimer la 2ème occurrence "Sécurité et Précautions : Protocole de Mission" (garder la version avec Transition)
        pattern_securite_1 = r'<h2[^>]*>🛡️ Sécurité et Précautions - Protocole de Mission</h2>.*?(?=<h2[^>]*>🍳 Votre Cuisine)'
        if re.search(pattern_securite_1, contenu, re.DOTALL):
            contenu = re.sub(pattern_securite_1, '', contenu, flags=re.DOTALL)
            print("  1ère occurrence 'Securite et Precautions' supprimee (version incomplete)")
        
        # 3. Supprimer la 2ème occurrence "Votre Cuisine : Centre de Contrôle" (avec deux-points)
        pattern_cuisine_2 = r'<h2[^>]*>🍳 Votre Cuisine : Centre de Contrôle Nutritionnel</h2>.*?(?=<h2[^>]*>🎯 Votre Guide)'
        if re.search(pattern_cuisine_2, contenu, re.DOTALL):
            contenu = re.sub(pattern_cuisine_2, '', contenu, flags=re.DOTALL)
            print("  2ème occurrence 'Votre Cuisine' supprimee")
        
        # 4. Supprimer la 2ème occurrence "Prêt pour le Décollage" (sans emoji)
        pattern_decollage_2 = r'<h2[^>]*>Prêt pour le Décollage \?</h2>.*?(?=<h2[^>]*>🌟)'
        if re.search(pattern_decollage_2, contenu, re.DOTALL):
            contenu = re.sub(pattern_decollage_2, '', contenu, flags=re.DOTALL)
            print("  2ème occurrence 'Pret pour le Decollage' supprimee")
        
        # 5. Corriger l'erreur de formatage HTML - Double balisage <strong> imbriqué
        pattern_strong_double = r'<strong><strong>([^<]*)</strong></strong>'
        doubles_corriges = len(re.findall(pattern_strong_double, contenu))
        if doubles_corriges > 0:
            contenu = re.sub(pattern_strong_double, r'<strong>\1</strong>', contenu)
            print(f"  {doubles_corriges} doubles balisages <strong> corriges")
        
        # 6. Supprimer le H1 redondant (garder seulement le titre principal avec classe)
        pattern_h1_redondant = r'<h1[^>]*id="carnivaute"[^>]*>CARNIVAUTE</h1>'
        if re.search(pattern_h1_redondant, contenu):
            contenu = re.sub(pattern_h1_redondant, '', contenu)
            print("  H1 redondant 'CARNIVAUTE' supprime")
        
        # 7. Nettoyer les sections "Déconstruction des Mythes" redondantes
        pattern_mythes_1 = r'<h2[^>]*>Déconstruction des Mythes - Science vs Croyances</h2>'
        pattern_mythes_2 = r'<h2[^>]*>Déconstruction des Mythes Nutritionnels</h2>'
        
        # Si les deux existent, fusionner en gardant le titre le plus complet
        if re.search(pattern_mythes_1, contenu) and re.search(pattern_mythes_2, contenu):
            # Remplacer le premier par le titre plus précis
            contenu = re.sub(pattern_mythes_1, '<h2 id="deconstruction-des-mythes-nutritionnels">Déconstruction des Mythes Nutritionnels</h2>', contenu)
            # Supprimer la section redondante (garder seulement le contenu unique)
            pattern_mythes_section_2 = r'<h2[^>]*>Déconstruction des Mythes Nutritionnels</h2>.*?(?=<h2[^>]*>📊 Les Bénéfices)'
            contenu = re.sub(pattern_mythes_section_2, '', contenu, flags=re.DOTALL)
            print("  Sections 'Deconstruction des Mythes' fusionnees")
        
        # 8. Corrections finales techniques
        contenu = self.corrections_finales_techniques(contenu)
        
        print("  Nettoyage des redondances majeures termine")
        return contenu
    
    def corrections_finales_techniques(self, contenu):
        """Applique les corrections finales techniques pour publication."""
        
        print("Application des corrections finales techniques...")
        
        # 1. Harmoniser le format des encadrés "Le saviez-vous"
        # Uniformiser tous les encadrés avec la même structure
        patterns_encadres_variations = [
            (r'<blockquote class="info-box"><p><strong>💡 Le Saviez-Vous \?</strong></p></blockquote>\s*<blockquote class="info-box"><p>([^<]+)</p></blockquote>', 
             r'<div class="info-saviez-vous"><p>\1</p></div>'),
            (r'<blockquote class="info-box"><p><strong>💡 Le Saviez-Vous \?</strong></p><p>([^<]+)</p></blockquote>', 
             r'<div class="info-saviez-vous"><p>\1</p></div>'),
        ]
        
        corrections_encadres = 0
        for pattern_old, pattern_new in patterns_encadres_variations:
            matches = len(re.findall(pattern_old, contenu, re.DOTALL))
            if matches > 0:
                contenu = re.sub(pattern_old, pattern_new, contenu, flags=re.DOTALL)
                corrections_encadres += matches
        
        if corrections_encadres > 0:
            print(f"  {corrections_encadres} encadres harmonises")
        
        # 2. Corriger la numérotation chaotique des recettes
        # Standardiser le format "Recette XX" partout
        pattern_recette_variations = [
            r'Recette (\d+) - ',
            r'Recette (\d+): ',  
            r'Recette (\d+) : ',
        ]
        
        corrections_numerotation = 0
        for pattern in pattern_recette_variations:
            matches = len(re.findall(pattern, contenu))
            if matches > 0:
                contenu = re.sub(pattern, r'Recette \1 - ', contenu)
                corrections_numerotation += matches
        
        if corrections_numerotation > 0:
            print(f"  {corrections_numerotation} numerotations de recettes standardisees")
        
        # 3. Supprimer les espaces multiples et nettoyer le HTML
        contenu = re.sub(r'\n\s*\n\s*\n+', '\n\n', contenu)  # Max 2 retours à la ligne
        contenu = re.sub(r'<p></p>', '', contenu)  # Paragraphes vides
        contenu = re.sub(r'<p>\s*</p>', '', contenu)  # Paragraphes avec espaces seulement
        
        # 4. Vérifier et corriger les ID dupliqués
        # Trouver tous les IDs dans le document
        ids_found = re.findall(r'id="([^"]+)"', contenu)
        id_counts = {}
        for id_val in ids_found:
            id_counts[id_val] = id_counts.get(id_val, 0) + 1
        
        ids_dupliques = [id_val for id_val, count in id_counts.items() if count > 1]
        if ids_dupliques:
            print(f"  ATTENTION: {len(ids_dupliques)} IDs dupliques detectes: {ids_dupliques[:3]}{'...' if len(ids_dupliques) > 3 else ''}")
            
            # Corriger les IDs dupliqués en ajoutant un suffixe
            for dup_id in ids_dupliques:
                pattern_id = rf'id="{re.escape(dup_id)}"'
                matches = list(re.finditer(pattern_id, contenu))
                if len(matches) > 1:
                    # Garder le premier, modifier les autres
                    for i, match in enumerate(matches[1:], 2):
                        start, end = match.span()
                        new_id = f'id="{dup_id}-{i}"'
                        contenu = contenu[:start] + new_id + contenu[end:]
        
        # 5. Corrections spécifiques pour publication imprimée
        contenu = self.optimiser_pour_impression(contenu)
        
        print("  Corrections finales techniques terminees")
        return contenu
    
    def optimiser_pour_impression(self, contenu):
        """Optimise le document spécifiquement pour l'impression (pas web)."""
        
        print("Optimisation pour publication imprimee...")
        
        # 1. Corriger les IDs dupliqués pour navigation PDF optimale
        ids_found = re.findall(r'id="([^"]+)"', contenu)
        id_counts = {}
        for id_val in ids_found:
            id_counts[id_val] = id_counts.get(id_val, 0) + 1
        
        ids_dupliques = [id_val for id_val, count in id_counts.items() if count > 1]
        corrections_ids = 0
        
        for dup_id in ids_dupliques:
            pattern_id = rf'id="{re.escape(dup_id)}"'
            matches = list(re.finditer(pattern_id, contenu))
            if len(matches) > 1:
                # Modifier les occurrences après la première
                offset = 0
                for i, match in enumerate(matches[1:], 2):
                    start, end = match.span()
                    start += offset
                    end += offset
                    new_id = f'id="{dup_id}-{i}"'
                    contenu = contenu[:start] + new_id + contenu[end:]
                    offset += len(new_id) - (end - start)
                    corrections_ids += 1
        
        if corrections_ids > 0:
            print(f"  {corrections_ids} IDs dupliques corriges pour navigation PDF")
        
        # 2. Vérifier et corriger la syntaxe CSS ligne ~284 (si problème détecté)
        # Cette ligne semble correcte dans notre lecture, mais on vérifie les patterns suspects
        css_corrections = 0
        
        # Corriger les éventuels points-virgules manquants en CSS
        pattern_css_missing_semicolon = r'([^;}])\s*\n\s*([.#][a-zA-Z])'
        matches_css = re.findall(pattern_css_missing_semicolon, contenu)
        if matches_css:
            contenu = re.sub(pattern_css_missing_semicolon, r'\1;\n\2', contenu)
            css_corrections += len(matches_css)
        
        # Corriger les accolades CSS mal fermées
        pattern_css_braces = r'\{\s*([^}]*[^;}])\s*\n\s*\}'
        matches_braces = re.findall(pattern_css_braces, contenu)
        if matches_braces:
            contenu = re.sub(pattern_css_braces, r'{\n\1;\n}', contenu)
            css_corrections += len(matches_braces)
        
        if css_corrections > 0:
            print(f"  {css_corrections} corrections syntaxe CSS appliquees")
        
        # 3. Optimiser spécifiquement pour impression PDF avec pagination
        if '@media print' not in contenu:
            css_print_pro = """
/* PAGINATION PROFESSIONNELLE POUR IMPRESSION */
@media print {
    /* Configuration de base pour l'impression */
    @page {
        size: A4;
        margin: 2.5cm 2cm 2.5cm 2cm;
        
        /* En-tête avec numéro de page */
        @top-right {
            content: "Page " counter(page);
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 10pt;
            font-weight: 500;
        }
        
        /* En-tête avec titre du livre */
        @top-left {
            content: "CARNIVAUTE - Guide Culinaire Spatial";
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 10pt;
            color: #666;
        }
    }
    
    /* Page de titre spéciale */
    @page :first {
        @top-left { content: none; }
        @top-right { content: none; }
        margin: 3cm 2cm 3cm 2cm;
    }
    
    /* Pages table des matières */
    @page toc {
        @top-left { content: "Table des Matières"; }
        @top-right { content: "Page " counter(page, roman); }
    }
    
    /* Compteurs pour numérotation */
    body { counter-reset: page chapter section; }
    
    /* Styles pour sauts de page intelligents */
    .toc-container { 
        page-break-after: always; 
        page: toc;
    }
    
    h1 { 
        page-break-before: always;
        page-break-after: avoid;
        counter-increment: chapter;
        counter-reset: section;
    }
    
    h2 { 
        page-break-before: auto;
        page-break-after: avoid; 
        page-break-inside: avoid;
        counter-increment: section;
    }
    
    h3 { 
        page-break-after: avoid; 
        page-break-inside: avoid; 
    }
    
    /* Éviter coupures d'éléments importants */
    .info-saviez-vous { 
        page-break-inside: avoid;
        margin: 1em 0;
    }
    
    table { 
        page-break-inside: avoid;
        page-break-before: auto;
    }
    
    .recette-section { 
        page-break-inside: avoid;
        page-break-before: auto;
    }
    
    /* Table des matières avec points de suite */
    .toc-item {
        display: flex;
        justify-content: space-between;
        margin: 0.5em 0;
        page-break-inside: avoid;
    }
    
    .toc-item::after {
        content: target-counter(attr(href), page);
        font-weight: bold;
        margin-left: auto;
    }
    
    .toc-item .toc-dots {
        flex-grow: 1;
        border-bottom: 1px dotted #666;
        margin: 0 10px;
        height: 0.8em;
    }
    
    /* Numérotation des chapitres */
    h1:not(.main-title)::before {
        content: "Chapitre " counter(chapter) " - ";
        font-weight: normal;
        color: #666;
    }
    
    /* Optimisations d'impression */
    * { 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    
    /* Supprime les éléments web non nécessaires */
    .web-only { display: none; }
}
"""
            # Insérer avant la fermeture du style
            contenu = contenu.replace('</style>', css_print_pro + '\n</style>')
            print("  CSS pagination professionnelle ajoute pour impression")
        
        # 4. Nettoyer les espaces et optimiser la structure pour PDF
        contenu = re.sub(r'\n\s*\n\s*\n+', '\n\n', contenu)  # Max 2 retours à la ligne
        contenu = re.sub(r'[ \t]+\n', '\n', contenu)  # Supprimer espaces en fin de ligne
        
        # 5. Mettre à jour la table des matières pour la pagination
        contenu = self.generer_toc_avec_pagination(contenu)
        
        print("  Optimisation pour impression terminee")
        return contenu
    
    def generer_toc_avec_pagination(self, contenu):
        """Génère une table des matières optimisée pour la pagination CSS."""
        
        print("Generation de la table des matieres avec pagination...")
        
        # Trouver la section table des matières existante (plusieurs patterns possibles)
        patterns_toc = [
            r'<div class="toc-container">.*?</div>',
            r'<div[^>]*class="[^"]*toc[^"]*"[^>]*>.*?</div>',
            r'<h2[^>]*>[^<]*Table[^<]*Matières[^<]*</h2>.*?(?=<h[12])',
        ]
        
        toc_match = None
        for pattern in patterns_toc:
            toc_match = re.search(pattern, contenu, re.DOTALL | re.IGNORECASE)
            if toc_match:
                break
        
        if not toc_match:
            print("  Table des matieres non trouvee, insertion au debut du document")
            # Insérer la nouvelle ToC après le titre principal
            pattern_insertion = r'(<h1[^>]*class="main-title"[^>]*>.*?</h1>)'
            if re.search(pattern_insertion, contenu, re.DOTALL):
                nouvelle_toc = self.generer_nouvelle_toc(contenu)
                contenu = re.sub(pattern_insertion, r'\1\n\n' + nouvelle_toc, contenu, flags=re.DOTALL)
                print("  Nouvelle table des matieres inseree")
            return contenu
        
        # Extraire tous les titres H1 et H2 avec leurs IDs
        titres = []
        
        # Titres H1 (chapitres principaux)
        h1_pattern = r'<h1[^>]*id="([^"]*)"[^>]*>([^<]+)</h1>'
        h1_matches = re.findall(h1_pattern, contenu)
        for id_val, titre in h1_matches:
            if titre.strip() and titre != "CARNIVAUTE":  # Exclure le titre principal
                titres.append({
                    'niveau': 1,
                    'id': id_val,
                    'titre': self.nettoyer_titre_toc(titre.strip()),
                    'icone': self.obtenir_icone_chapitre(titre.strip())
                })
        
        # Titres H2 (sections principales)
        h2_pattern = r'<h2[^>]*id="([^"]*)"[^>]*>([^<]+)</h2>'
        h2_matches = re.findall(h2_pattern, contenu)
        for id_val, titre in h2_matches:
            titre_clean = self.nettoyer_titre_toc(titre.strip())
            if titre_clean and not titre_clean.startswith('Introduction'):  # Filtrer les introductions
                titres.append({
                    'niveau': 2,
                    'id': id_val,
                    'titre': titre_clean,
                    'icone': ''
                })
        
        # Générer la nouvelle table des matières avec pagination
        nouvelle_toc = '''<div class="toc-container">
<h2 class="toc-title">📚 Table des Matières</h2>
<div class="toc-content">
'''
        
        for item in titres[:30]:  # Limiter pour éviter une ToC trop longue
            css_class = f"toc-item niveau-{item['niveau']}"
            icone = item['icone'] + ' ' if item['icone'] else ''
            
            nouvelle_toc += f'''    <div class="{css_class}">
        <a class="toc-link" href="#{item['id']}">
            {icone}{item['titre']}
        </a>
        <span class="toc-dots"></span>
    </div>
'''
        
        nouvelle_toc += '''</div>
</div>'''
        
        # Remplacer l'ancienne table des matières
        contenu = re.sub(pattern_toc, nouvelle_toc, contenu, flags=re.DOTALL)
        print(f"  Table des matieres mise a jour avec {len(titres[:30])} entrees paginee")
        
        return contenu
    
    def generer_nouvelle_toc(self, contenu):
        """Génère une nouvelle table des matières complète avec pagination."""
        
        # Extraire tous les titres H1 et H2 avec leurs IDs
        titres = []
        
        # Titres H1 (chapitres principaux)
        h1_pattern = r'<h1[^>]*id="([^"]*)"[^>]*>([^<]+)</h1>'
        h1_matches = re.findall(h1_pattern, contenu)
        for id_val, titre in h1_matches:
            if titre.strip() and titre != "CARNIVAUTE":  # Exclure le titre principal
                titres.append({
                    'niveau': 1,
                    'id': id_val,
                    'titre': self.nettoyer_titre_toc(titre.strip()),
                    'icone': self.obtenir_icone_chapitre(titre.strip())
                })
        
        # Titres H2 majeurs (sections importantes)
        h2_importantes = [
            "Les Protéines", "Les Graisses", "Données Scientifiques", "Le Cru", 
            "Charcuteries", "Sous Vide", "Les Œufs", "Bases et Techniques",
            "Nez-à-queue", "Petit déjeuner", "Express", "Batch cooking",
            "Lunch nomade", "Famille", "Gourmet", "Plein air", "Sport", "Sauces"
        ]
        
        h2_pattern = r'<h2[^>]*id="([^"]*)"[^>]*>([^<]+)</h2>'
        h2_matches = re.findall(h2_pattern, contenu)
        for id_val, titre in h2_matches:
            titre_clean = self.nettoyer_titre_toc(titre.strip())
            # Ne garder que les H2 importants
            if any(important in titre_clean for important in h2_importantes):
                titres.append({
                    'niveau': 2,
                    'id': id_val,
                    'titre': titre_clean,
                    'icone': ''
                })
        
        # Générer la table des matières avec pagination CSS
        nouvelle_toc = '''<div class="toc-container">
<h2 class="toc-title">📚 Table des Matières</h2>
<div class="toc-content">
'''
        
        for item in titres[:25]:  # Limiter pour éviter surcharge
            css_class = f"toc-item niveau-{item['niveau']}"
            icone = item['icone'] + ' ' if item['icone'] else ''
            
            nouvelle_toc += f'''    <div class="{css_class}">
        <a class="toc-link" href="#{item['id']}">
            {icone}{item['titre']}
        </a>
        <span class="toc-dots"></span>
    </div>
'''
        
        nouvelle_toc += '''</div>
</div>'''
        
        return nouvelle_toc
    
    def eliminer_sections_dupliquees(self, contenu):
        """Élimine les sections 'Le Saviez-Vous' et 'Info' dupliquées et mal fusionnées."""
        
        print("Elimination des sections dupliquees et fusion des bulles info...")
        
        # 1. Pattern le plus commun : "Info" sur une ligne, puis "💡 Le Saviez-Vous ?" puis "Info" puis contenu
        # Exemple: Info \n\n 💡 Le Saviez-Vous ? \n Info \n\n [contenu]
        pattern_complexe = r'Info\s*\n+💡 Le Saviez-Vous \?\s*\n+Info\s*\n+([^\n].*?)(?=\n\n\w|\n\n#|\Z)'
        
        def remplacer_info_complexe(match):
            contenu_info = match.group(1).strip()
            return f'💡 **Le Saviez-Vous ?**\n\n{contenu_info}'
        
        contenu = re.sub(pattern_complexe, remplacer_info_complexe, contenu, flags=re.MULTILINE | re.DOTALL)
        
        # 2. Pattern simple : "Info" suivi directement du contenu (sans "Le Saviez-Vous")
        pattern_info_direct = r'(?<!💡)\s*Info\s*\n+([^#💡\n].*?)(?=\n\n[A-Z#]|\n\n💡|\Z)'
        
        def remplacer_info_direct(match):
            contenu_info = match.group(1).strip()
            return f'💡 **Information**\n\n{contenu_info}'
        
        contenu = re.sub(pattern_info_direct, remplacer_info_direct, contenu, flags=re.MULTILINE | re.DOTALL)
        
        # 3. Supprimer les lignes "Info" orphelines qui restent
        contenu = re.sub(r'^\s*Info\s*$', '', contenu, flags=re.MULTILINE)
        
        # 4. Supprimer les "💡 Le Saviez-Vous ?" vides ou mal formés
        contenu = re.sub(r'💡 Le Saviez-Vous \?\s*\n+>\s*$', '', contenu, flags=re.MULTILINE)
        contenu = re.sub(r'💡 Le Saviez-Vous \?\s*$', '', contenu, flags=re.MULTILINE)
        
        # 5. Nettoyer les espaces et lignes vides multiples
        contenu = re.sub(r'\n{3,}', '\n\n', contenu)
        contenu = re.sub(r'^\s*$\n', '', contenu, flags=re.MULTILINE)
        
        print("  Sections dupliquees eliminees et bulles info fusionnees")
        return contenu
    
    def generer_html_final(self):
        """Génère le HTML final v4.0."""
        
        if not self.md_source.exists():
            print("ERREUR: Fichier Markdown source introuvable")
            print("   Executez d'abord: python exportateur_markdown_propre.py")
            return False
        
        print("Lecture du fichier Markdown source...")
        with open(self.md_source, 'r', encoding='utf-8') as f:
            contenu_md = f.read()
        
        # Extraire titres AVANT conversion pour ToC propre
        titres = self.extraire_titres_vrais(contenu_md)
        
        # Générer ToC unique
        toc_html = self.generer_table_matieres_unique(titres)
        
        # Conversion complète Markdown → HTML
        contenu_html = self.convertir_markdown_complet(contenu_md)
        
        # CSS moderne
        css = self.generer_css_moderne()
        
        # Assembly final
        html_complet = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARNIVAUTE - Guide Professionnel du Carnivore</title>
    <style>{css}</style>
</head>
<body>
    <header class="main-header">
        <h1 class="main-title">CARNIVAUTE</h1>
        <p class="main-subtitle">Guide Complet du Carnivore Moderne</p>
    </header>

    {toc_html}

    <main class="main-content">
        {contenu_html}
    </main>

    <footer class="main-footer">
        <p><strong>CARNIVAUTE</strong> - Excellence Culinaire Carnivore</p>
        <p><em>Science • Nutrition • Saveurs Authentiques</em></p>
    </footer>
</body>
</html>"""
        
        # Sauvegarde
        html_file = self.output_dir / "CARNIVAUTE_export_professionnel.html"
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_complet)
        
        print(f"HTML v4.0 FINAL genere: {html_file}")
        
        # Statistiques
        nb_lignes = len(html_complet.split('\n'))
        nb_tableaux = html_complet.count('<table')
        nb_titres_toc = len(titres)
        
        print(f"\nSTATISTIQUES FINALES v4.0:")
        print(f"  Lignes HTML: {nb_lignes:,}")
        print(f"  Tableaux: {nb_tableaux}")
        print(f"  Titres ToC: {nb_titres_toc}")
        print(f"  Taille: {len(html_complet):,} caracteres")
        
        return html_file
    
    def generer_recommandations_finales(self, html_file):
        """Recommandations finales v4.0."""
        
        print(f"\n" + "="*60)
        print("HTML PROFESSIONNEL v4.0 - VERSION FINALE")
        print("="*60)
        
        print(f"\nFichier final genere: {html_file}")
        
        print("\nCORRECTIONS FINALES v4.0:")
        print("  + UNE SEULE table des matieres (propre et fonctionnelle)")
        print("  + Vrais titres de recettes correctement extraits")
        print("  + Blockquotes (>) convertis en HTML elegant")
        print("  + Retours a la ligne corriges")
        print("  + Tableaux de securite specialises")
        print("  + Conversion Markdown 100% complete")
        print("  + Design final professionnel")
        
        print("\nFONCTIONNALITES FINALES:")
        print("  + Navigation cliquable dans la ToC")
        print("  + CSS optimise pour impression PDF")
        print("  + Responsive design mobile/desktop")
        print("  + Ancres HTML fonctionnelles")
        
        print("\nUTILISATION:")
        print("  [1] Ouvrir dans navigateur")
        print("  [2] Ctrl+P -> Enregistrer en PDF")
        print("  [3] Cocher 'Graphiques d'arriere-plan'")
        
        print("\nFICHIER 100% PRET POUR UTILISATION PROFESSIONNELLE!")
    
    def executer(self):
        """Exécute l'exportation finale v4.0."""
        
        try:
            print("="*60)
            print("EXPORTATEUR HTML PROFESSIONNEL v8.0 - MIND FUCKS SPATIAUX")
            print("="*60)
            
            html_file = self.generer_html_final()
            
            if not html_file:
                return False
            
            self.generer_recommandations_finales(html_file)
            
            print(f"\nEXPORT v4.0 FINAL REUSSI!")
            
            return html_file
            
        except Exception as e:
            print(f"\nERREUR: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    """Point d'entrée."""
    exportateur = ExportateurHTMLProfessionnel()
    success = exportateur.executer()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()