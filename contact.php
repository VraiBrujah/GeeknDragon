<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact - Geek & Dragon</title>
  <meta name="description" content="Formulaire de contact pour Geek & Dragon">
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
  <header class="header">
    <nav class="nav-container">
      <div class="logo">
        <a href="index.html">
          <span class="logo-text">Geek&Dragon</span>
        </a>
      </div>
      <ul class="nav-menu">
        <li><a href="boutique.html" class="nav-link">Boutique</a></li>
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

  <main id="main" class="pt-32 flex items-center justify-center min-h-screen px-4">
    <div class="parchment rounded-3xl p-10 md:p-14 w-full max-w-2xl text-gray-900">
      <h1 class="text-4xl font-bold text-center mb-6">Demande de devis</h1>
      <p class="text-center mb-8 text-lg txt-court">Pour recevoir une offre personnalisée, remplis ce formulaire magique.</p>
      <form action="merci.html" method="GET" class="space-y-6" novalidate>
        <div>
          <label for="name" class="block text-[#4b3e2c] font-semibold mb-2">Nom complet *</label>
          <input id="name" name="name" type="text" required minlength="2" maxlength="120" placeholder="Ex. Jean Dupont" class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>
        <div>
          <label for="email" class="block text-[#4b3e2c] font-semibold mb-2">Adresse e-mail *</label>
          <input id="email" name="email" type="email" required maxlength="160" placeholder="vous@exemple.com" class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>
        <div>
          <label for="phone" class="block text-[#4b3e2c] font-semibold mb-2">Téléphone</label>
          <input id="phone" name="phone" type="tel" maxlength="40" placeholder="Optionnel" class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
        </div>
        <div>
          <label for="service" class="block text-[#4b3e2c] font-semibold mb-2">Sujet / Service</label>
          <select id="service" name="service" class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600">
            <option value="Devis boutique en ligne">Devis boutique en ligne</option>
            <option value="Site vitrine">Site vitrine</option>
            <option value="Maintenance / Support">Maintenance / Support</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label for="message" class="block text-[#4b3e2c] font-semibold mb-2">Votre demande *</label>
          <textarea id="message" name="message" rows="6" required maxlength="3000" placeholder="Dites-nous tout..." class="w-full rounded-md border border-gray-300 p-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"></textarea>
          <div class="text-sm text-gray-500 mt-1"><span id="char-count">0</span> / 3000 caractères</div>
        </div>
        <div class="text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <p><strong>Protection des données :</strong> En envoyant ce formulaire, vous acceptez que nous utilisions vos informations pour vous répondre par email. Vos données ne seront pas transmises à des tiers.</p>
        </div>
        <button type="submit" class="btn w-full bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full transition">Envoyer ma demande</button>
      </form>
      <div class="text-center mt-10 text-sm">
        <p class="txt-court"><strong>Brujah</strong> — Responsable produit</p>
        <p class="txt-court"><a href="mailto:contact@geekndragon.com" class="text-indigo-700 hover:underline">contact@geekndragon.com</a></p>
        <p class="txt-court"><a href="tel:+14387642612" class="text-indigo-700 hover:underline">+1 438 764-2612</a></p>
      </div>
    </div>
  </main>

  <script src="js/script.js"></script>
  <script>
  document.addEventListener('DOMContentLoaded', function() {
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    function updateCharCount() {
      const count = messageTextarea.value.length;
      charCount.textContent = count;
      if (count > 3000) {
        charCount.classList.add('text-red-500');
        charCount.classList.remove('text-gray-500');
      } else {
        charCount.classList.add('text-gray-500');
        charCount.classList.remove('text-red-500');
      }
    }
    messageTextarea.addEventListener('input', updateCharCount);
    updateCharCount();
  });
  </script>
</body>
</html>
