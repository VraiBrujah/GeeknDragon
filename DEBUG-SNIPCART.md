# 🔍 Debug Snipcart - Guide de Débogage

**Répertoire de Travail :** `E:\GitHub\GeeknDragon`

## 🎯 Objectif

Identifier pourquoi les produits ajoutés depuis aide-jeux.php n'ont pas les mêmes données que depuis boutique.php.

---

## 📋 Étapes de Débogage

### 1. Ouvrir la Console (F12)

1. Ouvrir `http://localhost:8000/aide-jeux.php#convertisseur`
2. Appuyer sur **F12** → Onglet **Console**
3. Entrer montant : `1661 cuivres`
4. Cliquer **"Collection la Plus Efficace"**

### 2. Analyser les Logs

Tu devrais voir dans la console :

```
=== DONNÉES ENVOYÉES À SNIPCART (Collection Efficace) ===
productsToAdd: [
  {
    "product": {
      "id": "coin-custom-single",
      "name": "Pièce Personnalisée",
      "name_en": "Custom Coin",
      "summary": "...",
      "summary_en": "...",
      "image": "/media/products/coins/coin-gold-1.webp",
      "price": 10,
      "url": "..."
    },
    "quantity": 1,
    "customFields": {
      "custom1": {
        "name": "Métal",
        "type": "dropdown",
        "options": "copper[+0.00]|silver[+0.00]|...",
        "value": "copper",
        "role": "metal"
      },
      "custom2": {
        "name": "Multiplicateur",
        "type": "dropdown",
        "options": "1[+0.00]|10[+10.00]|...",
        "value": "1",
        "role": "multiplier"
      }
    }
  }
]

=== SNIPCART API DATA ===
productData reçu: { id: "coin-custom-single", name: "...", ... }
options reçues: { quantity: 1, customFields: {...} }
Bouton créé HTML: <button class="snipcart-add-item btn-cart-icon" data-item-id="coin-custom-single" data-item-name="Pièce Personnalisée" ...>
snipcartData extrait: {
  "id": "coin-custom-single",
  "name": "Pièce Personnalisée",
  "price": 10,
  "url": "...",
  "quantity": 1,
  "description": "...",
  "image": "/media/products/coins/coin-gold-1.webp",
  "customFields": [
    {
      "name": "Métal",
      "value": "copper",
      "type": "dropdown",
      "options": "copper[+0.00]|silver[+0.00]|..."
    },
    {
      "name": "Multiplicateur",
      "value": "1",
      "type": "dropdown",
      "options": "1[+0.00]|10[+10.00]|..."
    }
  ]
}
```

### 3. Vérifications Clés

#### ✅ A. Données productsToAdd

**Vérifier que `productsToAdd` contient :**
- [ ] `product.image` présent (ex: "/media/products/coins/coin-gold-1.webp")
- [ ] `product.name_en` présent
- [ ] `product.summary_en` présent
- [ ] `customFields.custom1.type` = "dropdown"
- [ ] `customFields.custom1.options` = "copper[+0.00]|silver[+0.00]|..."
- [ ] `customFields.custom2.type` = "dropdown"
- [ ] `customFields.custom2.options` = "1[+0.00]|10[+10.00]|..."

#### ✅ B. Bouton HTML créé

**Vérifier que le bouton contient les attributs :**
```html
data-item-id="coin-custom-single"
data-item-name="Pièce Personnalisée"
data-item-image="/media/products/coins/coin-gold-1.webp"
data-item-custom1-name="Métal"
data-item-custom1-type="dropdown"
data-item-custom1-options="copper[+0.00]|silver[+0.00]|..."
data-item-custom1-value="copper"
data-item-custom2-name="Multiplicateur"
data-item-custom2-type="dropdown"
data-item-custom2-options="1[+0.00]|10[+10.00]|..."
data-item-custom2-value="1"
```

#### ✅ C. Données extraites (snipcartData)

**Vérifier que `snipcartData` contient :**
```javascript
{
  "id": "coin-custom-single",
  "name": "Pièce Personnalisée",
  "price": 10,
  "image": "/media/products/coins/coin-gold-1.webp",  // ← Important !
  "customFields": [
    {
      "name": "Métal",
      "value": "copper",
      "type": "dropdown",        // ← Important !
      "options": "copper[+0.00]|silver[+0.00]|..."  // ← Important !
    },
    {
      "name": "Multiplicateur",
      "value": "1",
      "type": "dropdown",        // ← Important !
      "options": "1[+0.00]|10[+10.00]|..."  // ← Important !
    }
  ]
}
```

---

## 🚨 Problèmes Possibles

### Problème 1 : customFields est un objet au lieu d'un tableau

**Symptôme :**
```javascript
customFields: { custom1: {...}, custom2: {...} }  // ❌ Objet
```

