import { AccessLevel, StorageObject } from '../../common/types/storage-types';
export declare class AmplifyS3Album {
    /** String representing directory location of image files to be listed */
    path: string;
    /** The content type header used when uploading to S3 */
    contentType: string;
    /** The access level of the files */
    level: AccessLevel;
    /** Whether or not to use track the get/put of the listing of images */
    track: boolean;
    /** Cognito identity id of the another user's image list */
    identityId: string;
    /** Callback used to generate custom key value */
    fileToKey: (data: object) => string | string;
    /** Filter to be applied on album list */
    filter: (list: StorageObject[]) => StorageObject[];
    /** Sort to be applied on album list */
    sort: (list: StorageObject[]) => StorageObject[];
    /** Boolean to enable or disable picker */
    picker: boolean;
    /** Function executed when s3-image loads */
    handleOnLoad: (event: Event) => void;
    /** Function executed when error occurs for the s3-image */
    handleOnError: (event: Event) => void;
    /** Picker button text */
    pickerText: string;
    albumItems: StorageObject[];
    private imgArr;
    private list;
    private marshal;
    private getContentType;
    componentWillLoad(): void;
    private constructImgArray;
    private handlePick;
    render(): any;
}
