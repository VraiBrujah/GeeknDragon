<?php
return [
    'secret' => $_ENV['STRIPE_SECRET_KEY']
        ?? $_SERVER['STRIPE_SECRET_KEY'] 
        ?? $_ENV['STRIPE_SECRET']
        ?? $_SERVER['STRIPE_SECRET']
        ?? '',
    'public' => $_ENV['STRIPE_PUBLIC_KEY']
        ?? $_SERVER['STRIPE_PUBLIC_KEY']
        ?? '',
    'webhook_secret' => $_ENV['STRIPE_WEBHOOK_SECRET']
        ?? $_SERVER['STRIPE_WEBHOOK_SECRET']
        ?? '',
];
