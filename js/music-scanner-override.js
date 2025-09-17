// Ajoute un fallback GET(Range) si le serveur ne supporte pas HEAD
(function ensureScannerFallback(){
  function patch() {
    const Cls = window.MusicFileScanner;
    if (!Cls || !Cls.prototype) return false;
    const orig = Cls.prototype.scanCommonFiles;
    if (typeof orig !== 'function') return false;

    Cls.prototype.scanCommonFiles = async function(directory){
      const foundFiles = [];
      for (const fileName of this.commonMusicNames) {
        const filePath = `${directory}/${fileName}`;
        let ok = false;
        try {
          try {
            const resHead = await fetch(filePath, { method: 'HEAD' });
            ok = resHead.ok;
          } catch(_) {}
          if (!ok) {
            try {
              const resGet = await fetch(filePath, { method:'GET', headers:{ 'Range':'bytes=0-0' } });
              ok = resGet.ok || resGet.status === 206;
            } catch(_) {}
          }
        } catch(_) {}
        if (ok) foundFiles.push(filePath);
      }
      return foundFiles;
    };
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(patch, 0));
  } else {
    // essaie plusieurs fois pour attendre que music-scanner.js soit chargé dynamiquement
    let tries = 0;
    (function tryPatch(){
      if (patch()) return;
      if (++tries < 50) setTimeout(tryPatch, 100);
    })();
  }
})();

