# GeeknDragon

Site web Geek&Dragon

## Project overview

GeeknDragon is a lightweight PHP web shop. It showcases and sells immersive accessories for role‑playing games. The project does not rely on a framework: PHP files render the pages and checkout is processed through Snipcart's API via a single server‑side webhook. Stock levels are managed directly through Snipcart's Inventory API.

## Product lots and custom chests

The shop offers several coin bundles:

- **Lot de 10 – L’Offrande du Vagabond** – 60 $ (2 coins of each metal with a selectable multiplier)
- **Lot de 25 – La Monnaie des Royaumes** – 145 $ (1 coin of each metal for each multiplier)
- **Lot de 50 – L’Essence des Royaumes** – 275 $ (2 coins of each metal for each multiplier)
- **Lot de 50 – La Trésorerie du Seigneur Marchand** – 275 $ (10 coins of each metal with a selectable multiplier)

The corresponding product identifiers are `lot10`, `lot25`, `lot50-essence` and `lot50-tresorerie`. When adding or removing products, update `data/products.json` accordingly.

Need more than 50 pieces or a custom assortment? Request a personalized chest through the quote form available at `/contact`.

### Adding product images

Place product photos under `images/Piece/pro/`. Each item typically uses a full‑resolution image and a 300 px thumbnail (e.g. `lot10Piece.png` and `lot10Piece-300.png`).

## Environment variables

The central configuration file `config.php` normalises environment values before they are consumed by the application. Define the following entries in your `.env` file or hosting control panel:

- `APP_ENV` and `APP_DEBUG` – select between `production` and `development`, and toggle verbose logging locally.
- `SNIPCART_API_KEY` – public Snipcart key exposed to the storefront.
- `SNIPCART_SECRET_API_KEY` – private Snipcart key used server-side (the legacy name `SNIPCART_SECRET_KEY` remains supported for the admin dashboard).
- `QUOTE_EMAIL` – destination address for contact and quote submissions (defaults to `commande@geekndragon.com`).
- `MAX_MESSAGE_CHARS` and `RATE_LIMIT_WINDOW` – tune the size and anti-spam throttling of the public forms.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` and `SMTP_SECURE` – credentials for the transactional mailbox used by `SmtpMailer`.

## Local setup

1. Install PHP (7.4 or newer) and clone this repository.
2. Copy `.env.example` to `.env` and provide values for `APP_ENV`, `SNIPCART_API_KEY`, `SNIPCART_SECRET_API_KEY` (or the legacy `SNIPCART_SECRET_KEY`), `QUOTE_EMAIL`, the SMTP variables and the form limits (`MAX_MESSAGE_CHARS`, `RATE_LIMIT_WINDOW`).
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

The unified Snipcart webhook (`/snipcart/webhook`) must be reachable via HTTPS. When testing locally you can expose your development server with a tool such as ngrok.

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

Adjust the path as needed for your own hosting. Ensure the environment variables are set in cPanel so that the Snipcart webhook works.

In the Snipcart dashboard:

1. Set **Dynamic shipping** to `https://your-domain.com/snipcart/webhook` and select the **POST** method.

With this hook enabled, shipping rates are calculated dynamically when customers check out.

## Maintenance tasks

- Regenerate `sitemap.xml` after adding or removing public pages:

  ```bash
  php tools/build-sitemap.php
  ```

## Manual tests

To ensure the currency converter handles invalid inputs correctly:

1. Open the shop page (`boutique.php`) in a browser.
2. In the currency converter, enter a decimal such as `1.5` and move focus away. The converter floors the value to `1` and a warning appears.
3. Enter a negative value such as `-3`. The converter clamps the amount to `0` and displays the warning.
4. Remove the invalid characters and verify that the warning disappears and the totals update.


## Generated files

The presentation tool under `Eds/ClaudePresentation/presentationObj` generates temporary assets that are not committed to the repository:

- `node_modules/`
- `viewer/output.css`
- `viewer/*.html`
- build directories such as `dist/`, `tsbuild/` and `build/`

These files can be recreated as needed and are ignored via `.gitignore`.
