/**
 * Layout Loader Module
 * Centralizes the injection of the shared editor layout.
 */

async function loadLayout() {
    if (document.head.dataset.layoutLoaded) {
        return;
    }

    try {
        const response = await fetch('editor-layout.html');
        const html = await response.text();

        const template = document.createElement('template');
        template.innerHTML = html;
        const layoutTemplate = template.content.getElementById('layout');

        if (layoutTemplate) {
            document.head.appendChild(layoutTemplate.content.cloneNode(true));
            document.head.dataset.layoutLoaded = 'true';
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load editor layout:', error);
    }
}

loadLayout();

export default loadLayout;

