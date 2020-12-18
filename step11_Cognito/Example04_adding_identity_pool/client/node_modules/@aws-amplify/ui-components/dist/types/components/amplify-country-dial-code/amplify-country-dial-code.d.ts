import { CountryCodeDialOptions } from './amplify-country-dial-code-interface';
export declare class AmplifyCountryDialCode {
    /** The ID of the field.  Should match with its corresponding input's ID. */
    fieldId: string;
    /** The options of the country dial code select input. */
    options: CountryCodeDialOptions;
    /** The callback, called when the input is modified by the user. */
    handleInputChange?: (inputEvent: Event) => void;
    /** Default selected dial code */
    dialCode: string | number;
    private selectedDialCode;
    componentWillLoad(): void;
    watchDialCodeHandler(): void;
    setSelectedDialCode(): void;
    render(): any;
}
