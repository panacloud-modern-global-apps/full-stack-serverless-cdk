import { IconNameType } from '../amplify-icon/icons';
export declare class AmplifyIconButton {
    /**  The name of the icon used inside of the button */
    name: IconNameType;
    /** (Optional) The tooltip that will show on hover of the button */
    tooltip: string | null;
    /** (Optional) Whether or not to show the tooltip automatically */
    autoShowTooltip: boolean;
    render(): any;
}
