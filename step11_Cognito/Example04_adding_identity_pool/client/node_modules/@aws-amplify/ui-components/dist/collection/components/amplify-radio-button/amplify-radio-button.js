import { Component, Prop, h } from '@stencil/core';
export class AmplifyRadioButton {
    constructor() {
        /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
        this.placeholder = '';
        /** If `true`, the radio button is selected. */
        this.checked = false;
        /** If `true`, the checkbox is disabled */
        this.disabled = false;
    }
    render() {
        return (h("span", { class: "radio-button" },
            h("input", Object.assign({ type: "radio", name: this.name, value: this.value, onInput: this.handleInputChange, placeholder: this.placeholder, id: this.fieldId, checked: this.checked, disabled: this.disabled }, this.inputProps)),
            h("amplify-label", { htmlFor: this.fieldId }, this.label)));
    }
    static get is() { return "amplify-radio-button"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-radio-button.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-radio-button.css"]
    }; }
    static get properties() { return {
        "handleInputChange": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "(inputEvent: Event) => void",
                "resolved": "(inputEvent: Event) => void",
                "references": {
                    "Event": {
                        "location": "global"
                    }
                }
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [],
                "text": "The callback, called when the input is modified by the user."
            }
        },
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
                "text": "(Optional) Name of radio button"
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
                "text": "(Optional) Value of radio button"
            },
            "attribute": "value",
            "reflect": false
        },
        "placeholder": {
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
                "text": "(Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users."
            },
            "attribute": "placeholder",
            "reflect": false,
            "defaultValue": "''"
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
                "text": "Field ID used for the 'for' in the label"
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
                "text": "Label for the radio button"
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
                "text": "If `true`, the radio button is selected."
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
        },
        "inputProps": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "object",
                "resolved": "object",
                "references": {}
            },
            "required": false,
            "optional": true,
            "docs": {
                "tags": [],
                "text": "Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes"
            }
        }
    }; }
}
