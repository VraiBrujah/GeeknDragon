# GeeknDragon

Site web Geek&Dragon

## Project overview

GeeknDragon is a lightweight PHP web shop powered by [Snipcart](https://snipcart.com/). It showcases and sells immersive accessories for role‑playing games. The project does not rely on a framework: PHP files render the pages and Snipcart handles the shopping cart and checkout. Stock levels are stored in `stock.json` and are automatically updated through webhooks when an order is completed.

## Product lots and custom chests

The shop offers several coin bundles:

- **Lot de 10 – L’Offrande du Vagabond** – 60 $ (2 coins of each metal with a selectable multiplier)
- **Lot de 25 – La Monnaie des Royaumes** – 145 $ (1 coin of each metal for each multiplier)
- **Lot de 50 – L’Essence des Royaumes** – 275 $ (2 coins of each metal for each multiplier)
- **Lot de 50 – La Trésorerie du Seigneur Marchand** – 275 $ (10 coins of each metal with a selectable multiplier)

Need more than 50 pieces or a custom assortment? Request a personalized chest through the [quote form](contact.php).

### Adding product images

Place product photos under `images/Piece/pro/`. Each item typically uses a full‑resolution image and a 300 px thumbnail (e.g. `lot10Piece.jpg` and `lot10Piece-300.jpg`).

### Configuring multipliers in Snipcart

Multipliers are handled with Snipcart custom fields. Add a `<select>` with the class `multiplier-select` and set the `data-item-custom1-name`, `data-item-custom1-options` (such as `1|10|100|1000|10000`) and `data-item-custom1-value` attributes on the `snipcart-add-item` button to let customers choose the desired multiplier.

## Environment variables

The application expects a few secrets to be provided through the environment:

- `SNIPCART_API_KEY` – your public Snipcart API key.
- `SHIPPING_SECRET` – secret used by `shipping.php` to verify Snipcart webhook signatures.
- `ORDER_SECRET` – secret used by `decrement-stock.php` when handling the "order completed" webhook.
- `SNIPCART_API_KEY` – public API key used by `boutique.php` for the Snipcart integration.

## Local setup

1. Install PHP (7.4 or newer) and clone this repository.
2. Copy `.env.example` to `.env` and fill in `SNIPCART_API_KEY`, `SHIPPING_SECRET` and `ORDER_SECRET`.
   Load these variables in your shell with `source .env`; `SNIPCART_API_KEY` must be exported before running PHP.
3. Start a local server from the project root:


   ```bash
   php -S localhost:8000
   ```

4. Browse to <http://localhost:8000> to view the site.

Make sure that the domain you are using is allowed in your Snipcart dashboard; otherwise the cart may remain stuck at the "préparation" step.

The Snipcart webhooks (`shipping.php` and `decrement-stock.php`) must be reachable via HTTPS. When testing locally you can expose your development server with a tool such as ngrok.

## Deployment

The repository includes a `.cpanel.yml` file used by cPanel’s Git deployment feature. When you push to the production repository, cPanel runs the tasks listed there which synchronise the project to the path defined by `DEPLOYPATH` using `rsync`:

```yaml
deployment:
  tasks:
    - export DEPLOYPATH=/home/pacti620/public_html/geekndragon.com/
    - /usr/bin/rsync -av --delete --exclude='.git/' . "$DEPLOYPATH"
```

Adjust the path as needed for your own hosting. Ensure the environment variables are set in cPanel so that the Snipcart shipping and order webhooks work.

In the Snipcart dashboard:

1. Set **Dynamic shipping** to `https://your-domain.com/shipping.php` and select the **POST** method.
2. Set **Order completed** webhook to `https://your-domain.com/decrement-stock.php`.

With these hooks enabled, stock levels update automatically and shipping rates are calculated dynamically when customers check out.

