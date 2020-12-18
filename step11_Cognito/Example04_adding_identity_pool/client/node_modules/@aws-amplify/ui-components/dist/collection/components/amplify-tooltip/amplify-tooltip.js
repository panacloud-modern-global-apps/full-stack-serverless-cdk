import { Component, h, Prop } from '@stencil/core';
/**
 * @slot (default) - Text displayed below the tooltip. This will always be visible.
 */
export class AmplifyTooltip {
    constructor() {
        /** (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered */
        this.shouldAutoShow = false;
    }
    render() {
        return (h("div", { class: { tooltip: true, 'auto-show-tooltip': this.shouldAutoShow }, "data-text": this.text },
            h("slot", null)));
    }
    static get is() { return "amplify-tooltip"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-tooltip.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-tooltip.css"]
    }; }
    static get properties() { return {
        "text": {
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
                "text": "(Required) The text in the tooltip"
            },
            "attribute": "text",
            "reflect": false
        },
        "shouldAutoShow": {
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
                "text": "(Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered"
            },
            "attribute": "should-auto-show",
            "reflect": false,
            "defaultValue": "false"
        }
    }; }
}
