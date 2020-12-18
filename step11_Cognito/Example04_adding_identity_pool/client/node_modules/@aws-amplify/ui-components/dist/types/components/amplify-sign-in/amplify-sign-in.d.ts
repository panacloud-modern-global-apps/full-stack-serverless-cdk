import { FormFieldTypes, FormFieldType, PhoneFormFieldType } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import { FederatedConfig, AuthStateHandler, UsernameAliasStrings } from '../../common/types/auth-types';
import { SignInAttributes } from './amplify-sign-in-interface';
/**
 * @slot header-subtitle - Subtitle content placed below header text
 * @slot federated-buttons - Content above form fields used for sign in federation buttons
 * @slot footer - Content is place in the footer of the component
 * @slot primary-footer-content - Content placed on the right side of the footer
 * @slot secondary-footer-content - Content placed on the left side of the footer
 */
export declare class AmplifySignIn {
    /** Fires when sign in form is submitted */
    handleSubmit: (event: Event) => void;
    /** Used for header text in sign in component */
    headerText: string;
    /** Used for the submit button text in sign in component */
    submitButtonText: string;
    /** Federated credentials & configuration. */
    federated: FederatedConfig;
    /** Auth state change handler for this component */
    handleAuthStateChange: AuthStateHandler;
    /** Username Alias is used to setup authentication with `username`, `email` or `phone_number`  */
    usernameAlias: UsernameAliasStrings;
    /**
     * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc.
     * by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing
     * text for a label or adjust a placeholder, you can follow the structure below in order to do just that.
     * ```
     * [
     *  {
     *    type: string,
     *    label: string,
     *    placeholder: string,
     *    hint: string | Functional Component | null,
     *    required: boolean
     *  }
     * ]
     * ```
     */
    formFields: FormFieldTypes | string[];
    /** Hides the sign up link */
    hideSignUp: boolean;
    private newFormFields;
    loading: boolean;
    private phoneNumber;
    signInAttributes: SignInAttributes;
    componentWillLoad(): void;
    formFieldsHandler(): void;
    private handleFormFieldInputChange;
    private handleFormFieldInputWithCallback;
    private signIn;
    buildDefaultFormFields(): void;
    buildFormFields(): void;
    setFieldValue(field: PhoneFormFieldType | FormFieldType, formAttributes: SignInAttributes): void;
    render(): any;
}
