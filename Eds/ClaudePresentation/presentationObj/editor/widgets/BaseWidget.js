"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseWidget {
    constructor(id) {
        this.id = id;
    }
    render() {
        return `<div id="${this.id}"></div>`;
    }
}
exports.default = BaseWidget;
