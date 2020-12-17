import { AuthStateHandler } from '../../common/types/auth-types';
/**
 * @slot sign-out - The sign out button element
 */
export declare class AmplifySignOut {
    /** Auth state change handler for this component */
    handleAuthStateChange: AuthStateHandler;
    /** Text inside of the Sign Out button */
    buttonText: string;
    private signOut;
    render(): any;
}
