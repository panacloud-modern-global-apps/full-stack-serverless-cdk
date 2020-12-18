import { AccessLevel } from '../../common/types/storage-types';
export declare class AmplifyS3TextPicker {
    /** String representing directory location to text file */
    path: string;
    /** The content type header used when uploading to S3 */
    contentType: string;
    /** The access level of the text file */
    level: AccessLevel;
    /** Whether or not to use track the get/put of the text file */
    track: boolean;
    /** Cognito identity id of the another user's text file */
    identityId: string;
    /** Callback used to generate custom key value */
    fileToKey: (data: object) => string | string;
    /** Fallback content for aplify-s3-text */
    fallbackText: string;
    /** Source content of text */
    src: string;
    private handleInput;
    render(): any;
}
