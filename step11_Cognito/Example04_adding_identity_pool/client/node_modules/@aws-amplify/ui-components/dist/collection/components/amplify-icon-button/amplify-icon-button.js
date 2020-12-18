import { Component, Prop, h } from '@stencil/core';
export class AmplifyIconButton {
    constructor() {
        /** (Optional) The tooltip that will show on hover of the button */
        this.tooltip = null;
        /** (Optional) Whether or not to show the tooltip automatically */
        this.autoShowTooltip = false;
    }
    render() {
        return (h("span", { class: "action-button" },
            h("amplify-tooltip", { text: this.tooltip, shouldAutoShow: this.autoShowTooltip },
                h("button", null,
                    h("amplify-icon", { name: this.name })))));
    }
    static get is() { return "amplify-icon-button"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-icon-button.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-icon-button.css"]
    }; }
    static get properties() { return {
        "name": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "IconNameType",
                "resolved": "\"amazon\" | \"auth0\" | \"ban\" | \"enter-vr\" | \"exit-vr\" | \"facebook\" | \"google\" | \"loading\" | \"maximize\" | \"microphone\" | \"minimize\" | \"photoPlaceholder\" | \"send\" | \"sound\" | \"sound-mute\" | \"warning\"",
                "references": {
                    "IconNameType": {
                        "location": "import",
                        "path": "../amplify-icon/icons"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The name of the icon used inside of the button"
            },
            "attribute": "name",
            "reflect": false
        },
        "tooltip": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string | null",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "(Optional) The tooltip that will show on hover of the button"
            },
            "attribute": "tooltip",
            "reflect": false,
            "defaultValue": "null"
        },
        "autoShowTooltip": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "(Optional) Whether or not to show the tooltip automatically"
            },
            "attribute": "auto-show-tooltip",
            "reflect": false,
            "defaultValue": "false"
        }
    }; }
}
