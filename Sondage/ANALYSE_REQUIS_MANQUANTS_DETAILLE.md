# Analyse des Requis Manquants - ORIA MVP

**Date d'analyse**: 2025-10-08
**Répertoire de travail**: E:\GitHub\GeeknDragon\Sondage

---

## Résumé Exécutif

### Statistiques Globales

| Métrique | Valeur |
|----------|--------|
| **Total requis FINAL_VALIDE** | 908 |
| **Total requis 4_MODULES** | 900 |
| **Requis manquants identifiés** | 8 |
| **Taux de couverture** | 99.12% |
| **Module impacté** | MODULE 4: BIEN-ÊTRE |
| **Section impactée** | 4.3 Sécurité et Permissions |

### Impact Estimé

| Critère | Détails |
|---------|---------|
| **Temps total de développement** | 248-456h (5.2-9.5 semaines pour 1 dev) |
| **Complexité moyenne** | 6.5/10 (Moyenne-Élevée) |
| **Priorité fonctionnelle** | Haute (sécurité système) |
| **Type de requis** | Fondamentaux sécurité et gestion utilisateurs |

---

## Détails des Requis Manquants

### MODULE 4: BIEN-ÊTRE - Section 4.3 Sécurité et Permissions

Tous les 8 requis manquants appartiennent à la section **Sécurité et Permissions** du module BIEN-ÊTRE.

#### 1. BET-016: Gérer comptes utilisateurs
- **Complexité**: 5/10 (Moyenne)
- **Estimation**: 8-16h
- **Description complète**: Gérer comptes utilisateurs
- **Impact**: Fonctionnalité CRUD de base pour la gestion des utilisateurs

#### 2. BET-017: Attribuer rôles (Admin/Gestionnaire/etc)
- **Complexité**: 5/10 (Moyenne)
- **Estimation**: 8-16h
- **Description complète**: Attribuer rôles (Admin/Gestionnaire/etc)
- **Impact**: Système de permissions par rôle (RBAC)

#### 3. BET-018: Authentification multi-facteurs (2FA)
- **Complexité**: 7/10 (Élevée)
- **Estimation**: 24-40h
- **Description complète**: Activer authentification multi-facteurs optionnelle (2FA) avec support TOTP apps, SMS et Email vérifiés par utilisateur
- **Impact**: Sécurité renforcée, conformité normes

#### 4. BET-019: Politique mot de passe
- **Complexité**: 5/10 (Moyenne)
- **Estimation**: 8-16h
- **Description complète**: Politique mot de passe (complexité, expiration)
- **Impact**: Validation et conformité sécuritaire

#### 5. BET-020: Journal audit complet (logs)
- **Complexité**: 7/10 (Élevée)
- **Estimation**: 24-40h
- **Description complète**: Journal audit complet (logs)
- **Impact**: Traçabilité, conformité réglementaire (CHSLD)

#### 6. BET-021: Gestion sessions actives
- **Complexité**: 7/10 (Élevée)
- **Estimation**: 24-40h
- **Description complète**: Gérer les sessions actives de tous utilisateurs et forcer déconnexion à distance en cas de compromission
- **Impact**: Sécurité temps réel, réponse aux incidents

#### 7. BET-022: Restrictions d'accès IP/géolocalisation
- **Complexité**: 7/10 (Élevée)
- **Estimation**: 24-40h
- **Description complète**: Configurer les restrictions d'accès par plage d'adresses IP ou géolocalisation pour sécurité renforcée
- **Impact**: Sécurité périmétrique

#### 8. BET-023: Détection activités suspectes (ML)
- **Complexité**: 9/10 (Très Élevée)
- **Estimation**: 80-120h
- **Description complète**: Consulter historique complet connexions avec détection automatique activités suspectes par machine learning (anomalies IP, horaires, fréquence)
- **Impact**: Sécurité proactive, IA/ML

---

## Analyse Critique

### Répartition par Complexité

| Niveau | Nombre | Total heures (min-max) | Requis |
|--------|--------|------------------------|---------|
| Moyenne (5) | 3 | 24-48h | BET-016, BET-017, BET-019 |
| Élevée (7) | 4 | 96-160h | BET-018, BET-020, BET-021, BET-022 |
| Très Élevée (9) | 1 | 80-120h | BET-023 |

### Dépendances Logiques

```
Hiérarchie des dépendances:
1. BET-016 (Gestion comptes) ← Requis fondamental
   ↓
2. BET-017 (Attribution rôles) ← Dépend de BET-016
   ↓
3. BET-019 (Politique mot de passe) ← Dépend de BET-016
   ↓
4. BET-018 (2FA) ← Dépend de BET-016 + BET-019
   ↓
5. BET-020 (Logs audit) ← Système parallèle
6. BET-021 (Gestion sessions) ← Dépend de BET-016
7. BET-022 (Restrictions IP) ← Dépend de BET-016
   ↓
8. BET-023 (ML détection) ← Dépend de BET-020 + BET-021
```

