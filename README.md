# GeeknDragon

Site web Geek&Dragon

## Project overview

GeeknDragon is a lightweight PHP web shop powered by [Snipcart](https://snipcart.com/). It showcases and sells immersive accessories for role‑playing games. The project does not rely on a framework: PHP files render the pages and Snipcart handles the shopping cart and checkout. Stock levels are managed through Snipcart's Inventory API and automatically updated via webhooks when an order is completed.

## Product lots and custom chests

The shop offers several coin bundles:

- **Lot de 10 – L’Offrande du Vagabond** – 60 $ (2 coins of each metal with a selectable multiplier)
- **Lot de 25 – La Monnaie des Royaumes** – 145 $ (1 coin of each metal for each multiplier)
- **Lot de 50 – L’Essence des Royaumes** – 275 $ (2 coins of each metal for each multiplier)
- **Lot de 50 – La Trésorerie du Seigneur Marchand** – 275 $ (10 coins of each metal with a selectable multiplier)

The corresponding product identifiers are `lot10`, `lot25`, `lot50-essence` and `lot50-tresorerie`. When adding or removing products, update `data/products.json` accordingly.

Need more than 50 pieces or a custom assortment? Request a personalized chest through the [quote form](contact.php).

### Adding product images

Place product photos under `images/Piece/pro/`. Each item typically uses a full‑resolution image and a 300 px thumbnail (e.g. `lot10Piece.png` and `lot10Piece-300.png`).

### Configuring custom fields in Snipcart

The shop reserves fixed Snipcart custom field indexes to avoid conflicts when several selectors are displayed simultaneously:

- `custom1` — language selector (`Langue`)
- `custom2` — multiplier (`Multiplicateur`)

Each `<select>` must expose its role through `data-item-custom-role="language"` or `data-item-custom-role="multiplier"` in addition to the existing `data-custom-index` attribute. On the matching `snipcart-add-item` button, set the `data-item-custom1-*` attributes for languages and the `data-item-custom2-*` attributes for multipliers, including the helper `data-item-customX-role` attribute so that the JavaScript synchronisation keeps the right labels in French and English.

## Environment variables

The application expects a few secrets to be provided through the environment:

- `SNIPCART_API_KEY` – your public Snipcart API key.
- `SNIPCART_SECRET_API_KEY` – secret key used to query Snipcart's API for inventory updates. **Keep this key strictly server-side; it must never be exposed to client-side code or shipped to the browser.**
- `SNIPCART_LANGUAGE` – locale used by Snipcart (for example `fr`).
- `SNIPCART_ADD_PRODUCT_BEHAVIOR` – how products are added to the cart (`overlay`, `sidecart`, ...).
- `GA_MEASUREMENT_ID` – identifiant de mesure Google Analytics 4 (ex. `G-XXXXXXX`) chargé automatiquement avant Snipcart afin d'éviter l'avertissement « e-commerce tracking is enabled but no service found ».
- `SENDGRID_API_KEY` – API key for the SendGrid SMTP service used to send emails.
- `QUOTE_EMAIL` – recipient for quote requests (defaults to `contact@geekndragon.com`).
- `ADMIN_PASSWORD_HASH` – hachage du mot de passe d'accès à l'espace d'administration généré avec `password_hash`. Utilisez un mot de passe fort et ne stockez jamais la valeur en clair dans le dépôt.

To send emails from the contact form using SendGrid's SMTP service, configure credentials for the fixed sender address `no-reply@geekndragon.com`:

- `SMTP_HOST` – SMTP server hostname (for SendGrid use `smtp.sendgrid.net`).
- `SMTP_PORT` – SMTP server port (defaults to 587 if unset).
- `SMTP_USERNAME` – account username (for SendGrid use `apikey`).
- `SMTP_PASSWORD` – password for the SMTP account (the same as `SENDGRID_API_KEY`).

### Mise à jour sécurisée du mot de passe administrateur

1. Choisissez un mot de passe robuste et générez son hachage depuis une machine de confiance :

   ```bash
   php -r "echo password_hash('votre-mot-de-passe-robuste', PASSWORD_DEFAULT);"
   ```

2. Copiez le hachage obtenu dans la variable `ADMIN_PASSWORD_HASH` de votre `.env` ou de votre configuration serveur.
3. Déployez la nouvelle configuration puis reconnectez-vous à l'interface `admin-products.php` avec le mot de passe en clair correspondant.
4. Supprimez toute note contenant l'ancien mot de passe et conservez le nouveau secret dans un coffre-fort dédié (ex. gestionnaire de mots de passe d'équipe).

