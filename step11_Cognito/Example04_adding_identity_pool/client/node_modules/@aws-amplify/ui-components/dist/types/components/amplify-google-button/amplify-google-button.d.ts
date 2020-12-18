import { FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';
export declare class AmplifyGoogleButton {
    /** Auth state change handler for this component
     * e.g. SignIn -> 'Create Account' link -> SignUp
     */
    handleAuthStateChange: AuthStateHandler;
    /** App-specific client ID from Google */
    clientId: FederatedConfig['googleClientId'];
    private getAuthInstance;
    private signInWithGoogle;
    private handleError;
    /**
     * @see https://developers.google.com/identity/sign-in/web/build-button#building_a_button_with_a_custom_graphic
     */
    private handleLoad;
    private handleUser;
    render(): any;
}
