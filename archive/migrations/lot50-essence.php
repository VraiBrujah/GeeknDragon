<?php
// Redirection automatique vers le nouvel ID
header('Location: product.php?id=coin-merchant-essence-double' . (isset($_GET['from']) ? '&from=' . urlencode($_GET['from']) : ''));
exit;
?>