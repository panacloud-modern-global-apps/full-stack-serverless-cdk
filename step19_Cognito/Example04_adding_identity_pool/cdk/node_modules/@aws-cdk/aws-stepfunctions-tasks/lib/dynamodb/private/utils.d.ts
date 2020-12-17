import { DynamoAttributeValue } from '../shared-types';
export declare enum DynamoMethod {
    GET = "Get",
    PUT = "Put",
    DELETE = "Delete",
    UPDATE = "Update"
}
export declare function getDynamoResourceArn(method: DynamoMethod): string;
export declare function transformAttributeValueMap(attrMap?: {
    [key: string]: DynamoAttributeValue;
}): any;
export declare function validateJsonPath(value: string): void;
