"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompleteHandler = exports.onEventHandler = void 0;
const aws_sdk_1 = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
async function onEventHandler(event) {
    console.log('Event: %j', event);
    /**
     * Process only Create and Delete requests. We shouldn't receive any
     * update request and in case we do there is nothing to update.
     */
    if (event.RequestType === 'Create' || event.RequestType === 'Delete') {
        const dynamodb = new aws_sdk_1.DynamoDB();
        const data = await dynamodb.updateTable({
            TableName: event.ResourceProperties.TableName,
            ReplicaUpdates: [
                {
                    [event.RequestType]: {
                        RegionName: event.ResourceProperties.Region,
                    },
                },
            ],
        }).promise();
        console.log('Update table: %j', data);
    }
    return { PhysicalResourceId: event.ResourceProperties.Region };
}
exports.onEventHandler = onEventHandler;
async function isCompleteHandler(event) {
    var _a, _b, _c;
    console.log('Event: %j', event);
    const dynamodb = new aws_sdk_1.DynamoDB();
    const data = await dynamodb.describeTable({
        TableName: event.ResourceProperties.TableName,
    }).promise();
    console.log('Describe table: %j', data);
    const tableActive = !!(((_a = data.Table) === null || _a === void 0 ? void 0 : _a.TableStatus) === 'ACTIVE');
    const replicas = (_c = (_b = data.Table) === null || _b === void 0 ? void 0 : _b.Replicas) !== null && _c !== void 0 ? _c : [];
    const regionReplica = replicas.find(r => r.RegionName === event.ResourceProperties.Region);
    const replicaActive = !!((regionReplica === null || regionReplica === void 0 ? void 0 : regionReplica.ReplicaStatus) === 'ACTIVE');
    switch (event.RequestType) {
        case 'Create':
        case 'Update':
            // Complete when replica is reported as ACTIVE
            return { IsComplete: tableActive && replicaActive };
        case 'Delete':
            // Complete when replica is gone
            return { IsComplete: tableActive && regionReplica === undefined };
    }
}
exports.isCompleteHandler = isCompleteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxxQ0FBbUMsQ0FBQyx3REFBd0Q7QUFFckYsS0FBSyxVQUFVLGNBQWMsQ0FBQyxLQUFxQjtJQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVoQzs7O09BR0c7SUFDSCxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssUUFBUSxFQUFFO1FBQ3BFLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsRUFBRSxDQUFDO1FBRWhDLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUN0QyxTQUFTLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFNBQVM7WUFDN0MsY0FBYyxFQUFFO2dCQUNkO29CQUNFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUNuQixVQUFVLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU07cUJBQzVDO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3ZDO0lBRUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNqRSxDQUFDO0FBeEJELHdDQXdCQztBQUVNLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxLQUF3Qjs7SUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxFQUFFLENBQUM7SUFFaEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDO1FBQ3hDLFNBQVMsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUztLQUM5QyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXhDLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQUEsSUFBSSxDQUFDLEtBQUssMENBQUUsV0FBVyxNQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQzdELE1BQU0sUUFBUSxlQUFHLElBQUksQ0FBQyxLQUFLLDBDQUFFLFFBQVEsbUNBQUksRUFBRSxDQUFDO0lBQzVDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRixNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxhQUFhLE1BQUssUUFBUSxDQUFDLENBQUM7SUFFcEUsUUFBUSxLQUFLLENBQUMsV0FBVyxFQUFFO1FBQ3pCLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRO1lBQ1gsOENBQThDO1lBQzlDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQ3RELEtBQUssUUFBUTtZQUNYLGdDQUFnQztZQUNoQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFLENBQUM7S0FDckU7QUFDSCxDQUFDO0FBeEJELDhDQXdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmltcG9ydCB0eXBlIHsgSXNDb21wbGV0ZVJlcXVlc3QsIElzQ29tcGxldGVSZXNwb25zZSwgT25FdmVudFJlcXVlc3QsIE9uRXZlbnRSZXNwb25zZSB9IGZyb20gJ0Bhd3MtY2RrL2N1c3RvbS1yZXNvdXJjZXMvbGliL3Byb3ZpZGVyLWZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBEeW5hbW9EQiB9IGZyb20gJ2F3cy1zZGsnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25FdmVudEhhbmRsZXIoZXZlbnQ6IE9uRXZlbnRSZXF1ZXN0KTogUHJvbWlzZTxPbkV2ZW50UmVzcG9uc2U+IHtcbiAgY29uc29sZS5sb2coJ0V2ZW50OiAlaicsIGV2ZW50KTtcblxuICAvKipcbiAgICogUHJvY2VzcyBvbmx5IENyZWF0ZSBhbmQgRGVsZXRlIHJlcXVlc3RzLiBXZSBzaG91bGRuJ3QgcmVjZWl2ZSBhbnlcbiAgICogdXBkYXRlIHJlcXVlc3QgYW5kIGluIGNhc2Ugd2UgZG8gdGhlcmUgaXMgbm90aGluZyB0byB1cGRhdGUuXG4gICAqL1xuICBpZiAoZXZlbnQuUmVxdWVzdFR5cGUgPT09ICdDcmVhdGUnIHx8IGV2ZW50LlJlcXVlc3RUeXBlID09PSAnRGVsZXRlJykge1xuICAgIGNvbnN0IGR5bmFtb2RiID0gbmV3IER5bmFtb0RCKCk7XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgZHluYW1vZGIudXBkYXRlVGFibGUoe1xuICAgICAgVGFibGVOYW1lOiBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuVGFibGVOYW1lLFxuICAgICAgUmVwbGljYVVwZGF0ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIFtldmVudC5SZXF1ZXN0VHlwZV06IHtcbiAgICAgICAgICAgIFJlZ2lvbk5hbWU6IGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5SZWdpb24sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSkucHJvbWlzZSgpO1xuICAgIGNvbnNvbGUubG9nKCdVcGRhdGUgdGFibGU6ICVqJywgZGF0YSk7XG4gIH1cblxuICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6IGV2ZW50LlJlc291cmNlUHJvcGVydGllcy5SZWdpb24gfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzQ29tcGxldGVIYW5kbGVyKGV2ZW50OiBJc0NvbXBsZXRlUmVxdWVzdCk6IFByb21pc2U8SXNDb21wbGV0ZVJlc3BvbnNlPiB7XG4gIGNvbnNvbGUubG9nKCdFdmVudDogJWonLCBldmVudCk7XG5cbiAgY29uc3QgZHluYW1vZGIgPSBuZXcgRHluYW1vREIoKTtcblxuICBjb25zdCBkYXRhID0gYXdhaXQgZHluYW1vZGIuZGVzY3JpYmVUYWJsZSh7XG4gICAgVGFibGVOYW1lOiBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuVGFibGVOYW1lLFxuICB9KS5wcm9taXNlKCk7XG4gIGNvbnNvbGUubG9nKCdEZXNjcmliZSB0YWJsZTogJWonLCBkYXRhKTtcblxuICBjb25zdCB0YWJsZUFjdGl2ZSA9ICEhKGRhdGEuVGFibGU/LlRhYmxlU3RhdHVzID09PSAnQUNUSVZFJyk7XG4gIGNvbnN0IHJlcGxpY2FzID0gZGF0YS5UYWJsZT8uUmVwbGljYXMgPz8gW107XG4gIGNvbnN0IHJlZ2lvblJlcGxpY2EgPSByZXBsaWNhcy5maW5kKHIgPT4gci5SZWdpb25OYW1lID09PSBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuUmVnaW9uKTtcbiAgY29uc3QgcmVwbGljYUFjdGl2ZSA9ICEhKHJlZ2lvblJlcGxpY2E/LlJlcGxpY2FTdGF0dXMgPT09ICdBQ1RJVkUnKTtcblxuICBzd2l0Y2ggKGV2ZW50LlJlcXVlc3RUeXBlKSB7XG4gICAgY2FzZSAnQ3JlYXRlJzpcbiAgICBjYXNlICdVcGRhdGUnOlxuICAgICAgLy8gQ29tcGxldGUgd2hlbiByZXBsaWNhIGlzIHJlcG9ydGVkIGFzIEFDVElWRVxuICAgICAgcmV0dXJuIHsgSXNDb21wbGV0ZTogdGFibGVBY3RpdmUgJiYgcmVwbGljYUFjdGl2ZSB9O1xuICAgIGNhc2UgJ0RlbGV0ZSc6XG4gICAgICAvLyBDb21wbGV0ZSB3aGVuIHJlcGxpY2EgaXMgZ29uZVxuICAgICAgcmV0dXJuIHsgSXNDb21wbGV0ZTogdGFibGVBY3RpdmUgJiYgcmVnaW9uUmVwbGljYSA9PT0gdW5kZWZpbmVkIH07XG4gIH1cbn1cbiJdfQ==