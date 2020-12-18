import { Component, Prop, h } from '@stencil/core';
import { I18n } from '@aws-amplify/core';
import { Translations } from '../../common/Translations';
export class AmplifyPicker {
    constructor() {
        /** Picker button text */
        this.pickerText = Translations.PICKER_TEXT;
        /** File input accept value */
        this.acceptValue = '*/*';
    }
    render() {
        return (h("div", { class: "picker" },
            h("slot", { name: "picker" },
                h("amplify-button", null, I18n.get(this.pickerText))),
            h("input", { title: I18n.get(this.pickerText), type: "file", accept: this.acceptValue, onChange: e => this.inputHandler(e) })));
    }
    static get is() { return "amplify-picker"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-picker.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-picker.css"]
    }; }
    static get properties() { return {
        "pickerText": {
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
                "text": "Picker button text"
            },
            "attribute": "picker-text",
            "reflect": false,
            "defaultValue": "Translations.PICKER_TEXT"
        },
        "acceptValue": {
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
                "text": "File input accept value"
            },
            "attribute": "accept-value",
            "reflect": false,
            "defaultValue": "'*/*'"
        },
        "inputHandler": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "(e: Event) => void",
                "resolved": "(e: Event) => void",
                "references": {
                    "Event": {
                        "location": "global"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "File input onChange handler"
            }
        }
    }; }
}
