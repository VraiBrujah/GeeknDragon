# Rapport – Formulaire de demande de devis

## Objectifs
- Offrir un formulaire dédié aux demandes de devis.
- Abandonner l'envoi via SendGrid au profit du SMTP du domaine.
- Sécuriser la soumission : CSRF, honeypot, rate‑limit, validations.

## Décisions clés
- **PHPMailer** (via Composer) pour l'envoi SMTP.
- Service `SmtpMailer` réutilisable.
- Entrée serveur unique `devis-handler.php` (requis aussi par `contact-handler.php`).
- Redirection vers `merci.php` avec indicateur de statut (`s=ok` ou `s=err`).
- Journalisation minimaliste dans `storage/form.log`.

## Variables `.env`
```env
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=tls
SMTP_USERNAME=commande@geekndragon.com
SMTP_PASSWORD=***
QUOTE_EMAIL=commande@geekndragon.com
RATE_LIMIT_WINDOW=120
MAX_MESSAGE_CHARS=3000
```

## Tests
Voir `tests/devis-form.http` pour des scénarios `curl` reproductibles :
1. succès,
2. absence de CSRF,
3. honeypot rempli,
4. rate‑limit,
5. email invalide.

## Déploiement HostPapa
1. Copier les fichiers sur l'hébergement (FTP ou Git).
2. Créer un fichier `.env` à la racine avec les variables ci‑dessus.
3. Dans cPanel → *Email Accounts*, générer le mot de passe SMTP.
4. Autoriser `STARTTLS` port 587 ou `SMTPS` port 465.
5. Vérifier les enregistrements DNS (SPF, DKIM, DMARC) pour `geekndragon.com`.
6. Tester l'envoi via `tests/devis-form.http`.

## Journal de migration
- Suppression de tout usage SendGrid (`contact-handler.php`).
- Nouveau service SMTP (`src/Mailer/SmtpMailer.php`).

## Risques & mitigations
| Risque | Mitigation |
| --- | --- |
| Bruteforce du formulaire | Limitation par IP (`RATE_LIMIT_WINDOW`). |
| Spam bots | Champ honeypot et validation CSRF. |
| Fuite de secrets | Variables chargées via `.env`. |

## Fichiers modifiés
- `.env.example`
- `README.md`
- `src/Mailer/SmtpMailer.php`
- `devis-handler.php`, `contact-handler.php`
- `devis.php`, `merci.php`, `public/index.php`
- `translations/fr.json`, `translations/en.json`
- `tests/devis-form.http`
- `rapport-devis.md`
