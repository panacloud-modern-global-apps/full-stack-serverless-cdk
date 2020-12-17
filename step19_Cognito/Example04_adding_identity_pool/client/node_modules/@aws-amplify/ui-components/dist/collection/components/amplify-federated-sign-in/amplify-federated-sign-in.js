import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState } from '../../common/types/auth-types';
const logger = new Logger('amplify-federated-sign-in');
export class AmplifyFederatedSignIn {
    constructor() {
        /** The current authentication state. */
        this.authState = AuthState.SignIn;
        /** Federated credentials & configuration. */
        this.federated = {};
    }
    componentWillLoad() {
        if (!Auth || typeof Auth.configure !== 'function') {
            throw new Error(NO_AUTH_MODULE_FOUND);
        }
        const { oauth = {} } = Auth.configure();
        // backward compatibility
        if (oauth['domain']) {
            this.federated.oauth_config = Object.assign(Object.assign({}, this.federated.oauth_config), oauth);
        }
        else if (oauth['awsCognito']) {
            this.federated.oauth_config = Object.assign(Object.assign({}, this.federated.oauth_config), oauth['awsCognito']);
        }
        if (oauth['auth0']) {
            this.federated.auth0 = Object.assign(Object.assign({}, this.federated.auth0), oauth['auth0']);
        }
    }
    render() {
        if (!this.federated) {
            logger.debug('federated prop is empty. show nothing');
            logger.debug('federated={google_client_id: , facebook_app_id: , amazon_client_id}');
            return null;
        }
        if (!Object.values(AuthState).includes(this.authState)) {
            return null;
        }
        logger.debug('federated Config is', this.federated);
        return (h("amplify-form-section", { "data-test": "federated-sign-in-section" },
            h("amplify-section", { "data-test": "federated-sign-in-body-section" },
                h("amplify-federated-buttons", { authState: this.authState, "data-test": "federated-sign-in-buttons", federated: this.federated }))));
    }
    static get is() { return "amplify-federated-sign-in"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "authState": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "AuthState",
                "resolved": "AuthState.ConfirmSignIn | AuthState.ConfirmSignUp | AuthState.CustomConfirmSignIn | AuthState.ForgotPassword | AuthState.Loading | AuthState.ResetPassword | AuthState.SettingMFA | AuthState.SignIn | AuthState.SignOut | AuthState.SignUp | AuthState.SignedIn | AuthState.SignedOut | AuthState.SigningUp | AuthState.TOTPSetup | AuthState.VerifyContact | AuthState.VerifyingAttributes | AuthState.confirmingSignInCustomFlow | AuthState.confirmingSignUpCustomFlow",
                "references": {
                    "AuthState": {
                        "location": "import",
                        "path": "../../common/types/auth-types"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The current authentication state."
            },
            "attribute": "auth-state",
            "reflect": false,
            "defaultValue": "AuthState.SignIn"
        },
        "federated": {
            "type": "any",
            "mutable": false,
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Federated credentials & configuration."
            },
            "attribute": "federated",
            "reflect": false,
            "defaultValue": "{}"
        }
    }; }
}
