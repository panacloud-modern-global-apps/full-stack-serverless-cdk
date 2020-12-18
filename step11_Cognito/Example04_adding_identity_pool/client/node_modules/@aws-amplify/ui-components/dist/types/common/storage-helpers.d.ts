import { Logger } from '@aws-amplify/core';
import { AccessLevel } from './types/storage-types';
export declare const imageFileType: Set<string>;
export declare const calcKey: (file: File, fileToKey: string | Function) => string;
export declare const getStorageObject: (key: string, level: AccessLevel, track: boolean, identityId: string, logger: Logger) => Promise<Object | String>;
export declare const getTextSource: (key: string, level: AccessLevel, track: boolean, identityId: string, logger: Logger) => Promise<string>;
export declare const putStorageObject: (key: string, body: object, level: AccessLevel, track: boolean, contentType: string, logger: Logger) => Promise<void>;
