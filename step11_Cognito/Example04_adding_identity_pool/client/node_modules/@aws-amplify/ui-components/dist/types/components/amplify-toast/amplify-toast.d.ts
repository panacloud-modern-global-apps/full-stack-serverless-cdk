/**
 * @slot (default) - Content placed inside the toast. If `message` prop is already set, then this content will be displayed to the right of the `message`.
 */
export declare class AmplifyToast {
    /** Used in order to add a dismissable `x` for the Toast component */
    handleClose: () => void;
    /** Message to be displayed inside the toast*/
    message: string;
    render(): any;
}
