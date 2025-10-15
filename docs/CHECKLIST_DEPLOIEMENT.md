# Checklist Déploiement Production - GeeknDragon

## 📋 Pré-Déploiement (Staging)

### ✅ Configuration Environnement

- [ ] **Variables d'environnement staging configurées**
  - [ ] `DEBUG_MODE=true` (staging uniquement)
  - [ ] Clés Snipcart TEST configurées
  - [ ] SendGrid configuré (compte test ou redirection)
  - [ ] `ADMIN_PASSWORD_HASH` défini (mot de passe test)

- [ ] **Fichier `.env.staging` créé**
  ```bash
  cp .env.staging.example .env
  # Éditer .env avec valeurs réelles
  ```

- [ ] **Serveur staging accessible**
  - [ ] URL: `https://staging.geekndragon.com`
  - [ ] SSL/TLS actif
  - [ ] PHP 8.1+ installé
  - [ ] Extensions PHP requises: curl, json, mbstring, fileinfo

---

### ✅ Tests Fonctionnels

- [ ] **Navigation générale**
  - [ ] Page d'accueil charge sans erreur
  - [ ] Menu navigation fonctionne (desktop + mobile)
  - [ ] Changement de langue (fr/en)
  - [ ] Footer liens valides

- [ ] **Boutique**
  - [ ] Liste produits s'affiche
  - [ ] Filtres fonctionnent
  - [ ] Images produits chargent
  - [ ] Prix affichés correctement

- [ ] **Snipcart**
  - [ ] Ajout produit au panier
  - [ ] Panier s'ouvre correctement
  - [ ] Mode TEST Snipcart actif
  - [ ] Checkout test fonctionnel
  - [ ] Webhook reçu (vérifier logs)

- [ ] **Formulaire contact**
  - [ ] Validation côté client fonctionne
  - [ ] Protection CSRF active
  - [ ] Email reçu avec **accents corrects** ✨
  - [ ] Logs dans `logs/contact_success.log`

  ```bash
  # Test automatisé
  php tests/test-contact-form.php
  ```

- [ ] **Vidéo Hero (page d'accueil)**
  - [ ] Vidéo principale charge
  - [ ] Pas de lag sur mobile
  - [ ] Transitions fluides
  - [ ] Fallback image fonctionne (si implémenté)

---

### ✅ Tests Performance

- [ ] **Lighthouse Audit exécuté**
  ```bash
  node scripts/lighthouse-audit.js https://staging.geekndragon.com
  ```

- [ ] **Baseline métriques enregistrée**
  - [ ] Performance score > 80 (mobile)
  - [ ] LCP < 2.5s (mobile)
  - [ ] FCP < 1.8s
  - [ ] CLS < 0.1
  - [ ] Accessibility > 90

- [ ] **Vérifications manuelles**
  - [ ] Temps chargement acceptable sur 3G simulé
  - [ ] Aucune erreur console (sauf logs debug attendus)
  - [ ] Assets en cache (vérifier headers `Cache-Control`)

---

### ✅ Tests Sécurité

- [ ] **Headers HTTP**
  - [ ] CSP configuré (`.htaccess`)
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] SSL/TLS actif (HTTPS forcé)

- [ ] **Protection dossiers**
  - [ ] `logs/` inaccessible (tester `https://staging.../logs/`)
  - [ ] `cache/` inaccessible
  - [ ] `.env` inaccessible (hors webroot ou protégé)

- [ ] **Admin**
  - [ ] Login fonctionne avec mot de passe test
  - [ ] Session expire après inactivité
  - [ ] Protection CSRF sur actions admin
  - [ ] Déconnexion fonctionne

- [ ] **Validation inputs**
  - [ ] Formulaire contact protégé contre injection
  - [ ] URLs produits validées (pas de XSS)
  - [ ] Upload fichiers désactivé (si non requis)

---

### ✅ Tests Compatibilité

- [ ] **Navigateurs Desktop**
  - [ ] Chrome/Edge (dernière version)
  - [ ] Firefox (dernière version)
  - [ ] Safari macOS (si possible)

- [ ] **Navigateurs Mobile**
  - [ ] Chrome Android
  - [ ] Safari iOS
  - [ ] Mode responsive Chrome DevTools

