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

### Configuring multipliers in Snipcart

Multipliers are handled with Snipcart custom fields. Add a `<select>` with the class `multiplier-select` and set the `data-item-custom1-name`, `data-item-custom1-options` (such as `1|10|100|1000|10000`) and `data-item-custom1-value` attributes on the `snipcart-add-item` button to let customers choose the desired multiplier.

## Environment variables

The application expects a few secrets to be provided through the environment:

- `SNIPCART_API_KEY` – your public Snipcart API key.
- `SNIPCART_SECRET_API_KEY` – secret key used to query Snipcart's API for inventory updates.
- `QUOTE_EMAIL` – recipient for quote requests.

To send emails from the contact form, configure SMTP credentials for the fixed sender address `no-reply@geekndragon.com`:

- `SMTP_HOST` – SMTP server hostname.
- `SMTP_PORT` – SMTP server port (defaults to 587 if unset).
- `SMTP_USERNAME` – account username (usually `no-reply@geekndragon.com`).
- `SMTP_PASSWORD` – password for the SMTP account.

## Local setup

1. Install PHP (7.4 or newer) and clone this repository.
2. Copy `.env.example` to `.env` and fill in `SNIPCART_API_KEY`, `SNIPCART_SECRET_API_KEY` and the SMTP variables.
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

