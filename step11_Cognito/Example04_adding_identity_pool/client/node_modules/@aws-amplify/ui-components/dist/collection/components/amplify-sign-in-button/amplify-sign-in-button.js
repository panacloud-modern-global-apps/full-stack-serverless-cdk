import { Component, h, Prop } from '@stencil/core';
import { icons } from '../amplify-icon/icons';
/**
 * @slot (default) - Content placed inside the button
 */
export class AmplifySignInButton {
    render() {
        return (h("div", { class: `sign-in-button ${this.provider}` },
            h("button", null,
                this.provider in icons && (h("span", { class: "icon" },
                    h("amplify-icon", { name: this.provider }))),
                h("span", { class: "content" },
                    h("slot", null)))));
    }
    static get is() { return "amplify-sign-in-button"; }
    static get encapsulation() { return "scoped"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-sign-in-button.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-sign-in-button.css"]
    }; }
    static get properties() { return {
        "provider": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "'amazon' | 'auth0' | 'facebook' | 'google' | 'oauth'",
                "resolved": "\"amazon\" | \"auth0\" | \"facebook\" | \"google\" | \"oauth\"",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Specifies the federation provider."
            },
            "attribute": "provider",
            "reflect": false
        }
    }; }
}
