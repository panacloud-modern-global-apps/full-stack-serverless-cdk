import { AccessLevel } from '../../common/types/storage-types';
export declare class AmplifyS3ImagePicker {
    /** String representing directory location to image file */
    path: string;
    /** The content type header used when uploading to S3 */
    contentType: string;
    /** The access level of the image */
    level: AccessLevel;
    /** Whether or not to use track the get/put of the image */
    track: boolean;
    /** Cognito identity id of the another user's image */
    identityId: string;
    /** Callback used to generate custom key value */
    fileToKey: (data: object) => string | string;
    /** Title string value */
    headerTitle?: string;
    /** Header Hint value in string */
    headerHint?: string;
    /** Placeholder hint that goes under the placeholder image */
    placeholderHint?: string;
    /** Upload Button Text as string */
    buttonText?: string;
    /** Source for the image */
    src: string | object;
    private handlePick;
    render(): any;
}
