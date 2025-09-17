<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Merci - Geek & Dragon</title>
  <meta name="description" content="Merci pour votre message">
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
  <header class="header">
    <nav class="nav-container">
      <div class="logo">
        <a href="index.php">
          <span class="logo-text">Geek&Dragon</span>
        </a>
      </div>
      <ul class="nav-menu">
        <li><a href="boutique.php" class="nav-link">Boutique</a></li>
        <li><a href="#catalogue" class="nav-link">Catalogue</a></li>
        <li><a href="#about" class="nav-link">À Propos</a></li>
        <li><a href="#contact" class="nav-link">Contact</a></li>
      </ul>
      <div class="nav-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  </header>

  <main id="main" class="pt-32 flex items-center justify-center min-h-screen">
    <div class="text-center max-w-xl bg-gray-900/70 backdrop-blur p-10 rounded-3xl border border-yellow-500 shadow-2xl">
      <h1 class="text-4xl font-bold mb-4 text-yellow-400">Merci !</h1>
      <p class="text-lg mb-6 txt-court">Votre demande a bien été transmise à notre équipe.</p>
      <a href="index.php" class="inline-block bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-3 rounded-full transition">Retour à l'accueil</a>
    </div>
  </main>

  <script src="js/script.js"></script>
</body>
</html>
