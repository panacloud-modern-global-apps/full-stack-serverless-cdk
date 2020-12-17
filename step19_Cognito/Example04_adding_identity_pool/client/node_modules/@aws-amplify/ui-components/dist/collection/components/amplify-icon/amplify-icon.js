import { Component, Prop, Watch } from '@stencil/core';
import { icons } from './icons';
export class AmplifyIcon {
    validateName(newValue) {
        const isBlank = typeof newValue == null;
        if (isBlank) {
            throw new Error('name: required');
        }
    }
    // https://stenciljs.com/docs/templating-jsx#avoid-shared-jsx-nodes
    render() {
        return icons[this.name]();
    }
    static get is() { return "amplify-icon"; }
    static get encapsulation() { return "scoped"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-icon.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-icon.css"]
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
                        "path": "./icons"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "(Required) Name of icon used to determine the icon rendered"
            },
            "attribute": "name",
            "reflect": false
        }
    }; }
    static get watchers() { return [{
            "propName": "name",
            "methodName": "validateName"
        }]; }
}
