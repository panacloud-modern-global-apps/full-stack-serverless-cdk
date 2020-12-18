import { Component, h } from '@stencil/core';
/**
 * @slot (default) - Content placed between the two horizontal rules
 */
export class AmplifyStrike {
    render() {
        return (h("span", { class: "strike-content" },
            h("slot", null)));
    }
    static get is() { return "amplify-strike"; }
    static get encapsulation() { return "scoped"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-strike.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-strike.css"]
    }; }
}
