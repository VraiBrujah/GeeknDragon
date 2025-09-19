<?php
header('Location: product.php?id=lot50-essence' . (isset($_GET['from']) ? '&from=' . urlencode($_GET['from']) : ''), true, 301);
exit;
?>
