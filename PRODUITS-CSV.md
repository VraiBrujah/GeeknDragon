# 📊 Système de gestion CSV des produits

## 🎯 Objectif
Remplacer le hardcodage par un système de gestion des produits entièrement basé sur CSV, permettant des modifications faciles sans connaissances techniques.

## 🚀 Utilisation

### 🎛️ Scripts Windows (recommandé)
1. **Double-cliquez sur `Gestion-Produits.bat`** pour choisir votre outil
2. **Ou directement :**
   - `update-products.bat` - Script simple avec menu
   - `Update-Products.ps1` - Script PowerShell avancé avec statistiques

### 🌐 Interface d'administration web
1. Accédez à `/admin-products.php`
2. Connectez-vous (mot de passe: `geekndragon2024`)
3. **Téléchargez le CSV** pour modification
4. **Importez le CSV** modifié

### 📝 Modification manuelle rapide
```bash
# Générer le CSV depuis le JSON actuel
php scripts/generate-initial-csv.php

# Éditer data/products.csv avec Excel/LibreOffice
# Puis convertir :
php -r "
require 'includes/csv-products-manager.php';
$manager = new CsvProductsManager();
echo $manager->convertCsvToJson('data/products.csv', 'data/products.json')['message'];
"
```

### 🔥 Utilisation PowerShell en ligne de commande
```powershell
# Actions directes sans menu
./Update-Products.ps1 -Action validate    # Valider le CSV
./Update-Products.ps1 -Action convert     # Convertir CSV → JSON
./Update-Products.ps1 -Action export      # Exporter JSON → CSV
./Update-Products.ps1 -Action stats       # Afficher statistiques
./Update-Products.ps1 -Action test        # Test bidirectionnel

# Conversion forcée (sans confirmation)
./Update-Products.ps1 -Action convert -Force

# Mode silencieux
./Update-Products.ps1 -Action export -Quiet
```

## 📋 Structure CSV

**Format :** Séparateur point-virgule (`;`) - standard français Excel/LibreOffice  
**Encodage :** UTF-8 avec BOM

| Colonne | Description | Format |
|---------|-------------|--------|
| `id` | Identifiant unique | `piece-personnalisee` |
| `name_fr` / `name_en` | Noms français/anglais | Texte |
| `price` | Prix | `10.99` |
| `description_fr` / `description_en` | Descriptions complètes | Markdown |
| `summary_fr` / `summary_en` | Résumés courts | Texte |
| `images` | Chemins des images | `/media/img1.webp\|/media/img2.webp` |
| `multipliers` | Multiplicateurs | `1\|10\|100\|1000\|10000` |
| `metals_fr` / `metals_en` | Métaux | `cuivre\|argent\|électrum\|or\|platine` |
| `languages` | Langues disponibles | `FR\|EN` |
| `coin_lots` | Lots de pièces | `{"copper":1,"silver":2}` |
| `customizable` | Personnalisable | `VRAI` / `FAUX` |
| `triptych_options` | Options triptyque | `option1\|option2\|option3` |
| `triptych_type` | Type triptyque | `espece` / `classe` / `historique` |

## ✅ Avantages

- **✨ Zéro hardcodage** : Tout est externalisé dans le CSV
- **🎯 Simplicité** : Édition avec Excel/LibreOffice
- **🔒 Sécurité** : Backup automatique des modifications
- **♻️ Réutilisation** : Code existant préservé
- **🎨 Flexibilité** : Images, variations, options entièrement configurables

## 🛠️ Fichiers créés

### 📁 **Scripts et interfaces**
- `Gestion-Produits.bat` - **Lanceur principal** (double-clic)
- `update-products.bat` - Script Batch avec menu interactif
- `Update-Products.ps1` - Script PowerShell avancé avec statistiques
- `admin-products.php` - Interface web d'administration

### 📁 **Système de gestion**
- `includes/csv-products-manager.php` - Classe de conversion CSV ↔ JSON
- `data/products.csv` - **Fichier CSV des produits** (éditable)
- `scripts/generate-initial-csv.php` - Générateur CSV depuis JSON
- `scripts/test-csv-conversion.php` - Tests de validation

## 🔐 Sécurité

- Interface protégée par mot de passe
- Validation complète du CSV avant import
- Backup automatique du JSON avant modification
- Logs d'erreurs détaillés

## 🧪 Tests

La conversion bidirectionnelle a été testée avec succès :
- ✅ 13 produits exportés
- ✅ Validation CSV réussie  
- ✅ Import sans perte de données
- ✅ Comparaison identique après round-trip