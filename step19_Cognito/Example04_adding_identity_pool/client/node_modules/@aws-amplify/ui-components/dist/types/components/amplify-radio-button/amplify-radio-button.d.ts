export declare class AmplifyRadioButton {
    /** The callback, called when the input is modified by the user. */
    handleInputChange?: (inputEvent: Event) => void;
    /** (Optional) Name of radio button */
    name?: string;
    /** (Optional) Value of radio button */
    value?: string;
    /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
    placeholder?: string;
    /** Field ID used for the 'for' in the label */
    fieldId: string;
    /** Label for the radio button */
    label: string;
    /** If `true`, the radio button is selected. */
    checked: boolean;
    /** If `true`, the checkbox is disabled */
    disabled: boolean;
    /** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
    inputProps?: object;
    render(): any;
}
