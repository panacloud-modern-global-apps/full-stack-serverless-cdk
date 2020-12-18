import { Component, Prop, Watch, h } from '@stencil/core';
import countryDialCodes from '../../common/country-dial-codes';
import { COUNTRY_DIAL_CODE_SUFFIX } from '../../common/constants';
export class AmplifyCountryDialCode {
    constructor() {
        /** The ID of the field.  Should match with its corresponding input's ID. */
        this.fieldId = COUNTRY_DIAL_CODE_SUFFIX;
        /** The options of the country dial code select input. */
        this.options = countryDialCodes;
        /** Default selected dial code */
        this.dialCode = '+1';
    }
    componentWillLoad() {
        this.setSelectedDialCode();
    }
    watchDialCodeHandler() {
        this.setSelectedDialCode();
    }
    setSelectedDialCode() {
        if (typeof this.dialCode === 'number') {
            this.selectedDialCode = `+${this.dialCode}`;
        }
        else {
            this.selectedDialCode = this.dialCode;
        }
    }
    render() {
        return (h("amplify-select", { fieldId: this.fieldId, options: this.options, handleInputChange: this.handleInputChange, selected: this.selectedDialCode }));
    }
    static get is() { return "amplify-country-dial-code"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
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
                "text": "The ID of the field.  Should match with its corresponding input's ID."
            },
            "attribute": "field-id",
            "reflect": false,
            "defaultValue": "COUNTRY_DIAL_CODE_SUFFIX"
        },
        "options": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "CountryCodeDialOptions",
                "resolved": "CountryCodeDialOptions",
                "references": {
                    "CountryCodeDialOptions": {
                        "location": "import",
                        "path": "./amplify-country-dial-code-interface"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The options of the country dial code select input."
            },
            "defaultValue": "countryDialCodes"
        },
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
        "dialCode": {
            "type": "any",
            "mutable": false,
            "complexType": {
                "original": "string | number",
                "resolved": "number | string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Default selected dial code"
            },
            "attribute": "dial-code",
            "reflect": false,
            "defaultValue": "'+1'"
        }
    }; }
    static get watchers() { return [{
            "propName": "dialCode",
            "methodName": "watchDialCodeHandler"
        }]; }
}
