# GeeknDragon

Site web Geek&Dragon

## Project overview

GeeknDragon is a lightweight PHP web shop powered by [Snipcart](https://snipcart.com/). It showcases and sells immersive accessories for role‑playing games. The project does not rely on a framework: PHP files render the pages and Snipcart handles the shopping cart and checkout. Stock levels are stored in `stock.json` and are automatically updated through webhooks when an order is completed.

## Environment variables

The application expects a couple of secrets to be provided through the environment:

- `SHIPPING_SECRET` – secret used by `shipping.php` to verify Snipcart webhook signatures.
- `ORDER_SECRET` – secret used by `decrement-stock.php` when handling the "order completed" webhook.

## Local setup

1. Install PHP (7.4 or newer) and clone this repository.
2. Set the environment variables listed above. They can be exported in your shell or stored in a local `.env` file that you load before running the server.
3. Edit `boutique.php` and replace the value of `data-api-key` with your own Snipcart public API key.
4. Start a local server from the project root:

   ```bash
   php -S localhost:8000
   ```

5. Browse to <http://localhost:8000> to view the site.

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

