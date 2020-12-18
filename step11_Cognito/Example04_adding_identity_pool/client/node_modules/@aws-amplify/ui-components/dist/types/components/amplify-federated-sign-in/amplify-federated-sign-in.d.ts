import { AuthState } from '../../common/types/auth-types';
export declare class AmplifyFederatedSignIn {
    /** The current authentication state. */
    authState: AuthState;
    /** Federated credentials & configuration. */
    federated: any;
    componentWillLoad(): void;
    render(): any;
}
