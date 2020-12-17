import { FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';
export declare class AmplifyFacebookButton {
    /** App-specific client ID from Facebook */
    appId: FederatedConfig['facebookAppId'];
    /** Auth state change handler for this component
     * e.g. SignIn -> 'Create Account' link -> SignUp
     */
    handleAuthStateChange: AuthStateHandler;
    private federatedSignIn;
    private getLoginStatus;
    /**
     * @see https://developers.facebook.com/docs/javascript/reference/FB.init/v5.0
     */
    private signInWithFacebook;
    private login;
    render(): any;
}
