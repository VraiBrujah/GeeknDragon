





> **Objectif** : Sur **12 pages de vente des sous dossier de <C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\Presentateur\LiCUBEPRO\presentations-vente** et **12 pages de location des sous dossier de <C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\Presentateur\LiCUBEPRO\presentations-location>** (miroirs), **remplacer 100 % des chiffres** (valeurs numériques et pourcentages, y compris ceux utilisés dans les calculs/graphes/sliders) par des **variables**.
> **Aucune autre modification** n’est autorisée.
>
> **Source de vérité** : S’appuyer exclusivement sur le **document de référence** joint et les gabarits fournis.     
>
> **Contraintes et fonctionnement** :
>
> 1. **Global unique en lecture seule au chargement** :
>
>    * Définir un objet **GLOBALS** (constante) chargé au `DOMContentLoaded`.
>    * Après chargement, **cloner** GLOBALS dans un **store local mutable** (scope page/module) pour les interactions runtime (sliders, simulateurs).
> 2. **Déduplication stricte** :
>
>    * Si plusieurs chiffres ont **la même valeur**, ils **référencent la même variable**.
>    * Ex. `licube.weight_kg` utilisé partout où 23 kg apparaît.
> 3. **Modes** :
>
>    * Le **même namespace** sert pour *vente* et *location* ; seules les branches/calculs `calculations.tco_vente.*` vs `calculations.tco_location.*` divergent (bannières, infographies, badges). Les pages *location* affichent “Monitoring inclus” et consomment les clés location.  
> 4. **Calculs** :
>
>    * Tout calcul (TCO, % économies, ratios, barres de timeline) **lit uniquement des variables** du store local.
>    * Si un calcul réutilise une valeur existante (ex. tension, cycles), il **réutilise la variable** déjà définie dans GLOBALS (pas de doublon).
> 5. **Traçabilité des changements** (obligatoire) :
>
>    * Pour **chaque** chiffre modifié :
>
>      * Afficher **\[ancien] → \[proposé]** + **raison** (1 ligne).
>      * **Demander l’autorisation** avant d’appliquer (workflow “APPROUVÉ/REFUSÉ”).
> 6. **Sélecteurs et bindings** :
>
>    * Remplacer tout hard-code par un binding via attributs existants `data-pricing-value`, `data-pricing-format`, `data-pricing-suffix` **ou** un équivalent minimal si absent. Les exemples fournis montrent déjà ce pattern (specs/comparaison/infographie).     
> 7. **Aucun texte de style/marketing modifié** : uniquement la substitution numérique → variables.

# Modèle de variables (GLOBALS)

J’ai généré un **C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\Presentateur\LiCUBEPRO\Correction\GLOBALS.initial.json** (vente + location) cohérent avec le document de référence et les gabarits. Tu peux l’utiliser tel quel comme **const globale** au chargement, puis le cloner pour l’état local.

Points saillants (extraits) :

* `licube.energy_total_wh = 2688` (25.6 V × 105 Ah). Le doc montre 2520 Wh dans un tableau récapitulatif **et** 2688 Wh en fiche technique ; on unifie sur 2688 Wh (cohérent avec 25.6 V).  
* `nicd.cycle_life_typical = 2500` (médiane du doc 2000–3000). Une page montre 1500 cycles → proposition de correction ci-dessous. 
* Branches dédiées :

  * `calculations.tco_vente.*` pour les 12 pages vente (badges “90 % économies” à corriger → calculé dynamiquement). 
  * `calculations.tco_location.*` pour les 12 pages location (badges “95 % économies” idem). 

👉 Fichier prêt : [GLOBALS.initial.json](sandbox:/mnt/data/GLOBALS.initial.json)

# Mapping variables ↔ pages

