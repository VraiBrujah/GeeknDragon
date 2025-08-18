<?php
return [
    'secret' => $_ENV['STRIPE_SECRET']
        ?? $_SERVER['STRIPE_SECRET']
        ?? '',
    'webhook_secret' => $_ENV['STRIPE_WEBHOOK_SECRET']
        ?? $_SERVER['STRIPE_WEBHOOK_SECRET']
        ?? '',
];
