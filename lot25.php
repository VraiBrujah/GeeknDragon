<?php
header('Location: product.php?id=lot25' . (isset($_GET['from']) ? '&from=' . urlencode($_GET['from']) : ''), true, 301);
exit;
?>
