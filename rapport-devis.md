# Rapport mise en place du formulaire de devis

## Objectifs
- Permettre aux visiteurs de demander un devis via `/devis`.
- Envoi d'un courriel via SMTP authentifié HostPapa.
- Protection CSRF, honeypot et rate‑limit simple.

## Décisions clés
- Utilisation de **PHPMailer 6** via Composer.
- Service dédié `SmtpMailer` centralisant la configuration SMTP.
- Stockage des journaux dans `storage/form.log` (exclu du dépôt).
- Suppression de tout appel à l'API SendGrid.

## Sécurité
- CSRF : token en session et vérification côté serveur.
- Honeypot `company` pour piéger les bots.
- Limitation de requêtes par IP (`RATE_LIMIT_WINDOW`).
- Validation stricte des entrées et encodage HTML.

## Variables d'environnement
```env
SMTP_HOST=smtp.votredomaine.com
SMTP_PORT=587
SMTP_USERNAME=commande@geekndragon.com
SMTP_PASSWORD=motdepasse
SMTP_SECURE=tls
QUOTE_EMAIL=commande@geekndragon.com
RATE_LIMIT_WINDOW=120
MAX_MESSAGE_CHARS=3000
```
Placer le fichier `.env` à la racine du projet.

## Tests manuels
Voir `tests/devis-form.http` pour les commandes `curl` (succès, CSRF manquant, honeypot, rate‑limit, email invalide, message trop long).

## Déploiement HostPapa
1. Uploader les fichiers via FTP/cPanel.
2. Placer `.env` à la racine et vérifier les droits du dossier `storage` (écriture).
3. Configurer SPF/DKIM/DMARC pour `geekndragon.com`.
4. Tester l'envoi du formulaire depuis le site en HTTPS.

## Journal de migration
- Suppression de l'appel SendGrid dans `contact-handler.php` remplacé par `SmtpMailer`.

## Fichiers impactés
- `.env.example`
- `src/Service/SmtpMailer.php`
- `devis.php`
- `devis-handler.php`
- `contact-handler.php`
- `public/index.php`
- `translations/en.json`
- `translations/fr.json`
- `merci.php`
- `storage/.gitignore`
- `tests/devis-form.http`
- `rapport-devis.md`
