#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Correcteur de Mise en Forme pour CARNIVAUTE
===========================================

Script pour corriger automatiquement les problèmes de mise en forme
dans les fichiers Markdown du projet CARNIVAUTE.

Problèmes corrigés :
- Phrases fusionnées sans retours à la ligne
- Définitions du lexique mal structurées
- Manque d'espacement et de hiérarchisation
- Listes et énumérations collées

Auteur: Équipe Carnivaute
Date: 2025-08-23
"""

import re
import os

class CorrecteurCarnivaute:
    """Correcteur automatique pour la mise en forme des fichiers CARNIVAUTE."""
    
    def __init__(self):
        self.stats = {
            'fichiers_traités': 0,
            'corrections_appliquées': 0,
            'lignes_reformatées': 0
        }
    
    def corriger_definition_lexique(self, texte):
        """
        Corrige les définitions du lexique mal formatées.
        
        Args:
            texte (str): Texte de définition à corriger
            
        Returns:
            str: Texte corrigé avec meilleure mise en forme
        """
        # Pattern pour identifier les définitions avec phrases fusionnées
        pattern_definition = r'(\*\*[A-ZÉÈÊËÀÂÄÔÖÙÛÜÇ\s]+\*\*\s*\*\([^)]+\)\*\n)([^*]+?)(?=\n\*\*|\n---|\n##|\Z)'
        
        def reformater_definition(match):
            titre = match.group(1)
            contenu = match.group(2).strip()
            
            # Séparer les phrases
            phrases = re.split(r'(?<=[.!?])\s+(?=[A-ZÉÈÊËÀÂÄÔÖÙÛÜÇ])', contenu)
            
            # Identifier différents types d'information
            definition_principale = phrases[0] if phrases else ""
            autres_infos = phrases[1:] if len(phrases) > 1 else []
            
            # Reconstruire avec meilleure structure
            resultat = titre + definition_principale + "\n\n"
            
            if autres_infos:
                # Grouper par type d'information
                caracteristiques = []
                applications = []
                techniques = []
                autres = []
                
                for phrase in autres_infos:
                    phrase = phrase.strip()
                    if any(keyword in phrase.lower() for keyword in ['température', 'durée', 'technique', 'méthode', 'processus']):
                        techniques.append(phrase)
                    elif any(keyword in phrase.lower() for keyword in ['application', 'utilisation', 'usage', 'emploi']):
                        applications.append(phrase)
                    elif any(keyword in phrase.lower() for keyword in ['caractéristique', 'propriété', 'composition', 'type']):
                        caracteristiques.append(phrase)
                    else:
                        autres.append(phrase)
                
                # Ajouter les sections structurées
                if caracteristiques:
                    resultat += "**Caractéristiques :**\n"
                    for car in caracteristiques:
                        resultat += f"- {car}\n"
                    resultat += "\n"
                
                if applications:
                    resultat += "**Applications :**\n"
                    for app in applications:
                        resultat += f"- {app}\n"
                    resultat += "\n"
                
                if techniques:
                    resultat += "**Technique :**\n"
                    for tech in techniques:
                        resultat += f"- {tech}\n"
                    resultat += "\n"
                
                if autres:
                    resultat += "**Informations complémentaires :**\n"
                    for autre in autres:
                        resultat += f"- {autre}\n"
                    resultat += "\n"
            
            self.stats['corrections_appliquées'] += 1
            return resultat
        
        return re.sub(pattern_definition, reformater_definition, texte, flags=re.MULTILINE | re.DOTALL)
    
    def corriger_listes_fusionnees(self, texte):
        """
        Corrige les listes numérotées fusionnées.
        
        Args:
            texte (str): Texte à corriger
            
        Returns:
            str: Texte avec listes bien formatées
        """
        # Pattern pour listes numérotées collées
        pattern_liste = r'(\d+\.\s[^0-9]+?)(\d+\.\s)'
        
        def separer_listes(match):
            item1 = match.group(1).strip()
            item2_debut = match.group(2)
            return f"{item1}\n\n{item2_debut}"
        
        texte_corrigé = re.sub(pattern_liste, separer_listes, texte)
        
        if texte_corrigé != texte:
            self.stats['corrections_appliquées'] += 1
        
        return texte_corrigé
    
    def corriger_paragraphes_fusionnes(self, texte):
        """
        Sépare les paragraphes fusionnés.
        
        Args:
            texte (str): Texte à corriger
            
        Returns:
            str: Texte avec paragraphes bien séparés
        """
        # Séparer les phrases qui commencent par des majuscules après un point
        pattern_paragraphes = r'([.!?])\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÇ][a-z])'
        
        def separer_phrases(match):
            fin_phrase = match.group(1)
            debut_nouvelle = match.group(2)
            return f"{fin_phrase}\n\n{debut_nouvelle}"
        
        # Appliquer seulement si ce n'est pas déjà dans une liste ou structure
        lignes = texte.split('\n')
        lignes_corrigees = []
        
        for ligne in lignes:
            if not (ligne.strip().startswith('-') or 
                   ligne.strip().startswith('*') or 
                   ligne.strip().startswith('#') or
                   re.match(r'^\s*\d+\.', ligne.strip())):
                # Appliquer la correction seulement aux paragraphes normaux
                ligne_corrigee = re.sub(pattern_paragraphes, separer_phrases, ligne)
                if ligne_corrigee != ligne:
                    self.stats['corrections_appliquées'] += 1
                lignes_corrigees.append(ligne_corrigee)
            else:
                lignes_corrigees.append(ligne)
        
        return '\n'.join(lignes_corrigees)
    
    def corriger_fichier(self, chemin_fichier):
        """
        Corrige un fichier Markdown complet.
        
        Args:
            chemin_fichier (str): Chemin vers le fichier à corriger
            
        Returns:
            tuple: (succès, message)
        """
        try:
            # Lire le fichier
            with open(chemin_fichier, 'r', encoding='utf-8') as f:
                contenu_original = f.read()
            
            # Appliquer les corrections
            contenu_corrigé = contenu_original
            contenu_corrigé = self.corriger_definition_lexique(contenu_corrigé)
            contenu_corrigé = self.corriger_listes_fusionnees(contenu_corrigé)
            contenu_corrigé = self.corriger_paragraphes_fusionnes(contenu_corrigé)
            
            # Sauvegarder si des modifications ont été apportées
            if contenu_corrigé != contenu_original:
                # Créer un fichier de sauvegarde
                chemin_backup = chemin_fichier + '.backup'
                with open(chemin_backup, 'w', encoding='utf-8') as f:
                    f.write(contenu_original)
                
                # Sauvegarder le fichier corrigé
                chemin_corrigé = chemin_fichier.replace('.md', '_CORRIGÉ.md')
                with open(chemin_corrigé, 'w', encoding='utf-8') as f:
                    f.write(contenu_corrigé)
                
                self.stats['fichiers_traités'] += 1
                return True, f"Fichier corrigé sauvegardé : {chemin_corrigé}"
            else:
                return True, "Aucune correction nécessaire"
                
        except Exception as e:
            return False, f"Erreur lors du traitement : {str(e)}"
    
    def afficher_stats(self):
        """Affiche les statistiques des corrections appliquées."""
        print("\n=== STATISTIQUES DES CORRECTIONS ===")
        print(f"Fichiers traités: {self.stats['fichiers_traités']}")
        print(f"Corrections appliquées: {self.stats['corrections_appliquées']}")
        print(f"Lignes reformatées: {self.stats['lignes_reformatées']}")
        print("="*37)

def main():
    """Fonction principale du correcteur."""
    print("CORRECTEUR DE MISE EN FORME CARNIVAUTE")
    print("=" * 50)
    
    correcteur = CorrecteurCarnivaute()
    
    # Fichiers à corriger
    fichiers_a_corriger = [
        'CARNIVAUTE_restructure.md',
        'output_final/CARNIVAUTE_export_propre.md',
        'introduction_ultra_explicative.md'
    ]
    
    for fichier in fichiers_a_corriger:
        chemin_complet = os.path.join(os.getcwd(), fichier)
        if os.path.exists(chemin_complet):
            print(f"\nTraitement de: {fichier}")
            succès, message = correcteur.corriger_fichier(chemin_complet)
            print(f"   {'OK' if succès else 'ERREUR'} {message}")
        else:
            print(f"\nFichier non trouvé: {fichier}")
    
    correcteur.afficher_stats()
    print("\nTraitement terminé!")

if __name__ == "__main__":
    main()