import { Component, Prop, h, State, Host } from '@stencil/core';
import { Logger, I18n } from '@aws-amplify/core';
import { AccessLevel } from '../../common/types/storage-types';
import { calcKey, putStorageObject } from '../../common/storage-helpers';
import { Translations } from '../../common/Translations';
const logger = new Logger('S3TextPicker');
export class AmplifyS3TextPicker {
    constructor() {
        /** The content type header used when uploading to S3 */
        this.contentType = 'text/*';
        /** The access level of the text file */
        this.level = AccessLevel.Public;
        /** Fallback content for aplify-s3-text */
        this.fallbackText = Translations.PICKER_TEXT;
    }
    async handleInput(event) {
        const file = event.target.files[0];
        const { path = '', level, fileToKey, track } = this;
        const key = path + calcKey(file, fileToKey);
        if (!file) {
            throw new Error('No file was selected');
        }
        try {
            await putStorageObject(key, file, level, track, file['type'], logger);
            this.src = key;
        }
        catch (error) {
            logger.debug(error);
            throw new Error(error);
        }
    }
    render() {
        return (h(Host, null,
            h("amplify-s3-text", { textKey: this.src, path: this.path, level: this.level, track: this.track, identityId: this.identityId, contentType: this.contentType, fallbackText: I18n.get(this.fallbackText) }),
            h("amplify-picker", { inputHandler: e => this.handleInput(e), acceptValue: 'text/*' })));
    }
    static get is() { return "amplify-s3-text-picker"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "path": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "String representing directory location to text file"
            },
            "attribute": "path",
            "reflect": false
        },
        "contentType": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The content type header used when uploading to S3"
            },
            "attribute": "content-type",
            "reflect": false,
            "defaultValue": "'text/*'"
        },
        "level": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "AccessLevel",
                "resolved": "AccessLevel.Private | AccessLevel.Protected | AccessLevel.Public",
                "references": {
                    "AccessLevel": {
                        "location": "import",
                        "path": "../../common/types/storage-types"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "The access level of the text file"
            },
            "attribute": "level",
            "reflect": false,
            "defaultValue": "AccessLevel.Public"
        },
        "track": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Whether or not to use track the get/put of the text file"
            },
            "attribute": "track",
            "reflect": false
        },
        "identityId": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Cognito identity id of the another user's text file"
            },
            "attribute": "identity-id",
            "reflect": false
        },
        "fileToKey": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "(data: object) => string | string",
                "resolved": "(data: object) => string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Callback used to generate custom key value"
            }
        },
        "fallbackText": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Fallback content for aplify-s3-text"
            },
            "attribute": "fallback-text",
            "reflect": false,
            "defaultValue": "Translations.PICKER_TEXT"
        }
    }; }
    static get states() { return {
        "src": {}
    }; }
}
