export declare class AmplifyPhotoPicker {
    /** Title string value */
    headerTitle?: string;
    /** Header Hint value in string */
    headerHint?: string;
    /** Placeholder hint that goes under the placeholder image */
    placeholderHint?: string;
    /** Picker button text as string */
    buttonText?: string;
    /** Source of the image to be previewed */
    previewSrc?: string | object;
    /** Function that handles file pick onClick */
    handleClick?: (file: File) => void;
    /** Preview State tracks the change in preview source */
    previewState: string;
    /** File slected through picker */
    file: File;
    componentWillLoad(): void;
    private handleInput;
    render(): any;
}
