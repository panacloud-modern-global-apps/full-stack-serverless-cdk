import { Component, Prop, h } from '@stencil/core';
export class AmplifyCheckbox {
    constructor() {
        /** If `true`, the checkbox is selected. */
        this.checked = false;
        /** If `true`, the checkbox is disabled */
        this.disabled = false;
        this.onClick = () => {
            this.checked = !this.checked;
        };
    }
    render() {
        return (h("span", { class: "checkbox" },
            h("input", { onClick: this.onClick, type: "checkbox", name: this.name, value: this.value, id: this.fieldId, checked: this.checked, disabled: this.disabled }),
            h("amplify-label", { htmlFor: this.fieldId }, this.label)));
    }
    static get is() { return "amplify-checkbox"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-checkbox.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-checkbox.css"]
    }; }
    static get properties() { return {
        "name": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [],
                "text": "Name of the checkbox"
            },
            "attribute": "name",
            "reflect": false
        },
        "value": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [],
                "text": "Value of the checkbox"
            },
            "attribute": "value",
            "reflect": false
        },
        "fieldId": {
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
                "text": "Field ID used for the 'htmlFor' in the label"
            },
            "attribute": "field-id",
            "reflect": false
        },
        "label": {
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
                "text": "Label for the checkbox"
            },
            "attribute": "label",
            "reflect": false
        },
        "checked": {
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
                "text": "If `true`, the checkbox is selected."
            },
            "attribute": "checked",
            "reflect": false,
            "defaultValue": "false"
        },
        "disabled": {
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
                "text": "If `true`, the checkbox is disabled"
            },
            "attribute": "disabled",
            "reflect": false,
            "defaultValue": "false"
        }
    }; }
}
