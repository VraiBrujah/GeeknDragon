# Guide des Prochaines Étapes - GeeknDragon v2.1.0

Ce guide détaille les 4 étapes recommandées avant mise en production.

---

## 📅 Planning Suggéré

| Étape | Durée | Responsable | Statut |
|-------|-------|-------------|--------|
| 1. Configuration Staging | 30 min | DevOps | ⏳ À faire |
| 2. Tests Formulaire Contact | 1h | QA | ⏳ À faire |
| 3. Audit Performance Lighthouse | 1h | Dev | ⏳ À faire |
| 4. Déploiement Production | 2h | DevOps | ⏳ À faire |

---

## 1️⃣ Configuration Environnement Staging

### Objectif
Créer un environnement de test identique à la production avec logs debug activés.

### Actions

#### A. Créer fichier `.env` staging
```bash
cd /chemin/projet
cp .env.staging.example .env
```

#### B. Configurer variables
Éditer `.env` avec vos valeurs réelles :

```bash
# CRITIQUE: Activer debug en staging
DEBUG_MODE=true

# Clés Snipcart TEST (pas production!)
SNIPCART_API_KEY=test_xxx
SNIPCART_SECRET_API_KEY=test_xxx

# SendGrid test ou email redirection
SENDGRID_API_KEY=SG.xxx
QUOTE_EMAIL=test@example.com

# Admin (mot de passe test)
ADMIN_PASSWORD_HASH=$2y$10$...
```

#### C. Générer mot de passe admin test
```bash
php -r "echo password_hash('staging123', PASSWORD_BCRYPT);"
# Copier le hash dans .env
```

#### D. Déployer sur serveur staging
```bash
# Via rsync (exemple)
rsync -avz --exclude='.git' --exclude='node_modules' \
  ./ user@staging.geekndragon.com:/var/www/staging/

# Copier .env manuellement (ne pas committer!)
scp .env user@staging.geekndragon.com:/var/www/staging/
```

#### E. Vérifier accès
1. Ouvrir `https://staging.geekndragon.com`
2. Ouvrir console navigateur (F12)
3. Vérifier : `window.DEBUG_MODE === true`
4. Vérifier : Logs Snipcart/GTag affichés

### ✅ Validation
- [ ] Site staging accessible
- [ ] `DEBUG_MODE=true` actif
- [ ] Logs debug visibles console
- [ ] SSL/HTTPS actif
- [ ] Snipcart en mode TEST

---

## 2️⃣ Tests Formulaire Contact

### Objectif
Valider que les emails arrivent avec accents corrects (fix UTF-8 appliqué).

### Actions

#### A. Test automatisé
```bash
cd /chemin/projet
php tests/test-contact-form.php
```

**Résultat attendu** :
```
=== TEST FORMULAIRE CONTACT ===

ℹ Test 1: Configuration SendGrid
✓ SENDGRID_API_KEY configurée
ℹ Test 2: Fonction sendSendgridMail
✓ Fonction sendSendgridMail disponible
ℹ Test 3: Validation email
✓ Email 'valid@example.com' validé correctement
✓ Email 'user+tag@example.com' validé correctement
ℹ Test 4: Encodage UTF-8
✓ UTF-8 préservé: Bonjour, voici mon message avec des...
✓ UTF-8 préservé: Test caractères spéciaux: €, £, ¥...
ℹ Test 5: Simulation payload SendGrid
✓ Payload JSON propre (sans entités HTML)
✓ Accents préservés dans payload

=== RÉSUMÉ ===
✓ Configuration validée
✓ Encodage UTF-8 fonctionnel
✓ Payload SendGrid correct
```

#### B. Test manuel (optionnel)
1. Éditer `tests/test-contact-form.php` ligne ~120
2. Décommenter section envoi réel
3. Remplacer `votre-email@example.com` par votre email
4. Exécuter : `php tests/test-contact-form.php`
5. Vérifier email reçu avec **accents corrects**

#### C. Test via formulaire web
1. Ouvrir `https://staging.geekndragon.com/contact.php`
2. Remplir formulaire avec message contenant accents :
   ```
   Nom: Jean-François
   Email: test@example.com
   Message: Bonjour! J'aimerais des informations sur l'été 2025.
   ```
3. Soumettre
4. Vérifier email reçu à `QUOTE_EMAIL`
5. **Confirmer : "été", "J'aimerais" s'affichent correctement**

