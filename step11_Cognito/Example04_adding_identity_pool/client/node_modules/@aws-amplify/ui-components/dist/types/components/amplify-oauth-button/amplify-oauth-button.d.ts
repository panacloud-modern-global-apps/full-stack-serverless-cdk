import { FederatedConfig } from '../../common/types/auth-types';
export declare class AmplifyOAuthButton {
    /** Federated credentials & configuration. */
    config: FederatedConfig['oauthConfig'];
    private signInWithOAuth;
    render(): any;
}
