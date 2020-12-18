import { AuthState, FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';
export declare class AmplifyFederatedButtons {
    /** The current authentication state. */
    authState: AuthState;
    /** Federated credentials & configuration. */
    federated: FederatedConfig;
    /** Auth state change handler for this component
     * e.g. SignIn -> 'Create Account' link -> SignUp
     */
    handleAuthStateChange: AuthStateHandler;
    componentWillLoad(): void;
    render(): any;
}
