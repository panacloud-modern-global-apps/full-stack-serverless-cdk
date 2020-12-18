"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
// See: https://reactnative.dev/docs/asyncstorage
function createInMemoryStore() {
    return react_native_1.AsyncStorage;
}
exports.createInMemoryStore = createInMemoryStore;
//# sourceMappingURL=InMemoryStore.native.js.map