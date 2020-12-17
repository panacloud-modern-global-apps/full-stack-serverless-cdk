export declare class AmplifyCheckbox {
    /** Name of the checkbox */
    name?: string;
    /** Value of the checkbox */
    value?: string;
    /** Field ID used for the 'htmlFor' in the label */
    fieldId: string;
    /** Label for the checkbox */
    label: string;
    /** If `true`, the checkbox is selected. */
    checked: boolean;
    /** If `true`, the checkbox is disabled */
    disabled: boolean;
    private onClick;
    render(): any;
}
