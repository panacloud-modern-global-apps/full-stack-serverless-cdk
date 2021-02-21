"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAssetHandler = void 0;
const fs_1 = require("fs");
const path = require("path");
const cloud_assembly_schema_1 = require("@aws-cdk/cloud-assembly-schema");
const progress_1 = require("../../progress");
const archive_1 = require("../archive");
const fs_extra_1 = require("../fs-extra");
const placeholders_1 = require("../placeholders");
class FileAssetHandler {
    constructor(workDir, asset, host) {
        this.workDir = workDir;
        this.asset = asset;
        this.host = host;
        this.fileCacheRoot = path.join(workDir, '.cache');
    }
    async publish() {
        const destination = await placeholders_1.replaceAwsPlaceholders(this.asset.destination, this.host.aws);
        const s3Url = `s3://${destination.bucketName}/${destination.objectKey}`;
        const s3 = await this.host.aws.s3Client(destination);
        this.host.emitMessage(progress_1.EventType.CHECK, `Check ${s3Url}`);
        // A thunk for describing the current account. Used when we need to format an error
        // message, not in the success case.
        const account = async () => { var _a; return (_a = (await this.host.aws.discoverCurrentAccount())) === null || _a === void 0 ? void 0 : _a.accountId; };
        switch (await bucketOwnership(s3, destination.bucketName)) {
            case BucketOwnership.MINE:
                break;
            case BucketOwnership.DOES_NOT_EXIST:
                throw new Error(`No bucket named '${destination.bucketName}'. Is account ${await account()} bootstrapped?`);
            case BucketOwnership.SOMEONE_ELSES_OR_NO_ACCESS:
                throw new Error(`Bucket named '${destination.bucketName}' exists, but not in account ${await account()}. Wrong account?`);
        }
        if (await objectExists(s3, destination.bucketName, destination.objectKey)) {
            this.host.emitMessage(progress_1.EventType.FOUND, `Found ${s3Url}`);
            return;
        }
        if (this.host.aborted) {
            return;
        }
        const publishFile = await this.packageFile();
        const contentType = this.asset.source.packaging === cloud_assembly_schema_1.FileAssetPackaging.ZIP_DIRECTORY ? 'application/zip' : undefined;
        this.host.emitMessage(progress_1.EventType.UPLOAD, `Upload ${s3Url}`);
        await s3.upload({
            Bucket: destination.bucketName,
            Key: destination.objectKey,
            Body: fs_1.createReadStream(publishFile),
            ContentType: contentType,
        }).promise();
    }
    async packageFile() {
        const source = this.asset.source;
        const fullPath = path.resolve(this.workDir, this.asset.source.path);
        if (source.packaging === cloud_assembly_schema_1.FileAssetPackaging.ZIP_DIRECTORY) {
            await fs_1.promises.mkdir(this.fileCacheRoot, { recursive: true });
            const ret = path.join(this.fileCacheRoot, `${this.asset.id.assetId}.zip`);
            if (await fs_extra_1.pathExists(ret)) {
                this.host.emitMessage(progress_1.EventType.CACHED, `From cache ${ret}`);
                return ret;
            }
            this.host.emitMessage(progress_1.EventType.BUILD, `Zip ${fullPath} -> ${ret}`);
            await archive_1.zipDirectory(fullPath, ret);
            return ret;
        }
        else {
            return fullPath;
        }
    }
}
exports.FileAssetHandler = FileAssetHandler;
var BucketOwnership;
(function (BucketOwnership) {
    BucketOwnership[BucketOwnership["DOES_NOT_EXIST"] = 0] = "DOES_NOT_EXIST";
    BucketOwnership[BucketOwnership["MINE"] = 1] = "MINE";
    BucketOwnership[BucketOwnership["SOMEONE_ELSES_OR_NO_ACCESS"] = 2] = "SOMEONE_ELSES_OR_NO_ACCESS";
})(BucketOwnership || (BucketOwnership = {}));
async function bucketOwnership(s3, bucket) {
    try {
        await s3.getBucketLocation({ Bucket: bucket }).promise();
        return BucketOwnership.MINE;
    }
    catch (e) {
        if (e.code === 'NoSuchBucket') {
            return BucketOwnership.DOES_NOT_EXIST;
        }
        if (['AccessDenied', 'AllAccessDisabled'].includes(e.code)) {
            return BucketOwnership.SOMEONE_ELSES_OR_NO_ACCESS;
        }
        throw e;
    }
}
async function objectExists(s3, bucket, key) {
    /*
     * The object existence check here refrains from using the `headObject` operation because this
     * would create a negative cache entry, making GET-after-PUT eventually consistent. This has been
     * observed to result in CloudFormation issuing "ValidationError: S3 error: Access Denied", for
     * example in https://github.com/aws/aws-cdk/issues/6430.
     *
     * To prevent this, we are instead using the listObjectsV2 call, using the looked up key as the
     * prefix, and limiting results to 1. Since the list operation returns keys ordered by binary
     * UTF-8 representation, the key we are looking for is guaranteed to always be the first match
     * returned if it exists.
     */
    const response = await s3.listObjectsV2({ Bucket: bucket, Prefix: key, MaxKeys: 1 }).promise();
    return response.Contents != null && response.Contents.some(object => object.Key === key);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBc0Q7QUFDdEQsNkJBQTZCO0FBQzdCLDBFQUFvRTtBQUVwRSw2Q0FBMkM7QUFDM0Msd0NBQTBDO0FBRTFDLDBDQUF5QztBQUN6QyxrREFBeUQ7QUFFekQsTUFBYSxnQkFBZ0I7SUFHM0IsWUFDbUIsT0FBZSxFQUNmLEtBQXdCLEVBQ3hCLElBQWtCO1FBRmxCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQUN4QixTQUFJLEdBQUosSUFBSSxDQUFjO1FBQ25DLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUFPO1FBQ2xCLE1BQU0sV0FBVyxHQUFHLE1BQU0scUNBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RixNQUFNLEtBQUssR0FBRyxRQUFRLFdBQVcsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRXhFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV6RCxtRkFBbUY7UUFDbkYsb0NBQW9DO1FBQ3BDLE1BQU0sT0FBTyxHQUFHLEtBQUssSUFBSSxFQUFFLHdCQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLDBDQUFFLFNBQVMsR0FB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LENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVSZWFkU3RyZWFtLCBwcm9taXNlcyBhcyBmcyB9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBGaWxlQXNzZXRQYWNrYWdpbmcgfSBmcm9tICdAYXdzLWNkay9jbG91ZC1hc3NlbWJseS1zY2hlbWEnO1xuaW1wb3J0IHsgRmlsZU1hbmlmZXN0RW50cnkgfSBmcm9tICcuLi8uLi9hc3NldC1tYW5pZmVzdCc7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tICcuLi8uLi9wcm9ncmVzcyc7XG5pbXBvcnQgeyB6aXBEaXJlY3RvcnkgfSBmcm9tICcuLi9hcmNoaXZlJztcbmltcG9ydCB7IElBc3NldEhhbmRsZXIsIElIYW5kbGVySG9zdCB9IGZyb20gJy4uL2Fzc2V0LWhhbmRsZXInO1xuaW1wb3J0IHsgcGF0aEV4aXN0cyB9IGZyb20gJy4uL2ZzLWV4dHJhJztcbmltcG9ydCB7IHJlcGxhY2VBd3NQbGFjZWhvbGRlcnMgfSBmcm9tICcuLi9wbGFjZWhvbGRlcnMnO1xuXG5leHBvcnQgY2xhc3MgRmlsZUFzc2V0SGFuZGxlciBpbXBsZW1lbnRzIElBc3NldEhhbmRsZXIge1xuICBwcml2YXRlIHJlYWRvbmx5IGZpbGVDYWNoZVJvb3Q6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdvcmtEaXI6IHN0cmluZyxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGFzc2V0OiBGaWxlTWFuaWZlc3RFbnRyeSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGhvc3Q6IElIYW5kbGVySG9zdCkge1xuICAgIHRoaXMuZmlsZUNhY2hlUm9vdCA9IHBhdGguam9pbih3b3JrRGlyLCAnLmNhY2hlJyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcHVibGlzaCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBkZXN0aW5hdGlvbiA9IGF3YWl0IHJlcGxhY2VBd3NQbGFjZWhvbGRlcnModGhpcy5hc3NldC5kZXN0aW5hdGlvbiwgdGhpcy5ob3N0LmF3cyk7XG4gICAgY29uc3QgczNVcmwgPSBgczM6Ly8ke2Rlc3RpbmF0aW9uLmJ1Y2tldE5hbWV9LyR7ZGVzdGluYXRpb24ub2JqZWN0S2V5fWA7XG5cbiAgICBjb25zdCBzMyA9IGF3YWl0IHRoaXMuaG9zdC5hd3MuczNDbGllbnQoZGVzdGluYXRpb24pO1xuICAgIHRoaXMuaG9zdC5lbWl0TWVzc2FnZShFdmVudFR5cGUuQ0hFQ0ssIGBDaGVjayAke3MzVXJsfWApO1xuXG4gICAgLy8gQSB0aHVuayBmb3IgZGVzY3JpYmluZyB0aGUgY3VycmVudCBhY2NvdW50LiBVc2VkIHdoZW4gd2UgbmVlZCB0byBmb3JtYXQgYW4gZXJyb3JcbiAgICAvLyBtZXNzYWdlLCBub3QgaW4gdGhlIHN1Y2Nlc3MgY2FzZS5cbiAgICBjb25zdCBhY2NvdW50ID0gYXN5bmMgKCkgPT4gKGF3YWl0IHRoaXMuaG9zdC5hd3MuZGlzY292ZXJDdXJyZW50QWNjb3VudCgpKT8uYWNjb3VudElkO1xuICAgIHN3aXRjaCAoYXdhaXQgYnVja2V0T3duZXJzaGlwKHMzLCBkZXN0aW5hdGlvbi5idWNrZXROYW1lKSkge1xuICAgICAgY2FzZSBCdWNrZXRPd25lcnNoaXAuTUlORTpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJ1Y2tldE93bmVyc2hpcC5ET0VTX05PVF9FWElTVDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBidWNrZXQgbmFtZWQgJyR7ZGVzdGluYXRpb24uYnVja2V0TmFtZX0nLiBJcyBhY2NvdW50ICR7YXdhaXQgYWNjb3VudCgpfSBib290c3RyYXBwZWQ/YCk7XG4gICAgICBjYXNlIEJ1Y2tldE93bmVyc2hpcC5TT01FT05FX0VMU0VTX09SX05PX0FDQ0VTUzpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCdWNrZXQgbmFtZWQgJyR7ZGVzdGluYXRpb24uYnVja2V0TmFtZX0nIGV4aXN0cywgYnV0IG5vdCBpbiBhY2NvdW50ICR7YXdhaXQgYWNjb3VudCgpfS4gV3JvbmcgYWNjb3VudD9gKTtcbiAgICB9XG5cbiAgICBpZiAoYXdhaXQgb2JqZWN0RXhpc3RzKHMzLCBkZXN0aW5hdGlvbi5idWNrZXROYW1lLCBkZXN0aW5hdGlvbi5vYmplY3RLZXkpKSB7XG4gICAgICB0aGlzLmhvc3QuZW1pdE1lc3NhZ2UoRXZlbnRUeXBlLkZPVU5ELCBgRm91bmQgJHtzM1VybH1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0LmFib3J0ZWQpIHsgcmV0dXJuOyB9XG4gICAgY29uc3QgcHVibGlzaEZpbGUgPSBhd2FpdCB0aGlzLnBhY2thZ2VGaWxlKCk7XG4gICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLmFzc2V0LnNvdXJjZS5wYWNrYWdpbmcgPT09IEZpbGVBc3NldFBhY2thZ2luZy5aSVBfRElSRUNUT1JZID8gJ2FwcGxpY2F0aW9uL3ppcCcgOiB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLmhvc3QuZW1pdE1lc3NhZ2UoRXZlbnRUeXBlLlVQTE9BRCwgYFVwbG9hZCAke3MzVXJsfWApO1xuICAgIGF3YWl0IHMzLnVwbG9hZCh7XG4gICAgICBCdWNrZXQ6IGRlc3RpbmF0aW9uLmJ1Y2tldE5hbWUsXG4gICAgICBLZXk6IGRlc3RpbmF0aW9uLm9iamVjdEtleSxcbiAgICAgIEJvZHk6IGNyZWF0ZVJlYWRTdHJlYW0ocHVibGlzaEZpbGUpLFxuICAgICAgQ29udGVudFR5cGU6IGNvbnRlbnRUeXBlLFxuICAgIH0pLnByb21pc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcGFja2FnZUZpbGUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzb3VyY2UgPSB0aGlzLmFzc2V0LnNvdXJjZTtcbiAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLndvcmtEaXIsIHRoaXMuYXNzZXQuc291cmNlLnBhdGgpO1xuXG4gICAgaWYgKHNvdXJjZS5wYWNrYWdpbmcgPT09IEZpbGVBc3NldFBhY2thZ2luZy5aSVBfRElSRUNUT1JZKSB7XG4gICAgICBhd2FpdCBmcy5ta2Rpcih0aGlzLmZpbGVDYWNoZVJvb3QsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgY29uc3QgcmV0ID0gcGF0aC5qb2luKHRoaXMuZmlsZUNhY2hlUm9vdCwgYCR7dGhpcy5hc3NldC5pZC5hc3NldElkfS56aXBgKTtcblxuICAgICAgaWYgKGF3YWl0IHBhdGhFeGlzdHMocmV0KSkge1xuICAgICAgICB0aGlzLmhvc3QuZW1pdE1lc3NhZ2UoRXZlbnRUeXBlLkNBQ0hFRCwgYEZyb20gY2FjaGUgJHtyZXR9YCk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaG9zdC5lbWl0TWVzc2FnZShFdmVudFR5cGUuQlVJTEQsIGBaaXAgJHtmdWxsUGF0aH0gLT4gJHtyZXR9YCk7XG4gICAgICBhd2FpdCB6aXBEaXJlY3RvcnkoZnVsbFBhdGgsIHJldCk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnVsbFBhdGg7XG4gICAgfVxuICB9XG59XG5cbmVudW0gQnVja2V0T3duZXJzaGlwIHtcbiAgRE9FU19OT1RfRVhJU1QsXG4gIE1JTkUsXG4gIFNPTUVPTkVfRUxTRVNfT1JfTk9fQUNDRVNTXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJ1Y2tldE93bmVyc2hpcChzMzogQVdTLlMzLCBidWNrZXQ6IHN0cmluZyk6IFByb21pc2U8QnVja2V0T3duZXJzaGlwPiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgczMuZ2V0QnVja2V0TG9jYXRpb24oeyBCdWNrZXQ6IGJ1Y2tldCB9KS5wcm9taXNlKCk7XG4gICAgcmV0dXJuIEJ1Y2tldE93bmVyc2hpcC5NSU5FO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUuY29kZSA9PT0gJ05vU3VjaEJ1Y2tldCcpIHsgcmV0dXJuIEJ1Y2tldE93bmVyc2hpcC5ET0VTX05PVF9FWElTVDsgfVxuICAgIGlmIChbJ0FjY2Vzc0RlbmllZCcsICdBbGxBY2Nlc3NEaXNhYmxlZCddLmluY2x1ZGVzKGUuY29kZSkpIHsgcmV0dXJuIEJ1Y2tldE93bmVyc2hpcC5TT01FT05FX0VMU0VTX09SX05PX0FDQ0VTUzsgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb2JqZWN0RXhpc3RzKHMzOiBBV1MuUzMsIGJ1Y2tldDogc3RyaW5nLCBrZXk6IHN0cmluZykge1xuICAvKlxuICAgKiBUaGUgb2JqZWN0IGV4aXN0ZW5jZSBjaGVjayBoZXJlIHJlZnJhaW5zIGZyb20gdXNpbmcgdGhlIGBoZWFkT2JqZWN0YCBvcGVyYXRpb24gYmVjYXVzZSB0aGlzXG4gICAqIHdvdWxkIGNyZWF0ZSBhIG5lZ2F0aXZlIGNhY2hlIGVudHJ5LCBtYWtpbmcgR0VULWFmdGVyLVBVVCBldmVudHVhbGx5IGNvbnNpc3RlbnQuIFRoaXMgaGFzIGJlZW5cbiAgICogb2JzZXJ2ZWQgdG8gcmVzdWx0IGluIENsb3VkRm9ybWF0aW9uIGlzc3VpbmcgXCJWYWxpZGF0aW9uRXJyb3I6IFMzIGVycm9yOiBBY2Nlc3MgRGVuaWVkXCIsIGZvclxuICAgKiBleGFtcGxlIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvYXdzLWNkay9pc3N1ZXMvNjQzMC5cbiAgICpcbiAgICogVG8gcHJldmVudCB0aGlzLCB3ZSBhcmUgaW5zdGVhZCB1c2luZyB0aGUgbGlzdE9iamVjdHNWMiBjYWxsLCB1c2luZyB0aGUgbG9va2VkIHVwIGtleSBhcyB0aGVcbiAgICogcHJlZml4LCBhbmQgbGltaXRpbmcgcmVzdWx0cyB0byAxLiBTaW5jZSB0aGUgbGlzdCBvcGVyYXRpb24gcmV0dXJucyBrZXlzIG9yZGVyZWQgYnkgYmluYXJ5XG4gICAqIFVURi04IHJlcHJlc2VudGF0aW9uLCB0aGUga2V5IHdlIGFyZSBsb29raW5nIGZvciBpcyBndWFyYW50ZWVkIHRvIGFsd2F5cyBiZSB0aGUgZmlyc3QgbWF0Y2hcbiAgICogcmV0dXJuZWQgaWYgaXQgZXhpc3RzLlxuICAgKi9cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzMy5saXN0T2JqZWN0c1YyKHsgQnVja2V0OiBidWNrZXQsIFByZWZpeDoga2V5LCBNYXhLZXlzOiAxIH0pLnByb21pc2UoKTtcbiAgcmV0dXJuIHJlc3BvbnNlLkNvbnRlbnRzICE9IG51bGwgJiYgcmVzcG9uc2UuQ29udGVudHMuc29tZShvYmplY3QgPT4gb2JqZWN0LktleSA9PT0ga2V5KTtcbn1cbiJdfQ==