import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

/**
 * Fonction d'export de la présentation courante.
 * Capture l'écran en PNG et PDF puis regroupe l'HTML,
 * les images et des métadonnées dans une archive ZIP.
 */
export async function exporterPresentation() {
  // Récupération de l'élément racine à capturer
  const cible = document.body;

  // Capture de la zone en canvas puis conversion en PNG
  const canvas = await html2canvas(cible);
  const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

  // Conversion du canvas en PDF grâce à jsPDF
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height);
  const pdfBlob = pdf.output('blob');

  // Création de l'archive ZIP
  const zip = new JSZip();
  zip.file('capture.png', pngBlob);
  zip.file('capture.pdf', pdfBlob);
  zip.file('index.html', document.documentElement.outerHTML);

  // Ajout des images présentes dans le document
  const images = Array.from(document.images);
  for (const img of images) {
    const response = await fetch(img.src);
    const blob = await response.blob();
    const nom = img.src.split('/').pop().split('?')[0];
    zip.file(`assets/${nom}`, blob);
  }

  // Métadonnées simples
  const metadata = {
    titre: document.title,
    date: new Date().toISOString(),
  };
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // Génération du fichier ZIP et déclenchement du téléchargement
  const contenu = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(contenu);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = 'presentation.zip';
  lien.click();
  URL.revokeObjectURL(url);
}

// Installation du gestionnaire sur le bouton d'export
export function initExport() {
  const bouton = document.getElementById('btn-export');
  if (bouton) {
    bouton.addEventListener('click', exporterPresentation);
  }
}

// Initialisation automatique après chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExport);
} else {
  initExport();
}
