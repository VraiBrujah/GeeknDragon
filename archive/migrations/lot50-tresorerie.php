<?php
// Redirection automatique vers le nouvel ID
header('Location: product.php?id=coin-lord-treasury-uniform' . (isset($_GET['from']) ? '&from=' . urlencode($_GET['from']) : ''));
exit;
?>