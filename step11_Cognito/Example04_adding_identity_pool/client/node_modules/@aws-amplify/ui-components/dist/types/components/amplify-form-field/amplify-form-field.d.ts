import { FunctionalComponent } from '../../stencil-public-runtime';
import { TextFieldTypes } from '../../common/types/ui-types';
/**
 * @slot input - Content for the input within the form field
 */
export declare class AmplifyFormField {
    /** The ID of the field. Should match with its corresponding input's ID. */
    fieldId: string;
    /** The text of the label. Goes above the input. Ex: 'First name' */
    label: string | null;
    /** The text of the description.  Goes between the label and the input. */
    description: string | null;
    /** The text of a hint to the user as to how to fill out the input. Goes just below the input. */
    hint: string | FunctionalComponent | null;
    /** The input type.  Can be any HTML input type. */
    type?: TextFieldTypes;
    /** The required flag in order to make an input required prior to submitting a form */
    required: boolean;
    /** The callback, called when the input is modified by the user. */
    handleInputChange?: (inputEvent: Event) => void;
    /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
    placeholder?: string;
    /** (Optional) String value for the name of the input. */
    name?: string;
    /** The value of the content inside of the input field */
    value: string;
    /** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
    inputProps?: object;
    /** Will disable the input if set to true */
    disabled?: boolean;
    render(): any;
}
