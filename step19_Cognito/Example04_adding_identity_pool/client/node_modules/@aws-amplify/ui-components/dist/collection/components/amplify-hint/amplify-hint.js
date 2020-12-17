import { Component, h } from '@stencil/core';
/**
 * @slot (default) - Content for the hint
 */
export class AmplifyHint {
    render() {
        return (h("div", { class: "hint" },
            h("slot", null)));
    }
    static get is() { return "amplify-hint"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-hint.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-hint.css"]
    }; }
}
