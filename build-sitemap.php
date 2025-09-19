<?php
$baseUrl = 'https://geekndragon.com';
$urls = [];
// Static pages
$urls[] = '';
$urls[] = 'boutique.php';
$urls[] = 'contact.php';
// Actualités pages
foreach (glob(__DIR__ . '/actualites/*.php') as $file) {
    $relative = str_replace(__DIR__ . '/', '', $file);
    $urls[] = $relative;
}
// Product pages from data/products.json
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true);
if (is_array($data)) {
    foreach (array_keys($data) as $id) {
        $urls[] = 'product.php?id=' . urlencode($id);
    }
}
$urls = array_unique($urls);
$xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>'
);
foreach ($urls as $path) {
    $loc = rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    $url = $xml->addChild('url');
    $url->addChild('loc', $loc);
}
$dom = dom_import_simplexml($xml)->ownerDocument;
$dom->formatOutput = true;
$dom->save(__DIR__ . '/sitemap.xml');
?>