## Local setup

1. Install PHP (7.4 or newer) and clone this repository.
2. Copy `.env.example` to `.env` and fill in `SNIPCART_API_KEY`, `SNIPCART_SECRET_API_KEY`, `SNIPCART_LANGUAGE`, `SNIPCART_ADD_PRODUCT_BEHAVIOR`, `SENDGRID_API_KEY` and the SMTP variables.
   Load these variables in your shell with `source .env`; `SNIPCART_API_KEY` must be exported before running PHP.
3. (Optional) Install Node dependencies if you need to rebuild CSS or JavaScript assets:

   ```bash
   npm install
   ```

4. Start a local server from the project root:


   ```bash
   php -S localhost:8000
   ```

5. Browse to <http://localhost:8000> to view the site.

Make sure that the domain you are using is allowed in your Snipcart dashboard; otherwise the cart may remain stuck at the "préparation" step.

The Snipcart webhooks (`shipping.php` and `decrement-stock.php`) must be reachable via HTTPS. When testing locally you can expose your development server with a tool such as ngrok.

#### Test manuel du webhook Snipcart

1. Définir la variable d'environnement `SNIPCART_SECRET_API_KEY` (ou la valeur équivalente dans `config.php`) avec votre clé secrète Snipcart.
2. Rejouer un webhook depuis le tableau de bord Snipcart ou simuler une requête HTTP `POST` sur `https://votre-domaine/snipcart-webhook-validation.php` en fournissant un corps JSON et un en-tête `X-Snipcart-RequestToken` incorrect (`curl` permet de le faire facilement).
3. Vérifier que la réponse est un statut HTTP `401` accompagné d'un corps JSON indiquant que la signature est invalide.
4. Relancer le webhook avec la signature HMAC SHA-256 correcte pour confirmer que la réponse repasse à `200` et que l'entrée est consignée dans les logs.

### Contraintes d'URL Snipcart

- Les boutons d'ajout au panier reposent sur l'attribut `data-item-url`. Grâce au helper PHP `gd_build_absolute_url()`, cette URL canonique est désormais générée automatiquement en fonction du schéma réellement utilisé (`http` ou `https`).
- En local, si vous servez le site en HTTP simple (par exemple avec `php -S localhost:8000`), Snipcart recevra bien des URL en `http://...` et acceptera les ajouts au panier. En production derrière un proxy HTTPS, les en-têtes `X-Forwarded-Proto` sont pris en charge pour conserver le schéma `https`.

## Error logging

PHP errors are not displayed in the browser. Inspect the `error.log` file at the project root to diagnose problems.

1. Ensure PHP disables `display_errors` and enables `log_errors` with a log file path:

   ```bash
   php -d display_errors=0 -d log_errors=1 -d error_log=error.log -S localhost:8000
   ```

   If using Apache or Nginx, set these directives in `php.ini` or your virtual host configuration.

2. Reproduce the failing request (for example, `curl http://localhost:8000/index.php`).

3. View the log output:

   ```bash
   tail -n 50 error.log
   ```

   The file includes the full stack trace for uncaught exceptions.

## Deployment

The repository includes a `.cpanel.yml` file used by cPanel’s Git deployment feature. When you push to the production repository, cPanel runs the tasks listed there which synchronise the project to the path defined by `DEPLOYPATH` using `rsync`:

```yaml
deployment:
  tasks:
    - export DEPLOYPATH=/home/pacti620/public_html/geekndragon.com/
    - /usr/bin/rsync -av --delete --exclude='.git/' . "$DEPLOYPATH"
```

Adjust the path as needed for your own hosting. Ensure the environment variables are set in cPanel so that the Snipcart webhooks work.

In the Snipcart dashboard:

1. Set **Dynamic shipping** to `https://your-domain.com/shipping.php` and select the **POST** method.
2. Set **Order completed** webhook to `https://your-domain.com/decrement-stock.php`.

With these hooks enabled, stock levels update automatically and shipping rates are calculated dynamically when customers check out.

