"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
exports.dashToPascalCase = function (str) {
    return str
        .toLowerCase()
        .split('-')
        .map(function (segment) { return segment.charAt(0).toUpperCase() + segment.slice(1); })
        .join('');
};
exports.createForwardRef = function (ReactComponent, displayName) {
    var forwardRef = function (props, ref) {
        return react_1.default.createElement(ReactComponent, __assign({}, props, { forwardedRef: ref }));
    };
    forwardRef.displayName = displayName;
    return react_1.default.forwardRef(forwardRef);
};
__export(require("./attachEventProps"));
//# sourceMappingURL=index.js.map