<?php
/**
 * Partial : Indicateurs de confiance
 * Utilisé dans : boutique.php, product.php, index.php
 */
?>
<div class="gd-trust-section">
  <div class="gd-trust-badges">
    <!-- Paiement sécurisé -->
    <div class="gd-trust-badge">
      <span class="gd-trust-icon" aria-hidden="true">🔒</span>
      <span data-i18n="trust.secure_payment">Paiement sécurisé via Snipcart</span>
    </div>
    
    <!-- Logos des moyens de paiement -->
    <div class="gd-trust-badge">
      <?php include __DIR__ . '/payment-icons.php'; ?>
    </div>
    
    <!-- Fabrication québécoise -->
    <div class="gd-trust-badge">
      <span class="gd-trust-icon" aria-hidden="true">🍁</span>
      <span data-i18n="trust.made_in_quebec">Fabriqué au Québec</span>
    </div>
    
    <!-- Qualité premium -->
    <div class="gd-trust-badge">
      <span class="gd-trust-icon" aria-hidden="true">⭐</span>
      <span data-i18n="trust.premium_quality">Qualité premium</span>
    </div>
    
    <!-- Livraison rapide -->
    <div class="gd-trust-badge">
      <span class="gd-trust-icon" aria-hidden="true">🚚</span>
      <span data-i18n="trust.fast_shipping">Livraison rapide</span>
    </div>
    
    <!-- Support client -->
    <div class="gd-trust-badge">
      <span class="gd-trust-icon" aria-hidden="true">💬</span>
      <span data-i18n="trust.customer_support">Support client dédié</span>
    </div>
  </div>
</div>