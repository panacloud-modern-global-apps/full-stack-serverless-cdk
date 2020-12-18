import { AuthStateHandler, FederatedConfig } from '../../common/types/auth-types';
export declare class AmplifyAuth0Button {
    /** See: https://auth0.com/docs/libraries/auth0js/v9#available-parameters */
    config: FederatedConfig['auth0Config'];
    /** Auth state change handler for this component */
    handleAuthStateChange: AuthStateHandler;
    private _auth0;
    private handleLoad;
    private signInWithAuth0;
    render(): any;
}
