<?php
// Redirection automatique vers le nouvel ID
header('Location: product.php?id=coin-five-realms-complete' . (isset($_GET['from']) ? '&from=' . urlencode($_GET['from']) : ''));
exit;
?>