### Criticité pour le MVP

#### Requis CRITIQUES (Bloquants MVP)
- **BET-016**: Gestion comptes utilisateurs (fondation du système)
- **BET-017**: Attribution des rôles (permissions de base)
- **BET-019**: Politique mot de passe (sécurité minimale)

#### Requis IMPORTANTS (MVP souhaitable)
- **BET-020**: Journal audit (conformité CHSLD)
- **BET-021**: Gestion sessions (sécurité opérationnelle)

#### Requis POST-MVP (Améliorations futures)
- **BET-018**: 2FA (sécurité renforcée optionnelle)
- **BET-022**: Restrictions IP (sécurité avancée)
- **BET-023**: ML détection (sécurité proactive, IA)

---

## Recommandations d'Intégration

### Option 1: Intégration Complète (Recommandé)
**Objectif**: Ajouter TOUS les 8 requis au fichier 4_MODULES

**Avantages**:
- Sécurité complète dès le MVP
- Conformité réglementaire maximale
- Fondation solide pour croissance

**Inconvénients**:
- Ajoute 248-456h de développement
- Retarde le MVP de 5-10 semaines (1 dev)

**Estimation totale**: 5.2-9.5 semaines pour 1 développeur seul

### Option 2: Intégration Minimale (MVP Rapide)
**Objectif**: Ajouter UNIQUEMENT les requis critiques (BET-016, BET-017, BET-019)

**Avantages**:
- MVP fonctionnel rapidement
- Sécurité de base garantie
- Coût minimal 24-48h (0.5-1 semaine)

**Inconvénients**:
- Manque fonctionnalités audit/conformité
- Sécurité basique seulement
- Dette technique à gérer

**Estimation totale**: 24-48h (0.5-1 semaine pour 1 dev)

### Option 3: Approche Incrémentale (Équilibrée)
**Objectif**: Intégrer en 3 phases

**Phase 1 (MVP Core)** - 24-48h:
- BET-016: Gestion comptes
- BET-017: Attribution rôles
- BET-019: Politique mot de passe

**Phase 2 (MVP Sécurisé)** - +96-160h:
- BET-018: 2FA
- BET-020: Logs audit
- BET-021: Gestion sessions

**Phase 3 (Post-MVP)** - +104-160h:
- BET-022: Restrictions IP
- BET-023: ML détection

---

## Actions Immédiates Suggérées

### 1. Validation Stratégique
- [ ] Confirmer avec Product Owner la priorité réelle de chaque requis
- [ ] Vérifier conformité réglementaire CHSLD (audit obligatoire?)
- [ ] Évaluer budget temps disponible avant MVP

### 2. Décision d'Intégration
- [ ] Choisir une des 3 options (Complète/Minimale/Incrémentale)
- [ ] Planifier itérations si approche incrémentale
- [ ] Allouer ressources développement

### 3. Mise à Jour Documentation
- [ ] Ajouter requis manquants dans SONDAGE_ORIA_MVP_4_MODULES.md
- [ ] Ajuster numérotation séquence BET-XXX
- [ ] Régénérer statistiques globales (Total: 908 requis)

### 4. Communication Équipe
- [ ] Informer stakeholders de l'écart identifié
- [ ] Expliquer impact sur planning MVP
- [ ] Obtenir approbation formelle du plan retenu

---

## Méthodologie de Comparaison Utilisée

### Algorithme
1. **Extraction**: Parser les tableaux Markdown des deux fichiers
2. **Normalisation**: Trim, lowercase, suppression ponctuation
3. **Comparaison**: Similarité textuelle à 90% (SequenceMatcher)
4. **Rapport**: Identification des absences strictes

### Fichiers Analysés
- **Source**: `E:\GitHub\GeeknDragon\Sondage\archives\SONDAGE_ORIA_MVP_FINAL_VALIDE.md`
- **Cible**: `E:\GitHub\GeeknDragon\Sondage\sondages\SONDAGE_ORIA_MVP_4_MODULES.md`

### Outils
- Script Python: `E:\GitHub\GeeknDragon\Sondage\compare_requirements.py`
- Rapport brut: `E:\GitHub\GeeknDragon\Sondage\rapport_requis_manquants.txt`

---

## Conclusion

**Résultat**: 8 requis manquants identifiés, tous dans la section **Sécurité et Permissions** du module BIEN-ÊTRE.

**Impact critique**: Ces requis sont FONDAMENTAUX pour un système de gestion CHSLD sécurisé et conforme. Leur absence bloque:
- Gestion utilisateurs de base (BET-016, BET-017)
- Sécurité minimale requise (BET-019)
- Conformité réglementaire (BET-020 audit)

**Recommandation finale**: **Intégrer au minimum les 3 requis critiques (BET-016, BET-017, BET-019)** avant tout déploiement MVP. Planifier Phase 2 avec BET-020 (audit) pour conformité CHSLD.

---

**Rapport généré par**: Script automatisé de comparaison de requis
**Contact**: Brujah
**Version**: 1.0