- [ ] **Résolutions**
  - [ ] Mobile 375px (iPhone SE)
  - [ ] Tablet 768px (iPad)
  - [ ] Desktop 1920px

---

## 🚀 Déploiement Production

### ✅ Préparation

- [ ] **Backup complet**
  - [ ] Base de données exportée (si applicable)
  - [ ] Fichiers actuels archivés
  - [ ] `.env` production sauvegardé séparément

- [ ] **Variables production configurées**
  - [ ] `DEBUG_MODE=false` ⚠️ **CRITIQUE**
  - [ ] Clés Snipcart PRODUCTION
  - [ ] SendGrid production (emails réels)
  - [ ] `GA_MEASUREMENT_ID` production
  - [ ] `ADMIN_PASSWORD_HASH` **fort et unique**

- [ ] **Vérifications finales**
  - [ ] Dernière version Git taguée
    ```bash
    git tag -a v2.1.0 -m "Version 2.1.0 - Optimisations production"
    git push origin v2.1.0
    ```
  - [ ] Changelog à jour
  - [ ] Documentation README à jour

---

### ✅ Déploiement

- [ ] **Upload fichiers**
  - [ ] Code déployé (FTP/rsync/Git)
  - [ ] Permissions correctes (755 dossiers, 644 fichiers)
  - [ ] `.env` production copié (NE PAS committer)

- [ ] **Vérifications post-déploiement**
  - [ ] Site accessible (HTTPS)
  - [ ] Page d'accueil charge
  - [ ] Aucune erreur PHP (vérifier logs serveur)
  - [ ] Assets chargent (CSS, JS, images)

- [ ] **Tests smoke production**
  - [ ] Navigation principale
  - [ ] Ajout produit panier Snipcart
  - [ ] Formulaire contact (envoyer test réel)
  - [ ] Admin login

---

### ✅ Monitoring Post-Déploiement

- [ ] **Surveillance immédiate (15 min)**
  - [ ] Logs erreurs PHP vides
  - [ ] Logs erreurs JavaScript (console)
  - [ ] Webhook Snipcart fonctionne
  - [ ] Emails contact arrivent

- [ ] **Surveillance 24h**
  - [ ] Métriques analytics (GA4)
  - [ ] Taux erreur < 1%
  - [ ] Performance stable (Lighthouse)
  - [ ] Aucun feedback négatif utilisateurs

- [ ] **Surveillance 7 jours**
  - [ ] Conversions Snipcart normales
  - [ ] SEO stable (Search Console)
  - [ ] Aucune régression détectée

---

## 🔄 Rollback (Si Problème)

### Procédure d'urgence

1. **Identifier le problème**
   - Vérifier logs serveur
   - Vérifier console navigateur
   - Noter métriques affectées

2. **Décision rollback**
   - Problème critique bloquant → Rollback immédiat
   - Problème mineur → Fix forward possible

3. **Exécution rollback**
   ```bash
   # Restaurer backup
   rsync -av backup_YYYYMMDD/ /chemin/production/

   # Vérifier .env production restauré
   # Vider caches (Opcache, Redis si applicable)

   # Tester site restauré
   ```

4. **Communication**
   - [ ] Notifier équipe du rollback
   - [ ] Documenter cause dans incident log
   - [ ] Planifier fix et re-déploiement

---

## 📊 Métriques de Succès

### KPI Déploiement Réussi

| Métrique | Cible |
|----------|-------|
| Uptime 24h | > 99.9% |
| Erreurs PHP | 0 critique |
| Temps réponse moyen | < 500ms |
| LCP mobile | < 2.5s |
| Conversions Snipcart | Stable ou + |
| Emails contact délivrés | 100% |
| Score Lighthouse mobile | > 80 |

---

## 📝 Notes Post-Déploiement

**Date déploiement**: _____________________

**Version déployée**: v2.1.0

**Déployé par**: _____________________

**Incidents rencontrés**:
- [ ] Aucun
- [ ] Mineurs (décrire): _______________
- [ ] Majeurs (décrire): _______________

**Actions correctives**:
- _____________________________________
- _____________________________________

**Validation finale**:
- [ ] ✅ Site production stable
- [ ] ✅ Métriques KPI atteintes
- [ ] ✅ Monitoring actif
- [ ] ✅ Équipe notifiée

---

**Signature**: _____________________
**Date validation**: _____________________
