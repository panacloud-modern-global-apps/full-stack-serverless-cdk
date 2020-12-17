import { Component, Element, Prop, h } from '@stencil/core';
export class AmplifyLink {
    constructor() {
        /** The link role is used to identify an element that creates a hyperlink to a resource that is in the application or external */
        this.role = 'navigation';
    }
    render() {
        return (h("a", { class: "link", role: this.role },
            h("slot", null)));
    }
    static get is() { return "amplify-link"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-link.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-link.css"]
    }; }
    static get properties() { return {
        "role": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The link role is used to identify an element that creates a hyperlink to a resource that is in the application or external"
            },
            "attribute": "role",
            "reflect": false,
            "defaultValue": "'navigation'"
        }
    }; }
    static get elementRef() { return "el"; }
}