J’ai **scanné automatiquement** 6 fichiers HTML aleatoire de (vente + location) et extrait tous les `data-pricing-value` rencontrés pour produire un **C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\Presentateur\LiCUBEPRO\Correctionmapping CSV** (variable → occurrences de pages et balises).
pour une premiere iteration a valiser par la suite
(Exemples d’ancrages déjà présents : `licube.cycle_life`, `licube.weight_reduction_percentage`, `calculations.tco_vente.savings.*`, `calculations.tco_location.*`, etc.)     

# Propositions de corrections (avec demande d’approbation)

voici les écarts détectés les plus importants :

**\[A] Énergie totale Li-CUBE PRO™**
Référence : **2688 Wh** (25.6 V × 105 Ah) → **Proposition : conserver 2688 Wh** partout.
Éléments divergents : tableau comparatif (2520 Wh) vs fiches/HTML (2688 Wh). Raison : 2688 Wh est mathématiquement cohérent avec la tension nominale 25.6 V et la capacité 105 Ah.  
**Action** : Remplacer toute occurrence de 2520 Wh par la variable `licube.energy_total_wh`.
**Validation** : **APPROUVÉ / REFUSÉ**

**\[B] Durée de vie Ni-Cd**
Référence : **2000–3000 cycles** (doc). Certaines pages affichent **1500 cycles**. → **Proposition : 2500 cycles** (valeur médiane) **ou** afficher la plage “2000–3000 cycles”, selon ton choix ; dans tous les cas, la valeur doit venir de `nicd.cycle_life_typical` ou d’une paire min/max si tu préfères. Raison : réaligner sur le document de référence. 
**Action** : Remplacer 1500 par la variable choisie.
**Validation** : **APPROUVÉ / REFUSÉ**

**\[C] % d’économies TCO (badges “90 %” vs “95 %”)**
Référence chiffrée doc (ex.) : LFP ≈ **2 500 CAD** (20 ans) vs Ni-Cd **≥ 45 000 CAD** (20 ans). Calcul variable : **≈ 94,4 %** d’économies, donc les badges **doivent être calculés dynamiquement** depuis `calculations.*` au lieu d’être hardcodés à 90 % ou 95 %. Raison : éviter les incohérences entre vente/location et rester exact si les entrées changent.  
**Action** : Supprimer tout pourcentage codé en dur au profit d’un rendu basé sur `savings.total` et `savings.percentage`.
**Validation** : **APPROUVÉ / REFUSÉ**

**\[D] Densité énergétique Li-CUBE PRO™**
Référence : le doc mentionne **≈110 Wh/kg** (tableau) et **\~117 Wh/kg** (fiche). Les pages HTML reprennent **117 Wh/kg** (cohérent avec 2688 Wh / 23 kg). → \*\*Proposition : unifier sur **117 Wh/kg** via `licube.energy_density_wh_per_kg`. 
**Validation** : **APPROUVÉ / REFUSÉ**

valide ces point et si tu les valide demande moi si tu pourra l'appliquer

# Intégration technique – 24 pages (12 vente + 12 location)

1. **Charger GLOBALS** (const) puis **cloner** en `state` local :

   ```js
   import GLOBALS from './GLOBALS.initial.json';
   const state = structuredClone(GLOBALS);
   ```
2. **Binding universel** : garder le système existant `data-pricing-value` ; si un élément chiffré n’a pas encore l’attribut, l’ajouter et supprimer tout texte numérique codé en dur. Les exemples de specs/comparaison/infographie montrent déjà ce mécanisme pour vente **et** location.     
3. **Calculs** : les sliders et graphes lisent/écrivent **le `state` local uniquement** ; pas d’écriture dans GLOBALS.
4. **Déduplication** : auditer les doublons via `mapping_variables_pages.csv` et **remapper** vers une seule variable (ex. tous les “23 kg” → `licube.weight_kg`).
5. **Modes** : détecter automatiquement vente/location et pointer vers `calculations.tco_vente.*` ou `calculations.tco_location.*` pour les badges, tuiles, infographies. Les pages *location* affichent explicitement “Monitoring inclus”, déjà prévu dans les gabarits.  


