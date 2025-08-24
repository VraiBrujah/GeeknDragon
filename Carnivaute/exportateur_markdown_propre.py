#!/usr/bin/env python3
"""
Exportateur Markdown Propre CarnivaUte
======================================

Crée un fichier Markdown parfaitement formaté pour les convertisseurs externes:
- Nettoyage des caractères Unicode problématiques
- Correction des tableaux pour rendu parfait
- Structure optimisée pour table des matières automatique
- Compatible avec Pandoc, Typora, MarkText, etc.
"""

import sys
import re
from pathlib import Path

class ExportateurMarkdownPropre:
    """Exportateur de Markdown optimisé pour conversion PDF/Word."""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.output_dir = self.base_path / "output_final"
        self.md_source = self.output_dir / "CARNIVAUTE_livre_complet.md"
    
    def nettoyer_markdown_complet(self):
        """Nettoie complètement le Markdown pour un rendu parfait."""
        
        if not self.md_source.exists():
            print("ERREUR: Générez d'abord le livre avec generer_livre_complet.bat")
            return False
        
        print("Lecture du Markdown source...")
        with open(self.md_source, 'r', encoding='utf-8') as f:
            contenu = f.read()
        
        print("Nettoyage approfondi du contenu...")
        
        # 1. NETTOYAGE DES CARACTÈRES UNICODE
        corrections_unicode = {
            # Émojis → Versions texte
            '🚀': '',
            '🥩': '',
            '🥓': '',
            '🔬': '',
            '🥚': '',
            '🔧': '',
            '🦴': '',
            '🌅': '',
            '⚡': '',
            '🏭': '',
            '🎒': '',
            '👨‍👩‍👧‍👦': '',
            '🥂': '',
            '🎉': '',
            '🏃‍♂️': '',
            
            # Caractères spéciaux problématiques
            '•': '-',
            '◦': '  -',
            '–': '-',
            '—': '-',
            ''': "'",
            ''': "'",
            '"': '"',
            '"': '"',
            '…': '...',
            
            # Espaces problématiques
            '\u00a0': ' ',  # Espace insécable
            '\u2009': ' ',  # Espace fine
            '\u200b': '',   # Espace de largeur nulle
        }
        
        for ancien, nouveau in corrections_unicode.items():
            contenu = contenu.replace(ancien, nouveau)
        
        # 2. CORRECTION DES TABLEAUX (le plus important!)
        contenu = self.corriger_tableaux(contenu)
        
        # 3. NETTOYAGE STRUCTURE
        # Lignes vides multiples
        contenu = re.sub(r'\n{3,}', '\n\n', contenu)
        
        # Espaces en fin de ligne
        contenu = re.sub(r' +\n', '\n', contenu)
        
        # 4. OPTIMISATION TABLE DES MATIÈRES
        # S'assurer que les titres sont bien formatés
        contenu = re.sub(r'^#{1,6} +', lambda m: '#' * len(m.group().strip()) + ' ', contenu, flags=re.MULTILINE)
        
        # 5. CORRECTION DES LIENS
        # Nettoyer les ancres
        def nettoyer_ancre(match):
            ancre = match.group(1)
            ancre_propre = re.sub(r'[^a-zA-Z0-9\s-]', '', ancre)
            ancre_propre = re.sub(r'\s+', '-', ancre_propre.strip().lower())
            return f"(#{ancre_propre})"
        
        contenu = re.sub(r'\(#([^)]+)\)', nettoyer_ancre, contenu)
        
        # 6. SAUVEGARDE
        md_propre = self.output_dir / "CARNIVAUTE_export_propre.md"
        
        with open(md_propre, 'w', encoding='utf-8') as f:
            f.write(contenu)
        
        print(f"Markdown nettoye sauvegarde: {md_propre}")
        
        # 7. STATISTIQUES
        nb_lignes = len(contenu.split('\n'))
        nb_tableaux = len(re.findall(r'^\|.*\|$', contenu, re.MULTILINE))
        nb_titres = len(re.findall(r'^#{1,6} ', contenu, re.MULTILINE))
        
        print(f"\nSTATISTIQUES:")
        print(f"  Lignes: {nb_lignes:,}")
        print(f"  Tableaux: {nb_tableaux}")
        print(f"  Titres: {nb_titres}")
        
        return md_propre
    
    def corriger_tableaux(self, contenu):
        """Corrige spécifiquement les tableaux Markdown pour un rendu parfait."""
        
        print("Correction des tableaux...")
        
        # Trouve tous les tableaux dans le contenu
        pattern_tableau = r'(\|[^\n]+\|\n(?:\|[^\n]+\|\n)*)'
        tableaux = re.findall(pattern_tableau, contenu, re.MULTILINE)
        
        print(f"  {len(tableaux)} tableaux detectes")
        
        for tableau in tableaux:
            tableau_corrige = self.corriger_tableau_individuel(tableau)
            contenu = contenu.replace(tableau, tableau_corrige)
        
        return contenu
    
    def corriger_tableau_individuel(self, tableau):
        """Corrige un tableau individuel."""
        
        lignes = tableau.strip().split('\n')
        
        if len(lignes) < 2:
            return tableau
        
        # Ligne d'en-tête
        en_tete = lignes[0]
        
        # Ligne de séparation (deuxième ligne)
        if len(lignes) > 1:
            colonnes = en_tete.split('|')
            nb_colonnes = len([col for col in colonnes if col.strip()])
            
            # Créer une ligne de séparation correcte
            separateur = '|' + '|'.join(['---' for _ in range(nb_colonnes)]) + '|'
        else:
            separateur = lignes[1] if len(lignes) > 1 else '|---|---|---|'
        
        # Reconstruire le tableau
        lignes_corrigees = [en_tete, separateur]
        
        # Ajouter les autres lignes
        if len(lignes) > 2:
            lignes_corrigees.extend(lignes[2:])
        elif len(lignes) > 1 and not lignes[1].startswith('|--'):
            # Si la deuxième ligne n'est pas un séparateur, c'est une ligne de données
            lignes_corrigees.append(lignes[1])
        
        # Nettoyer chaque ligne
        lignes_finales = []
        for ligne in lignes_corrigees:
            # S'assurer que la ligne commence et finit par |
            ligne = ligne.strip()
            if not ligne.startswith('|'):
                ligne = '|' + ligne
            if not ligne.endswith('|'):
                ligne = ligne + '|'
            
            # Nettoyer les espaces
            parties = ligne.split('|')
            parties_nettoyees = [partie.strip() for partie in parties]
            ligne_nettoyee = '|'.join(parties_nettoyees)
            
            lignes_finales.append(ligne_nettoyee)
        
        return '\n'.join(lignes_finales) + '\n'
    
    def generer_recommandations(self, md_file):
        """Génère les recommandations de conversion."""
        
        print(f"\n" + "="*60)
        print("RECOMMANDATIONS DE CONVERSION")
        print("="*60)
        
        print(f"\nFichier Markdown optimise: {md_file}")
        
        print("\nMEILLEURES OPTIONS IDENTIFIEES:")
        
        print("\n1. PANDOC (Recommande Premium)")
        print("   Installation: https://pandoc.org/installing.html")
        print("   Commandes recommandees:")
        print("   # PDF avec table des matieres")
        print(f"   pandoc \"{md_file}\" -o CARNIVAUTE.pdf --pdf-engine=xelatex --toc --toc-depth=3")
        print("   # Word avec structure")
        print(f"   pandoc \"{md_file}\" -o CARNIVAUTE.docx --toc")
        
        print("\n2. TYPORA (Interface Graphique)")
        print("   1. Ouvrir Typora")
        print(f"   2. Ouvrir le fichier: {md_file}")
        print("   3. File -> Export -> PDF (avec CSS personnalise)")
        print("   Avantages: Apercu temps reel, tableaux parfaits")
        
        print("\n3. MARKTEXT (Gratuit et Excellent)")
        print("   1. Telecharger: https://github.com/marktext/marktext")
        print(f"   2. Ouvrir: {md_file}")
        print("   3. File -> Export -> PDF")
        print("   Avantages: 100% gratuit, rendu parfait des tableaux")
        
        print("\n4. CONVERSION EN LIGNE")
        print("   - https://www.markdowntopdf.com/")
        print("   - https://dillinger.io/")
        print("   - https://stackedit.io/")
        
        print("\n5. WORD WORKFLOW")
        print(f"   pandoc \"{md_file}\" -o CARNIVAUTE.docx")
        print("   Puis dans Word:")
        print("   - References -> Table des matieres")
        print("   - Insertion -> Numeros de page")
        
        print("\nPOUR TON CAS SPECIFIQUE:")
        print("   Recommandation: PANDOC ou MARKTEXT")
        print("   Raison: Rendu parfait des tableaux + ToC automatique")
    
    def executer(self):
        """Exécute l'exportation complète."""
        
        try:
            print("="*60)
            print("EXPORTATEUR MARKDOWN PROPRE CARNIVAUTE")
            print("="*60)
            
            # Nettoyage et correction
            md_propre = self.nettoyer_markdown_complet()
            
            if not md_propre:
                return False
            
            # Recommandations
            self.generer_recommandations(md_propre)
            
            print(f"\nEXPORT TERMINE AVEC SUCCES!")
            print(f"Fichier pret pour conversion: {md_propre}")
            
            return True
            
        except Exception as e:
            print(f"\nERREUR: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    """Point d'entrée."""
    exportateur = ExportateurMarkdownPropre()
    success = exportateur.executer()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()