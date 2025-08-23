#!/usr/bin/env python3
"""
PRESENTA-AGENT - Animation Manim
Li-CUBE PRO™ LFP - Animations techniques et comparaisons
EDS Québec - 2025

Usage:
    manim 16_animation_manim.py LiCubeTCOComparison -p
    manim 16_animation_manim.py BatterySpecsAnimation -p
    manim 16_animation_manim.py EnvironmentalImpact -p
"""

from manim import *
import json
import numpy as np

# Configuration générale
config.background_color = "#0f1419"

# Couleurs de marque EDS
PRIMARY_BLUE = "#2E86AB"
SECONDARY_MAGENTA = "#A23B72"
ACCENT_ORANGE = "#F18F01"
SUCCESS_GREEN = "#28A745"
ALERT_RED = "#C73E1D"
NEUTRAL_LIGHT = "#F8F9FA"

class LiCubeTCOComparison(Scene):
    """Animation comparative TCO Li-CUBE PRO vs Ni-Cd sur 20 ans"""
    
    def construct(self):
        # Chargement des données manifest
        try:
            with open('04_manifest.json', 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            tco_data = manifest['tco_analysis']
        except:
            # Données par défaut si le manifest n'est pas accessible
            tco_data = {
                'lfp': {'total_20_years': 2500},
                'nicd': {'total_20_years': 61500},
                'savings': {'absolute': 59000, 'percentage': 96}
            }
        
        # Titre principal
        title = Text("Révolution TCO sur 20 ans", font_size=48, color=ACCENT_ORANGE)
        title.to_edge(UP, buff=0.5)
        
        # Création des barres de comparaison
        lfp_bar = Rectangle(
            width=2, 
            height=tco_data['lfp']['total_20_years'] / 10000,  # Échelle
            fill_color=SUCCESS_GREEN, 
            fill_opacity=0.8,
            stroke_color=WHITE,
            stroke_width=2
        )
        
        nicd_bar = Rectangle(
            width=2, 
            height=tco_data['nicd']['total_20_years'] / 10000,
            fill_color=ALERT_RED, 
            fill_opacity=0.8,
            stroke_color=WHITE,
            stroke_width=2
        )
        
        # Positionnement des barres
        lfp_bar.next_to(ORIGIN, LEFT, buff=2)
        lfp_bar.align_to(ORIGIN, DOWN)
        
        nicd_bar.next_to(ORIGIN, RIGHT, buff=2)
        nicd_bar.align_to(ORIGIN, DOWN)
        
        # Labels des technologies
        lfp_label = Text("Li-CUBE PRO™ LFP", font_size=24, color=SUCCESS_GREEN)
        lfp_label.next_to(lfp_bar, DOWN, buff=0.3)
        
        nicd_label = Text("Batteries Ni-Cd", font_size=24, color=ALERT_RED)
        nicd_label.next_to(nicd_bar, DOWN, buff=0.3)
        
        # Valeurs TCO
        lfp_value = Text(f"{tco_data['lfp']['total_20_years']:,} CAD".replace(',', ' '), 
                        font_size=20, color=WHITE)
        lfp_value.next_to(lfp_bar, UP, buff=0.3)
        
        nicd_value = Text(f"{tco_data['nicd']['total_20_years']:,} CAD".replace(',', ' '), 
                         font_size=20, color=WHITE)
        nicd_value.next_to(nicd_bar, UP, buff=0.3)
        
        # Animation d'apparition
        self.play(FadeIn(title), run_time=1)
        self.wait(0.5)
        
        # Apparition des labels
        self.play(
            Write(lfp_label),
            Write(nicd_label),
            run_time=1.5
        )
        
        # Croissance animée des barres
        self.play(
            GrowFromEdge(lfp_bar, DOWN),
            GrowFromEdge(nicd_bar, DOWN),
            run_time=3
        )
        
        # Apparition des valeurs
        self.play(
            FadeIn(lfp_value),
            FadeIn(nicd_value),
            run_time=1
        )
        
        # Highlight des économies
        savings_text = Text(f"ÉCONOMIES : {tco_data['savings']['absolute']:,} CAD (-{tco_data['savings']['percentage']}%)".replace(',', ' '), 
                           font_size=36, color=ACCENT_ORANGE)
        savings_text.to_edge(DOWN, buff=1)
        
        # Animation d'explosion pour les économies
        explosion = Circle(radius=0.1, color=ACCENT_ORANGE, fill_opacity=0.3)
        explosion.move_to(savings_text.get_center())
        
        self.play(
            FadeIn(explosion),
            run_time=0.2
        )
        self.play(
            explosion.animate.scale(20).set_opacity(0),
            FadeIn(savings_text),
            run_time=1.5
        )
        
        self.wait(2)
        
        # Transition finale
        self.play(
            FadeOut(Group(*self.mobjects)),
            run_time=1
        )


class BatterySpecsAnimation(Scene):
    """Animation des spécifications techniques comparatives"""
    
    def construct(self):
        # Titre
        title = Text("Spécifications Techniques", font_size=48, color=PRIMARY_BLUE)
        title.to_edge(UP, buff=0.5)
        
        # Spécifications LiFePO4
        lfp_specs = VGroup(
            Text("Li-CUBE PRO™ LFP", font_size=32, color=SUCCESS_GREEN),
            Text("24V 105Ah", font_size=24, color=WHITE),
            Text("2520 Wh", font_size=20, color=WHITE),
            Text("≥8000 cycles", font_size=20, color=WHITE),
            Text("23 kg", font_size=20, color=WHITE),
            Text("98% efficacité", font_size=20, color=WHITE),
            Text("-40°C à +70°C", font_size=20, color=WHITE)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        
        # Spécifications Ni-Cd
        nicd_specs = VGroup(
            Text("Batteries Ni-Cd", font_size=32, color=ALERT_RED),
            Text("24V 100Ah", font_size=24, color=WHITE),
            Text("2400 Wh", font_size=20, color=WHITE),
            Text("2000-3000 cycles", font_size=20, color=WHITE),
            Text("80 kg", font_size=20, color=WHITE),
            Text("85% efficacité", font_size=20, color=WHITE),
            Text("-20°C à +60°C", font_size=20, color=WHITE)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        
        # Positionnement
        lfp_specs.to_edge(LEFT, buff=1)
        nicd_specs.to_edge(RIGHT, buff=1)
        
        # Lignes de séparation
        separator = Line(
            start=UP * 3,
            end=DOWN * 3,
            color=ACCENT_ORANGE,
            stroke_width=3
        )
        
        # Animations
        self.play(FadeIn(title), run_time=1)
        self.wait(0.5)
        
        self.play(DrawBorderThenFill(separator), run_time=1)
        
        # Apparition alternée des spécifications
        for i in range(len(lfp_specs)):
            self.play(
                FadeIn(lfp_specs[i]),
                FadeIn(nicd_specs[i]),
                run_time=0.8
            )
            self.wait(0.2)
        
        # Highlight des avantages LFP
        advantages = [
            (4, "71% plus léger"),  # Poids
            (3, "167% plus de cycles"),  # Cycles
            (5, "13% plus efficace")  # Efficacité
        ]
        
        for spec_index, advantage_text in advantages:
            highlight = SurroundingRectangle(
                lfp_specs[spec_index], 
                color=ACCENT_ORANGE,
                buff=0.1
            )
            advantage_label = Text(advantage_text, font_size=18, color=ACCENT_ORANGE)
            advantage_label.next_to(highlight, RIGHT, buff=0.5)
            
            self.play(
                Create(highlight),
                FadeIn(advantage_label),
                run_time=1
            )
            self.wait(1)
            self.play(
                FadeOut(highlight),
                FadeOut(advantage_label),
                run_time=0.5
            )
        
        self.wait(2)
        
        # Transition finale
        self.play(FadeOut(Group(*self.mobjects)), run_time=1)


class EnvironmentalImpact(Scene):
    """Animation de l'impact environnemental"""
    
    def construct(self):
        # Titre
        title = Text("Impact Environnemental", font_size=48, color=SUCCESS_GREEN)
        title.to_edge(UP, buff=0.5)
        
        # Côté pollution (Ni-Cd)
        pollution_side = VGroup(
            Text("Batteries Ni-Cd", font_size=28, color=ALERT_RED),
            Text("☠️ Cadmium toxique", font_size=20, color=ALERT_RED),
            Text("🏭 Pollution industrielle", font_size=20, color=ALERT_RED),
            Text("♻️ Recyclage complexe", font_size=20, color=ALERT_RED),
            Text("💨 Émissions élevées", font_size=20, color=ALERT_RED)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        pollution_side.to_edge(LEFT, buff=1)
        
        # Côté propre (LiFePO4)
        clean_side = VGroup(
            Text("Li-CUBE PRO™ LFP", font_size=28, color=SUCCESS_GREEN),
            Text("✅ 0% cadmium", font_size=20, color=SUCCESS_GREEN),
            Text("🌱 Production propre", font_size=20, color=SUCCESS_GREEN),
            Text("♻️ 100% recyclable", font_size=20, color=SUCCESS_GREEN),
            Text("🌍 -50% émissions CO₂", font_size=20, color=SUCCESS_GREEN)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        clean_side.to_edge(RIGHT, buff=1)
        
        # Flèche de transformation
        arrow = Arrow(
            start=pollution_side.get_right() + RIGHT * 0.5,
            end=clean_side.get_left() + LEFT * 0.5,
            color=ACCENT_ORANGE,
            stroke_width=8,
            tip_length=0.3
        )
        
        transformation_text = Text("TRANSFORMATION", font_size=20, color=ACCENT_ORANGE)
        transformation_text.next_to(arrow, UP, buff=0.3)
        
        # Animation séquentielle
        self.play(FadeIn(title), run_time=1)
        self.wait(0.5)
        
        # Apparition du côté pollution
        for item in pollution_side:
            self.play(FadeIn(item), run_time=0.8)
            self.wait(0.2)
        
        # Pause dramatique
        self.wait(1)
        
        # Flèche de transformation
        self.play(
            GrowArrow(arrow),
            FadeIn(transformation_text),
            run_time=1.5
        )
        
        # Apparition du côté propre
        for item in clean_side:
            self.play(FadeIn(item), run_time=0.8)
            self.wait(0.2)
        
        # Effet de nettoyage
        clean_wave = Rectangle(
            width=config.frame_width,
            height=config.frame_height,
            fill_color=SUCCESS_GREEN,
            fill_opacity=0.3,
            stroke_width=0
        )
        clean_wave.move_to(LEFT * config.frame_width)
        
        self.play(
            clean_wave.animate.move_to(RIGHT * config.frame_width),
            run_time=2
        )
        
        # Message final
        final_message = Text("Développement Durable", font_size=36, color=SUCCESS_GREEN)
        final_message.to_edge(DOWN, buff=1)
        
        self.play(FadeIn(final_message), run_time=1)
        self.wait(2)
        
        # Transition finale
        self.play(FadeOut(Group(*self.mobjects)), run_time=1)


class ProductShowcase3D(ThreeDScene):
    """Animation 3D du produit Li-CUBE PRO"""
    
    def construct(self):
        # Configuration 3D
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        
        # Création du Li-CUBE PRO en 3D
        battery = VGroup(
            # Corps principal
            Prism(dimensions=[3, 2, 1.2], fill_color=PRIMARY_BLUE, fill_opacity=0.8),
            # Connecteurs
            Cylinder(radius=0.1, height=0.3, fill_color=ACCENT_ORANGE).shift(UP * 0.6 + LEFT * 1.2),
            Cylinder(radius=0.1, height=0.3, fill_color=ALERT_RED).shift(UP * 0.6 + RIGHT * 1.2),
            # LED de statut
            Sphere(radius=0.05, fill_color=SUCCESS_GREEN).shift(UP * 0.7),
        )
        
        # Labels techniques
        specs_3d = VGroup(
            Text3D("Li-CUBE PRO™ LFP", font_size=24, color=WHITE),
            Text3D("24V 105Ah", font_size=16, color=ACCENT_ORANGE),
            Text3D("LiFePO4", font_size=14, color=SUCCESS_GREEN)
        ).arrange(DOWN, buff=0.3)
        specs_3d.shift(DOWN * 2)
        
        # Animation de rotation
        self.play(Create(battery), run_time=2)
        self.play(FadeIn(specs_3d), run_time=1)
        
        # Rotation 360°
        self.play(
            Rotate(battery, angle=2*PI, axis=UP),
            run_time=6,
            rate_func=linear
        )
        
        # Zoom avant
        self.play(
            self.camera.frame.animate.scale(0.7),
            run_time=2
        )
        
        self.wait(2)


class CycleLifeComparison(Scene):
    """Animation comparative des cycles de vie"""
    
    def construct(self):
        # Titre
        title = Text("Durée de Vie Comparative", font_size=48, color=PRIMARY_BLUE)
        title.to_edge(UP, buff=0.5)
        
        # Créer les compteurs de cycles
        lfp_counter = Integer(0, color=SUCCESS_GREEN, font_size=48)
        nicd_counter = Integer(0, color=ALERT_RED, font_size=48)
        
        lfp_label = Text("Li-CUBE PRO™ LFP", font_size=24, color=SUCCESS_GREEN)
        nicd_label = Text("Ni-Cd Traditionnel", font_size=24, color=ALERT_RED)
        
        # Positionnement
        lfp_group = VGroup(lfp_counter, lfp_label).arrange(DOWN, buff=0.5)
        nicd_group = VGroup(nicd_counter, nicd_label).arrange(DOWN, buff=0.5)
        
        lfp_group.to_edge(LEFT, buff=2)
        nicd_group.to_edge(RIGHT, buff=2)
        
        # Barres de progression
        lfp_bar = Rectangle(width=0, height=0.5, fill_color=SUCCESS_GREEN, fill_opacity=0.8)
        nicd_bar = Rectangle(width=0, height=0.5, fill_color=ALERT_RED, fill_opacity=0.8)
        
        lfp_bar.next_to(lfp_group, DOWN, buff=1)
        nicd_bar.next_to(nicd_group, DOWN, buff=1)
        
        # Animation
        self.play(FadeIn(title), run_time=1)
        self.play(
            FadeIn(lfp_label),
            FadeIn(nicd_label),
            run_time=1
        )
        
        # Comptage animé
        self.play(
            ChangeDecimalToValue(lfp_counter, 8000),
            ChangeDecimalToValue(nicd_counter, 3000),
            lfp_bar.animate.stretch_to_fit_width(4),
            nicd_bar.animate.stretch_to_fit_width(1.5),
            run_time=4
        )
        
        # Message final
        advantage_text = Text("+167% de cycles de vie", font_size=36, color=ACCENT_ORANGE)
        advantage_text.to_edge(DOWN, buff=1)
        
        self.play(FadeIn(advantage_text), run_time=1)
        self.wait(2)
        
        self.play(FadeOut(Group(*self.mobjects)), run_time=1)


# Fonction utilitaire pour le rendu batch
def render_all_animations():
    """Fonction pour rendre toutes les animations en une fois"""
    scenes = [
        LiCubeTCOComparison,
        BatterySpecsAnimation,
        EnvironmentalImpact,
        ProductShowcase3D,
        CycleLifeComparison
    ]
    
    for scene_class in scenes:
        print(f"Rendu de {scene_class.__name__}...")
        # Note: l'exécution réelle nécessite l'environnement Manim


if __name__ == "__main__":
    print("PRESENTA-AGENT - Animations Manim")
    print("Li-CUBE PRO™ LFP - EDS Québec")
    print("\nAnimations disponibles :")
    print("1. LiCubeTCOComparison - Comparaison TCO")
    print("2. BatterySpecsAnimation - Spécifications techniques")
    print("3. EnvironmentalImpact - Impact environnemental")
    print("4. ProductShowcase3D - Présentation 3D du produit")
    print("5. CycleLifeComparison - Comparaison cycles de vie")
    print("\nUsage : manim 16_animation_manim.py <NomAnimation> -p")