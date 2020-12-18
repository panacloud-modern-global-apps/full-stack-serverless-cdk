import { Auth } from '@aws-amplify/auth';
import { I18n } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';
import { Translations } from '../../common/Translations';
export class AmplifyOAuthButton {
    constructor() {
        /** Federated credentials & configuration. */
        this.config = {};
    }
    signInWithOAuth(event) {
        event.preventDefault();
        Auth.federatedSignIn();
    }
    render() {
        return (h("amplify-sign-in-button", { onClick: event => this.signInWithOAuth(event), provider: "oauth" }, this.config.label || I18n.get(Translations.SIGN_IN_WITH_AWS)));
    }
    static get is() { return "amplify-oauth-button"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "config": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "FederatedConfig['oauthConfig']",
                "resolved": "{ [key: string]: any; }",
                "references": {
                    "FederatedConfig": {
                        "location": "import",
                        "path": "../../common/types/auth-types"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Federated credentials & configuration."
            },
            "defaultValue": "{}"
        }
    }; }
}
