class CustomWidgetPlugin {
    constructor(editor) {
        this.editor = editor;
    }

    load() {
        const customWidgets = JSON.parse(localStorage.getItem('customWidgets') || '[]');
        customWidgets.forEach(def => {
            if (def.id && def.class) {
                this.editor.availableWidgets.set(def.id, def.class);
            }
        });
    }
}

class ExtendedWidgetEditor extends window.WidgetEditor {
    constructor() {
        super();
        this.customPlugin = new CustomWidgetPlugin(this);
        this.customPlugin.load();
    }
}

window.widgetEditor = new ExtendedWidgetEditor();
