import { AuthStateHandler, CognitoUserInterface } from '../../common/types/auth-types';
export declare class AmplifyVerifyContact {
    /** Authentication state handler */
    handleAuthStateChange: AuthStateHandler;
    /** User with unverified contact information  */
    user: CognitoUserInterface;
    verifyAttr: any;
    loading: boolean;
    code: string;
    contact: 'email' | 'phone_number';
    private handleSubmit;
    private submit;
    private verify;
    private handleInputChange;
    private renderSubmit;
    private renderVerify;
    render(): any;
}
