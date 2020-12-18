"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStructuredFile = exports.serializeStructure = exports.deserializeStructure = exports.toYAML = void 0;
const yaml_cfn = require("@aws-cdk/yaml-cfn");
const fs = require("fs-extra");
/**
 * Stringify to YAML
 */
function toYAML(obj) {
    return yaml_cfn.serialize(obj);
}
exports.toYAML = toYAML;
/**
 * Parse either YAML or JSON
 */
function deserializeStructure(str) {
    try {
        return yaml_cfn.deserialize(str);
    }
    catch (e) {
        // This shouldn't really ever happen I think, but it's the code we had so I'm leaving it.
        return JSON.parse(str);
    }
}
exports.deserializeStructure = deserializeStructure;
/**
 * Serialize to either YAML or JSON
 */
function serializeStructure(object, json) {
    if (json) {
        return JSON.stringify(object, undefined, 2);
    }
    else {
        return toYAML(object);
    }
}
exports.serializeStructure = serializeStructure;
/**
 * Load a YAML or JSON file from disk
 */
async function loadStructuredFile(fileName) {
    const contents = await fs.readFile(fileName, { encoding: 'utf-8' });
    return deserializeStructure(contents);
}
exports.loadStructuredFile = loadStructuredFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VyaWFsaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhDQUE4QztBQUM5QywrQkFBK0I7QUFFL0I7O0dBRUc7QUFDSCxTQUFnQixNQUFNLENBQUMsR0FBUTtJQUM3QixPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUZELHdCQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxHQUFXO0lBQzlDLElBQUk7UUFDRixPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLHlGQUF5RjtRQUN6RixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDeEI7QUFDSCxDQUFDO0FBUEQsb0RBT0M7QUFFRDs7R0FFRztBQUNILFNBQWdCLGtCQUFrQixDQUFDLE1BQVcsRUFBRSxJQUFhO0lBQzNELElBQUksSUFBSSxFQUFFO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDN0M7U0FBTTtRQUNMLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZCO0FBQ0gsQ0FBQztBQU5ELGdEQU1DO0FBRUQ7O0dBRUc7QUFDSSxLQUFLLFVBQVUsa0JBQWtCLENBQUMsUUFBZ0I7SUFDdkQsTUFBTSxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUhELGdEQUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgeWFtbF9jZm4gZnJvbSAnQGF3cy1jZGsveWFtbC1jZm4nO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuXG4vKipcbiAqIFN0cmluZ2lmeSB0byBZQU1MXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1lBTUwob2JqOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4geWFtbF9jZm4uc2VyaWFsaXplKG9iaik7XG59XG5cbi8qKlxuICogUGFyc2UgZWl0aGVyIFlBTUwgb3IgSlNPTlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVzZXJpYWxpemVTdHJ1Y3R1cmUoc3RyOiBzdHJpbmcpOiBhbnkge1xuICB0cnkge1xuICAgIHJldHVybiB5YW1sX2Nmbi5kZXNlcmlhbGl6ZShzdHIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gVGhpcyBzaG91bGRuJ3QgcmVhbGx5IGV2ZXIgaGFwcGVuIEkgdGhpbmssIGJ1dCBpdCdzIHRoZSBjb2RlIHdlIGhhZCBzbyBJJ20gbGVhdmluZyBpdC5cbiAgICByZXR1cm4gSlNPTi5wYXJzZShzdHIpO1xuICB9XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRvIGVpdGhlciBZQU1MIG9yIEpTT05cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVN0cnVjdHVyZShvYmplY3Q6IGFueSwganNvbjogYm9vbGVhbikge1xuICBpZiAoanNvbikge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmplY3QsIHVuZGVmaW5lZCwgMik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRvWUFNTChvYmplY3QpO1xuICB9XG59XG5cbi8qKlxuICogTG9hZCBhIFlBTUwgb3IgSlNPTiBmaWxlIGZyb20gZGlza1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFN0cnVjdHVyZWRGaWxlKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgY29udGVudHMgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlTmFtZSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9KTtcbiAgcmV0dXJuIGRlc2VyaWFsaXplU3RydWN0dXJlKGNvbnRlbnRzKTtcbn1cbiJdfQ==