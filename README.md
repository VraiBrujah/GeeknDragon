# GeeknDragon
Site web Geek&amp;Dragon

## Environment variables

The application expects a couple of secrets to be provided through the
environment:

- `SHIPPING_SECRET` – secret used by `shipping.php` to verify Snipcart
  webhook signatures.
- `ORDER_SECRET` – secret used by `decrement-stock.php` when handling the
  "order completed" webhook.
