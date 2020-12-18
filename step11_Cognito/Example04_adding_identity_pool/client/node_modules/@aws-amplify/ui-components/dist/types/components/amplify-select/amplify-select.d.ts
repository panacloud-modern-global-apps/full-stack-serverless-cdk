import { SelectOptionsString, SelectOptionsNumber } from './amplify-select-interface';
export declare class AmplifySelect {
    /** The options of the select input. Must be an Array of Objects with an Object shape of {label: string, value: string|number} */
    options: SelectOptionsString | SelectOptionsNumber;
    /** Used for id field */
    fieldId: string;
    /** The callback, called when the select is modified by the user. */
    handleInputChange?: (inputEvent: Event) => void;
    /** Default selected option */
    selected?: string | number;
    private selectOptions;
    componentWillLoad(): void;
    handleSelectOptionsChange(): void;
    isSelectedOptionValid(selected: any): boolean;
    private contructSelectOptions;
    render(): any;
}
