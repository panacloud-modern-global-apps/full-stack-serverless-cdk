import { FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';
export declare class AmplifyAmazonButton {
    /** App-specific client ID from Google */
    clientId: FederatedConfig['amazonClientId'];
    /** Auth state change handler for this component
     * e.g. SignIn -> 'Create Account' link -> SignUp
     */
    handleAuthStateChange: AuthStateHandler;
    private federatedSignIn;
    /**
     * @see https://developer.amazon.com/docs/login-with-amazon/install-sdk-javascript.html
     */
    private signInWithAmazon;
    render(): any;
}
