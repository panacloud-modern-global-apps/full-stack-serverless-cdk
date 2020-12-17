import { FormFieldTypes, FormFieldType, PhoneFormFieldType } from '../amplify-auth-fields/amplify-auth-fields-interface';
import { AuthStateHandler, UsernameAliasStrings } from '../../common/types/auth-types';
import { CodeDeliveryType, ForgotPasswordAttributes } from './amplify-forgot-password-interface';
export declare class AmplifyForgotPassword {
    /** The header text of the forgot password section */
    headerText: string;
    /** The text displayed inside of the send code button for the form */
    sendButtonText: string;
    /** The text displayed inside of the submit button for the form */
    submitButtonText: string;
    /** The form fields displayed inside of the forgot password form */
    formFields: FormFieldTypes | string[];
    /** The function called when making a request to reset password */
    handleSend: (event: Event) => void;
    /** The function called when submitting a new password */
    handleSubmit: (event: Event) => void;
    /** Auth state change handler for this component */
    handleAuthStateChange: AuthStateHandler;
    /** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
    usernameAlias: UsernameAliasStrings;
    delivery: CodeDeliveryType | null;
    loading: boolean;
    private phoneNumber;
    private newFormFields;
    forgotPasswordAttrs: ForgotPasswordAttributes;
    componentWillLoad(): void;
    formFieldsHandler(): void;
    private buildFormFields;
    private buildDefaultFormFields;
    private handleFormFieldInputChange;
    setFieldValue(field: PhoneFormFieldType | FormFieldType, formAttributes: ForgotPasswordAttributes): void;
    private handleFormFieldInputWithCallback;
    private send;
    private submit;
    render(): any;
}
