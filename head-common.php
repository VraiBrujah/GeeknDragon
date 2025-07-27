<?php
/** head-common.php - shared head section */
?>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= htmlspecialchars($title ?? 'Geek & Dragon') ?></title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/styles.css">
  <?php if (!empty($extraHead)) echo $extraHead; ?>
</head>