### ✅ Validation
- [ ] Tests automatisés passent (7/7)
- [ ] Email test reçu
- [ ] Accents préservés : é è à ô ç
- [ ] Apostrophes correctes : '
- [ ] Aucune entité HTML : pas de `&eacute;`

---

## 3️⃣ Audit Performance Lighthouse

### Objectif
Établir baseline de performance avant optimisations futures.

### Prérequis
```bash
# Installer Lighthouse (si pas déjà fait)
npm install --save-dev lighthouse chrome-launcher

# Ou globalement
npm install -g lighthouse
```

### Actions

#### A. Audit automatisé via script
```bash
# Depuis racine projet
node scripts/lighthouse-audit.js https://staging.geekndragon.com
```

**Le script audite automatiquement** :
- Page d'accueil (desktop + mobile)
- Page boutique (desktop + mobile)
- Page produit (mobile)

**Résultats** sauvegardés dans `tests/lighthouse-reports/` :
- Rapports HTML détaillés
- JSON pour analyse
- `summary.md` comparatif

#### B. Audit manuel (alternatif)
```bash
# Chrome DevTools
1. Ouvrir https://staging.geekndragon.com
2. F12 → Onglet Lighthouse
3. Sélectionner : Performance, Accessibility, Best Practices, SEO
4. Device: Mobile
5. Cliquer "Analyze page load"

# Ligne de commande
lighthouse https://staging.geekndragon.com \
  --output html --output-path ./rapport.html \
  --preset desktop
```

#### C. Analyser résultats
Métriques cibles (mobile) :

| Métrique | Cible | Critique |
|----------|-------|----------|
| Performance | > 80 | Oui |
| LCP | < 2.5s | Oui |
| FCP | < 1.8s | Non |
| CLS | < 0.1 | Oui |
| Accessibility | > 90 | Oui |

**Problèmes courants attendus** :
- ⚠️ Vidéo hero lourde (LCP élevé mobile) → Optimisation future
- ⚠️ JavaScript non utilisé → Bundle splitting futur
- ✅ Aucun problème bloquant attendu

#### D. Documenter baseline
Copier métriques dans `docs/PERFORMANCE_BASELINE.md` :
```markdown
# Baseline Performance - v2.1.0

Date: YYYY-MM-DD

## Page d'accueil (Mobile)
- Performance: 85/100
- LCP: 2.8s
- FCP: 1.2s
- CLS: 0.05

## Actions futures
- Optimiser vidéo hero (image fallback mobile)
- Lazy-load images produits
```

### ✅ Validation
- [ ] Audit exécuté sur 5 pages
- [ ] Performance mobile > 75 (acceptable si > 80)
- [ ] Accessibility > 90
- [ ] Aucune erreur critique détectée
- [ ] Baseline documentée

---

## 4️⃣ Déploiement Production

### Objectif
Déployer version 2.1.0 en production avec checklist complète.

### Prérequis
- [ ] Étapes 1-3 terminées et validées
- [ ] Backup production effectué
- [ ] Accès serveur production configuré

### Actions

#### A. Préparation (30 min)

**1. Backup complet**
```bash
# Base de données (si applicable)
mysqldump -u user -p geekndragon > backup_$(date +%Y%m%d).sql

# Fichiers
tar -czf backup_files_$(date +%Y%m%d).tar.gz /var/www/production/

# Sauvegarder .env production
cp /var/www/production/.env /secure/backup/.env.prod
```

**2. Créer `.env` production**
```bash
# Copier template
cp .env.staging.example .env.production

# MODIFIER VALEURS CRITIQUES:
DEBUG_MODE=false                    # ⚠️ CRITIQUE
SNIPCART_API_KEY=live_xxx          # Clés PRODUCTION
SNIPCART_SECRET_API_KEY=live_xxx   # Clés PRODUCTION
SENDGRID_API_KEY=SG.prod_xxx       # SendGrid production
GA_MEASUREMENT_ID=G-XXXXXXXXXX     # GA4 production
ADMIN_PASSWORD_HASH=$2y$10$...     # Mot de passe FORT
```

**3. Générer mot de passe admin production**
```bash
# Utiliser mot de passe FORT (20+ caractères)
php -r "echo password_hash('VotreMotDePasseTrèsFort123!@#', PASSWORD_BCRYPT);"
```

