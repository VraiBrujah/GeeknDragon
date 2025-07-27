<?php $active='contact'; ?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Merci ! | Geek & Dragon</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&display=swap" rel="stylesheet">
  <style>
    body{font-family:'Cinzel',serif;background:url('images/bg_texture.jpg') center/cover fixed;color:#fef9e7;}
  </style>
</head>
<body class="bg-cover bg-fixed">
  <?php include 'header.php'; ?>

  <main class="pt-32 flex items-center justify-center min-h-screen">
    <div class="text-center max-w-xl bg-gray-900/70 backdrop-blur p-10 rounded-3xl border border-yellow-500 shadow-2xl">
      <h1 class="text-4xl font-bold mb-4 text-yellow-400">Merci !</h1>
      <p class="text-lg mb-6">Votre demande a bien été transmise à notre équipe.</p>
      <a href="index.php" class="inline-block bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-3 rounded-full transition">Retour à l'accueil</a>
    </div>
  </main>

  <?php include 'footer.php'; ?>
</body>
</html>
