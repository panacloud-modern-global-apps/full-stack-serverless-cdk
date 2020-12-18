/**
 * @slot (default) - Text displayed below the tooltip. This will always be visible.
 */
export declare class AmplifyTooltip {
    /** (Required) The text in the tooltip */
    text: string;
    /** (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered */
    shouldAutoShow: boolean;
    render(): any;
}