**4. Tagger version Git**
```bash
git tag -a v2.1.0 -m "Version 2.1.0 - Optimisations production ready"
git push origin v2.1.0
```

#### B. Déploiement (1h)

**1. Upload code**
```bash
# Méthode 1: rsync
rsync -avz --exclude='.git' --exclude='node_modules' \
  --exclude='.env' --exclude='tests/' \
  ./ user@geekndragon.com:/var/www/production/

# Méthode 2: Git (si configuré)
ssh user@geekndragon.com
cd /var/www/production
git pull origin main
git checkout v2.1.0
```

**2. Copier .env production**
```bash
# NE JAMAIS committer .env !
scp .env.production user@geekndragon.com:/var/www/production/.env
```

**3. Vérifier permissions**
```bash
ssh user@geekndragon.com
cd /var/www/production
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 .env  # Protection stricte
```

**4. Vider caches**
```bash
# Opcache PHP
sudo service php8.1-fpm reload

# Cache application
rm -rf cache/markdown/*
```

#### C. Vérification (30 min)

**Suivre checklist** : `docs/CHECKLIST_DEPLOIEMENT.md`

Tests critiques :
```bash
# 1. Site accessible
curl -I https://geekndragon.com
# Attendu: HTTP/2 200

# 2. Aucune erreur PHP
tail -f /var/log/php-fpm/error.log

# 3. Test Snipcart
# Ajouter produit panier → Vérifier webhook reçu

# 4. Test formulaire contact
# Envoyer message test → Vérifier email reçu

# 5. Vérifier DEBUG_MODE=false
curl https://geekndragon.com | grep 'DEBUG_MODE'
# Attendu: window.DEBUG_MODE = false;
```

#### D. Monitoring (24h)

**Surveillance immédiate (15 min)** :
- [ ] Site répond (< 1s)
- [ ] Aucune erreur logs PHP
- [ ] Console navigateur propre
- [ ] Snipcart fonctionne

**Surveillance 1h** :
- [ ] Analytics enregistre visites
- [ ] Conversions normales
- [ ] Performance stable

**Surveillance 24h** :
- [ ] Uptime > 99.9%
- [ ] Taux erreur < 0.1%
- [ ] Métriques KPI stables

### ✅ Validation Finale
- [ ] ✅ Site production accessible
- [ ] ✅ `DEBUG_MODE=false` confirmé
- [ ] ✅ Tests smoke passent (5/5)
- [ ] ✅ Monitoring actif
- [ ] ✅ Backup sauvegardé
- [ ] ✅ Équipe notifiée

---

## 🆘 Rollback d'Urgence

**Si problème critique détecté** :

```bash
# 1. Se connecter serveur
ssh user@geekndragon.com

# 2. Restaurer backup
cd /var/www/production
rm -rf *
tar -xzf /secure/backup/backup_files_YYYYMMDD.tar.gz

# 3. Restaurer .env
cp /secure/backup/.env.prod .env

# 4. Vider caches
sudo service php8.1-fpm reload

# 5. Vérifier site
curl -I https://geekndragon.com
```

**Documenter incident** dans `docs/INCIDENTS.md`.

---

## 📊 Métriques de Succès

**Déploiement réussi si** :

| Métrique | Cible | Méthode Mesure |
|----------|-------|----------------|
| Uptime 24h | > 99.9% | UptimeRobot |
| Erreurs critiques | 0 | Logs serveur |
| Temps réponse | < 500ms | Lighthouse |
| LCP mobile | < 3s | Lighthouse |
| Conversions | Stable ou + | Snipcart dashboard |
| Emails livrés | 100% | SendGrid dashboard |

---

## 🎉 Checklist Complète

Cocher après validation :

### Staging
- [ ] `.env.staging` configuré
- [ ] DEBUG_MODE=true actif
- [ ] Tests automatisés passent
- [ ] Formulaire contact validé
- [ ] Audit Lighthouse exécuté
- [ ] Baseline documentée

### Production
- [ ] Backup effectué
- [ ] `.env.production` configuré
- [ ] DEBUG_MODE=false ⚠️
- [ ] Code déployé (v2.1.0)
- [ ] Tests smoke passent
- [ ] Monitoring actif 24h
- [ ] Équipe notifiée

---

**Prochaine révision** : 7 jours après déploiement
**Contact support** : Documenter incidents dans GitHub Issues
