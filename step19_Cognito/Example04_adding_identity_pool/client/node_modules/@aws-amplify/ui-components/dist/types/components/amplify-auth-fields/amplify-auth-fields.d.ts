import { FormFieldTypes } from './amplify-auth-fields-interface';
export declare class AmplifyAuthFields {
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
    private constructFormFieldOptions;
    render(): any;
}
