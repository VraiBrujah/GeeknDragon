# 🎵 Guide d'Organisation des Fichiers Musicaux

## Structure Recommandée

Pour organiser vos fichiers musicaux selon les campagnes, voici la structure que le gestionnaire attend :

```
musique/
├── campagne/
│   └── le_coffre_fort_oublie/
│       ├── 01 - L'Aurore Céleste.mp3        # Musique générale
│       ├── 08 - Héros de Verdure.mp3        # Musique générale  
│       ├── L'Écho des Donjons.mp3           # Musique générale
│       │
│       ├── acte1/                           # Musiques Acte I
│       │   ├── L'Écho des Donjons.mp3
│       │   ├── L'Épopée du Donjon.mp3
│       │   ├── La Ballade du Donjon Perdu.mp3
│       │   └── La Légende du Donjon Perdu.mp3
│       │
│       ├── acte2/                           # Musiques Acte II
│       │   ├── Eywa's Whisper.mp3
│       │   ├── Eywa's Whisper (1).mp3
│       │   ├── danse des pieces.mp3
│       │   ├── 08 - Héros de Verdure.mp3
│       │   └── combat/                      # Combat spécialisé
│       │       ├── Eywa's Whisper.mp3
│       │       └── Eywa's Whisper (1).mp3
│       │
│       └── acte3/                           # Musiques Acte III
│           ├── Agdon.mp3
│           ├── 01 - L'Aurore Céleste.mp3
│           └── dragon_boss/                 # Boss final
│               └── Agdon.mp3
```

## Fichiers Actuels à Déplacer

D'après votre structure actuelle, voici comment réorganiser :

### 🎯 **Fichiers Racine** → `musique/campagne/le_coffre_fort_oublie/`
- `01 - L'Aurore Céleste.mp3`
- `08 - Héros de Verdure.mp3` 
- `L'Écho des Donjons.mp3`
- `Agdon.mp3`

### 🏪 **Dossier `boutique/`** → `musique/campagne/le_coffre_fort_oublie/acte1/`
- `danse des pieces.mp3` → aussi vers `acte2/`
- `L'Épopée du Donjon.mp3`
- `La Ballade du Donjon Perdu.mp3`
- `La Légende du Donjon Perdu.mp3`

### ⚔️ **Dossier `guerre/`** → `musique/campagne/le_coffre_fort_oublie/acte2/`
- `Eywa's Whisper.mp3`
- `Eywa's Whisper (1).mp3`

## Commandes de Migration

Voici les commandes pour réorganiser automatiquement :

```bash
# Créer la structure de dossiers (déjà fait)

# Copier les fichiers généraux
cp "musique/01 - L'Aurore Céleste.mp3" "musique/campagne/le_coffre_fort_oublie/"
cp "musique/08 - Héros de Verdure.mp3" "musique/campagne/le_coffre_fort_oublie/"
cp "musique/L'Écho des Donjons.mp3" "musique/campagne/le_coffre_fort_oublie/"
cp "musique/Agdon.mp3" "musique/campagne/le_coffre_fort_oublie/"

# Copier vers Acte 1
cp "musique/L'Écho des Donjons.mp3" "musique/campagne/le_coffre_fort_oublie/acte1/"
cp "musique/boutique/L'Épopée du Donjon.mp3" "musique/campagne/le_coffre_fort_oublie/acte1/"
cp "musique/boutique/La Ballade du Donjon Perdu.mp3" "musique/campagne/le_coffre_fort_oublie/acte1/"
cp "musique/boutique/La Légende du Donjon Perdu.mp3" "musique/campagne/le_coffre_fort_oublie/acte1/"

# Copier vers Acte 2
cp "musique/guerre/Eywa's Whisper.mp3" "musique/campagne/le_coffre_fort_oublie/acte2/"
cp "musique/guerre/Eywa's Whisper (1).mp3" "musique/campagne/le_coffre_fort_oublie/acte2/"
cp "musique/boutique/danse des pieces.mp3" "musique/campagne/le_coffre_fort_oublie/acte2/"
cp "musique/08 - Héros de Verdure.mp3" "musique/campagne/le_coffre_fort_oublie/acte2/"

# Copier vers combat spécialisé
cp "musique/guerre/Eywa's Whisper.mp3" "musique/campagne/le_coffre_fort_oublie/acte2/combat/"
cp "musique/guerre/Eywa's Whisper (1).mp3" "musique/campagne/le_coffre_fort_oublie/acte2/combat/"

# Copier vers Acte 3
cp "musique/Agdon.mp3" "musique/campagne/le_coffre_fort_oublie/acte3/"
cp "musique/01 - L'Aurore Céleste.mp3" "musique/campagne/le_coffre_fort_oublie/acte3/"

# Copier vers boss final
cp "musique/Agdon.mp3" "musique/campagne/le_coffre_fort_oublie/acte3/dragon_boss/"
```

## Hiérarchie Contextuelle

Le système musical suit cette logique :

1. **Plus spécifique en premier** : `campagne/acte3/dragon_vert` 
2. **Remontée hiérarchique** : `campagne/acte3`
3. **Fallback général** : `campagne`

### Exemple de Navigation
- **Dans "Dragon Vert"** → Joue `dragon_boss/Agdon.mp3`
- **Dans "Acte III"** → Joue aléatoirement dans `acte3/`
- **Dans "Campagne"** → Joue aléatoirement dans `le_coffre_fort_oublie/`

## Avantages de cette Organisation

✅ **Contextualisation parfaite** : La musique s'adapte automatiquement  
✅ **Réutilisabilité** : Même fichier dans plusieurs contextes  
✅ **Extensibilité** : Facile d'ajouter de nouvelles campagnes  
✅ **Fallback intelligent** : Jamais de silence  
✅ **Performances** : Chargement optimisé  

## Pour les Prochaines Campagnes

Créer simplement :
```
musique/campagne/ma_nouvelle_campagne/
├── musique_generale.mp3
├── acte1/
├── acte2/
└── boss_final/
```

Et mettre à jour le JSON avec les nouveaux chemins !

---

*La musique contextuelle transforme complètement l'immersion ! 🎵🎭*