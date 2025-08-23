- Code entièrement commenté en français (ELI10, Clean Code)

## 🎯 Objectif

Produire et maintenir un code **intégralement commenté en français**, avec des **formules explicites** et des **explications pédagogiques (niveau ELI10)** pour **toutes** les variables, constantes, paramètres, fonctions et calculs.

---

## 📋 Exigences générales

1. **Langue des commentaires :** 100 % en **français clair** et correct.
2. **Style :** **Clean Code** (noms explicites, fonctions courtes, responsabilité unique, lisibilité prioritaire).
3. **Portée :** Chaque fichier, module, classe, fonction, variable et **chaque calcul** doivent être documentés.
4. **Pédagogie :** Explications **ELI10** : phrases simples, analogies au besoin, exemples concrets.
5. **Traçabilité :** Toute « valeur magique » doit être nommée, justifiée et sourcée dans les commentaires.

---

## 🧱 Pour **chaque variable/constante/paramètre**

Ajoute un **bloc de commentaire** immédiatement **au-dessus** de sa déclaration contenant :

* **Nom** et **rôle** (à quoi ça sert, en une phrase).
* **Type** (ex. `int`, `float`, `string`, structure, etc.).
* **Unité** (ex. m, s, kg, %, €) ou *sans unité* si non applicable.
* **Domaine de valeurs** attendu (min/max, valeurs autorisées, nullable?).
* **Formule d’origine** si dérivée d’un calcul.
* **Exemple** de valeur réaliste.

> ✅ Exemple de gabarit de commentaire variable

```
# Rôle      : Taux de taxe appliqué au sous-total
# Type      : float (ratio)
# Unité     : % (exprimé en décimal, ex. 0.14975 pour 14,975 %)
# Domaine   : 0.0 ≤ taux ≤ 1.0
# Formule   : taux = taxe / sous_total
# Exemple   : 0.14975
```

---

## 🧮 Pour **chaque calcul** (formule, opération, agrégat)

Ajoute un **bloc de commentaire** immédiatement **au-dessus** du calcul contenant :

* **Formule mathématique** lisible (notation claire, fractions/Σ/∏ si pertinent).
* **Définition des symboles** (chaque terme expliqué en français).
* **Hypothèses** / conditions de validité.
* **Source** (norme, doc métier, lien interne) si applicable.
* **Exemple numérique** pas à pas (avec unités) montrant le résultat attendu.

> ✅ Exemple de gabarit de commentaire calcul

```
# Formule   : total_TTC = sous_total + (sous_total × taux_taxe) - remise
# Symboles  :
#   - sous_total : somme des lignes avant taxes [€]
#   - taux_taxe  : taux de taxe (décimal, ex. 0.14975) [%]
#   - remise     : rabais absolu [€]
# Hypothèses : remise ≤ sous_total ; taux_taxe ≥ 0
# Exemple    : sous_total=100.00, taux_taxe=0.15, remise=5.00 → total_TTC=110.00
```

---

## 🧩 Pour **chaque fonction/méthode**

* **Docstring en français** (résumé, paramètres, types, unités, pré/post-conditions, exceptions, valeur de retour, complexité si utile).
* **Exemple d’appel** minimal et sortie attendue.
* **Effets de bord** explicités (I/O, mutation d’état, accès réseau, horloge système, etc.).

> ✅ Gabarit de docstring (style Google ou NumPy en français)

```
"""
Calcule le total TTC d’un panier.

Args:
  sous_total (float): Somme avant taxes [€].
  taux_taxe (float): Taux de taxe décimal (ex. 0.14975) [%].
  remise (float): Rabais absolu [€].

Returns:
  float: Total toutes taxes comprises [€].

Raises:
  ValueError: Si remise < 0 ou taux_taxe < 0.

Exemple:
  >>> calculer_total_ttc(100.0, 0.15, 5.0)
  110.0
"""
```

---

## 🧭 Règles de **formatage des commentaires**

* Place les commentaires **au-dessus** des lignes concernées (éviter fin de ligne sauf trivialité).
* Utilise des **listes à puces** et sous-titres (**Formule**, **Explication**, **Exemple**, **Unités**) pour la clarté.
* Sépare **visuellement** les sections (barres `---`).
* **Aucun** commentaire en anglais. **Aucune** abréviation opaque non définie.

---

## 🚫 Interdits

* « Magie » (nombres/coefficients) **sans justification** et sans unité.
* Variables globales **non documentées**.
* Commentaires obsolètes, redondants ou contradictoires avec le code.
* Jargon non expliqué ; acronymes non développés à la première occurrence.

---

## ✅ Vérifications attendues

* **Lint** et **type hints** activés ; code conforme aux conventions du langage.
* **Couverture de docstrings** ≥ 100 % pour les fonctions publiques.
* **Revues** focalisées sur lisibilité, exactitude des formules et unités.
* Si des formules proviennent d’un domaine métier : joindre **références** (doc interne, norme, papier).

---

## 📝 Rappel

> Chaque **variable** et **chaque calcul** doit posséder **sa formule** et **son explication** en commentaire, en français, au format **ELI10**, dans un style **Clean Code** net et explicite.