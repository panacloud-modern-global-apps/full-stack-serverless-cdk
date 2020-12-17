import { Component, h } from '@stencil/core';
export class AmplifyNav {
    render() {
        return (h("nav", { class: "nav" },
            h("slot", null)));
    }
    static get is() { return "amplify-nav"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-nav.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-nav.css"]
    }; }
}
