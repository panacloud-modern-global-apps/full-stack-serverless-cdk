import { AccessLevel } from '../../common/types/storage-types';
export declare class AmplifyS3Text {
    /** The key of the text object in S3 */
    textKey: string;
    /** String representing directory location to text file */
    path: string;
    /** Text body content to be uploaded */
    body: object;
    /** The content type header used when uploading to S3 */
    contentType: string;
    /** The access level of the text file */
    level: AccessLevel;
    /** Whether or not to use track the get/put of the text file */
    track: boolean;
    /** Cognito identity id of the another user's text file */
    identityId: string;
    /** Fallback content */
    fallbackText: string;
    /** Source content of text */
    src: string;
    watchHandler(): Promise<void>;
    componentWillLoad(): Promise<void>;
    private load;
    render(): any;
}