**Solution attendue :**
```javascript
customFields: [
  { name: "Métal", value: "copper", type: "dropdown", options: "..." },
  { name: "Multiplicateur", value: "1", type: "dropdown", options: "..." }
]  // ✅ Tableau
```

**Si c'est le cas :** L'API Snipcart attend un **tableau**, pas un objet !

### Problème 2 : customFields manque type et options

**Symptôme :**
```javascript
customFields: [
  { name: "Métal", value: "copper" }  // ❌ Pas de type/options
]
```

**Solution :** Vérifier que `extractProductDataFromButton` récupère bien :
- `data-item-custom1-type`
- `data-item-custom1-options`

### Problème 3 : Image manquante

**Symptôme :**
```javascript
{
  "id": "coin-custom-single",
  "name": "Pièce Personnalisée",
  // ❌ Pas de "image"
}
```

**Solution :** Vérifier que :
1. `productData.image` est défini dans aide-jeux.php
2. `data-item-image` est créé dans le bouton
3. `extractProductDataFromButton` récupère `data-item-image`

---

## 🔧 Actions Correctives

### Si customFields est un objet

Il faut **convertir l'objet en tableau** avant de l'envoyer à Snipcart.

**Dans SnipcartUtils.extractProductDataFromButton :**
```javascript
// Au lieu de construire un tableau, si customFields est déjà un objet
// Il faut peut-être le transformer

// OU dans addMultipleToCart, avant d'appeler addToCart :
productsToAdd = productsToAdd.map(item => {
  if (item.customFields && !Array.isArray(item.customFields)) {
    // Convertir objet → tableau
    item.customFields = Object.values(item.customFields).map((field, index) => ({
      name: field.name,
      value: field.value,
      type: field.type,
      options: field.options
    }));
  }
  return item;
});
```

### Si type et options manquent

**Vérifier dans `extractProductDataFromButton` :**
```javascript
const customType = button.getAttribute(`data-item-custom${i}-type`);
const customOptions = button.getAttribute(`data-item-custom${i}-options`);

if (customType) {
    field.type = customType;
}

if (customOptions) {
    field.options = customOptions;
}
```

---

## 📊 Comparaison Boutique vs Aide-Jeux

### Depuis Boutique (Référence ✅)

**Ouvrir boutique.php et ajouter un produit :**
```
http://localhost:8000/boutique.php
```

**Dans Snipcart, inspecter l'item (F12 → Console) :**
```javascript
Snipcart.api.cart.items.all()
```

**Résultat attendu :**
```javascript
[
  {
    "id": "coin-custom-single",
    "name": "Pièce Personnalisée (cuivre ×1)",
    "image": "/media/products/coins/coin-gold-1.webp",
    "customFields": [
      { "name": "Metal", "value": "copper", "type": "dropdown", "options": "..." },
      { "name": "Multiplicateur", "value": "1", "type": "dropdown", "options": "..." }
    ]
  }
]
```

### Depuis Aide-Jeux (À Corriger ❌)

**Ajouter le même produit depuis aide-jeux.php**

**Comparer les données avec :**
```javascript
Snipcart.api.cart.items.all()
```

**Si différent → Identifier les champs manquants**

---

## ✅ Résultat Attendu Final

**Après toutes les corrections, les deux devraient être IDENTIQUES :**

```javascript
// Boutique.php
{
  "id": "coin-custom-single",
  "name": "Pièce Personnalisée (cuivre ×1)",
  "image": "/media/products/coins/coin-gold-1.webp",
  "customFields": [
    { "name": "Metal", "value": "copper", "type": "dropdown", "options": "copper[+0.00]|silver[+0.00]|..." },
    { "name": "Multiplicateur", "value": "1", "type": "dropdown", "options": "1[+0.00]|10[+10.00]|..." }
  ]
}

// Aide-jeux.php (DOIT ÊTRE IDENTIQUE)
{
  "id": "coin-custom-single",
  "name": "Pièce Personnalisée (cuivre ×1)",
  "image": "/media/products/coins/coin-gold-1.webp",
  "customFields": [
    { "name": "Métal", "value": "copper", "type": "dropdown", "options": "copper[+0.00]|silver[+0.00]|..." },
    { "name": "Multiplicateur", "value": "1", "type": "dropdown", "options": "1[+0.00]|10[+10.00]|..." }
  ]
}
```

**Seule différence acceptable :** Nom du champ en français vs anglais

---

## 🎯 Instructions Utilisateur

1. **Rafraîchir la page** avec **Ctrl+F5**
2. **Ouvrir console** (F12)
3. **Tester ajout au panier** depuis aide-jeux.php
4. **Copier tous les logs** de la console
5. **Me les envoyer** pour analyse

**Format attendu :**
```
=== DONNÉES ENVOYÉES À SNIPCART (Collection Efficace) ===
[copier le JSON complet]

=== SNIPCART API DATA ===
[copier tous les logs]
```

Cela me permettra de voir exactement où le problème se situe ! 🔍
