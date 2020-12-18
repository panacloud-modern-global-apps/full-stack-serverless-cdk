import { Component, h } from '@stencil/core';
export class AmplifyLoadingSpinner {
    render() {
        return h("amplify-icon", { class: "loading-spinner", name: "loading" });
    }
    static get is() { return "amplify-loading-spinner"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-loading-spinner.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-loading-spinner.css"]
    }; }
}
