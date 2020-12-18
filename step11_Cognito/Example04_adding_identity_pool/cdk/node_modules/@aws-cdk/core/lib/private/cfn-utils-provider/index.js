"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
/**
 * Parses the value of "Value" and reflects it back as attribute.
 */
async function handler(event) {
    // dispatch based on resource type
    if (event.ResourceType === "Custom::AWSCDKCfnJson" /* CFN_JSON */) {
        return cfnJsonHandler(event);
    }
    throw new Error(`unexpected resource type "${event.ResourceType}`);
}
exports.handler = handler;
function cfnJsonHandler(event) {
    return {
        Data: {
            Value: JSON.parse(event.ResourceProperties.Value),
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTs7R0FFRztBQUNJLEtBQUssVUFBVSxPQUFPLENBQUMsS0FBa0Q7SUFFOUUsa0NBQWtDO0lBQ2xDLElBQUksS0FBSyxDQUFDLFlBQVksMkNBQWtDLEVBQUU7UUFDeEQsT0FBTyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDOUI7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUNyRSxDQUFDO0FBUkQsMEJBUUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxLQUFrRDtJQUN4RSxPQUFPO1FBQ0wsSUFBSSxFQUFFO1lBQ0osS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztTQUNsRDtLQUNGLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2ZuVXRpbHNSZXNvdXJjZVR5cGUgfSBmcm9tICcuL2NvbnN0cyc7XG5cbi8qKlxuICogUGFyc2VzIHRoZSB2YWx1ZSBvZiBcIlZhbHVlXCIgYW5kIHJlZmxlY3RzIGl0IGJhY2sgYXMgYXR0cmlidXRlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihldmVudDogQVdTTGFtYmRhLkNsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCkge1xuXG4gIC8vIGRpc3BhdGNoIGJhc2VkIG9uIHJlc291cmNlIHR5cGVcbiAgaWYgKGV2ZW50LlJlc291cmNlVHlwZSA9PT0gQ2ZuVXRpbHNSZXNvdXJjZVR5cGUuQ0ZOX0pTT04pIHtcbiAgICByZXR1cm4gY2ZuSnNvbkhhbmRsZXIoZXZlbnQpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGB1bmV4cGVjdGVkIHJlc291cmNlIHR5cGUgXCIke2V2ZW50LlJlc291cmNlVHlwZX1gKTtcbn1cblxuZnVuY3Rpb24gY2ZuSnNvbkhhbmRsZXIoZXZlbnQ6IEFXU0xhbWJkYS5DbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnQpIHtcbiAgcmV0dXJuIHtcbiAgICBEYXRhOiB7XG4gICAgICBWYWx1ZTogSlNPTi5wYXJzZShldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuVmFsdWUpLFxuICAgIH0sXG4gIH07XG59XG4iXX0=