(async () => {
  const fs = require('fs');
  const path = require('path');
  const code = fs.readFileSync(path.join(__dirname, '../Eds/ClaudePresentation/locationVSOLD/modern/core/widget-loader.js'), 'utf8');
  const widgetLoader = (await import('data:text/javascript,' + encodeURIComponent(code))).default;

  class SimpleWidget {
    render() { return ''; }
    getStyles() { return ''; }
  }

  try {
    widgetLoader.widgetRegistry.set('simple-widget', SimpleWidget);
    const instance = await widgetLoader.createWidget('simple-widget', { test: 'value' }, false);
    console.log('Widget créé sans setData, data:', instance.data);
  } catch (err) {
    console.error('Erreur lors du test manuel:', err);
    process.exit(1);
  }
})();
