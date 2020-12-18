import { Component, h, Prop } from '@stencil/core';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
/**
 * @slot logo - Left-justified content placed at the start of the greetings bar
 * @slot nav - Right-justified content placed at the end of the greetings bar
 * @slot greetings-message - Content placed in the greetings text
 */
export class AmplifyGreetings {
    constructor() {
        /** Username displayed in the greetings */
        this.username = null;
        /** Logo displayed inside of the header */
        this.logo = null;
        /** Auth state change handler for this component */
        this.handleAuthStateChange = dispatchAuthStateChangeEvent;
    }
    render() {
        return (h("header", { class: "greetings" },
            h("span", { class: "logo" },
                h("slot", { name: "logo" }, this.logo && h("span", null, this.logo))),
            h("span", { class: "nav" },
                h("slot", { name: "nav" },
                    h("amplify-nav", null,
                        this.username && (h("slot", { name: "greetings-message" },
                            h("span", null,
                                "Hello, ",
                                this.username))),
                        h("amplify-sign-out", { handleAuthStateChange: this.handleAuthStateChange }))))));
    }
    static get is() { return "amplify-greetings"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["amplify-greetings.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["amplify-greetings.css"]
    }; }
    static get properties() { return {
        "username": {
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
                "text": "Username displayed in the greetings"
            },
            "attribute": "username",
            "reflect": false,
            "defaultValue": "null"
        },
        "logo": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "FunctionalComponent | null",
                "resolved": "FunctionalComponent<{}>",
                "references": {
                    "FunctionalComponent": {
                        "location": "import",
                        "path": "@stencil/core"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Logo displayed inside of the header"
            },
            "defaultValue": "null"
        },
        "handleAuthStateChange": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "AuthStateHandler",
                "resolved": "(nextAuthState: AuthState, data?: object) => void",
                "references": {
                    "AuthStateHandler": {
                        "location": "import",
                        "path": "../../common/types/auth-types"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Auth state change handler for this component"
            },
            "defaultValue": "dispatchAuthStateChangeEvent"
        }
    }; }
}
