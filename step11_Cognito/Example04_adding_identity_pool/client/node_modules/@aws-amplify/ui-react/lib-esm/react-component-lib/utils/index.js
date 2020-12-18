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
import React from 'react';
export var dashToPascalCase = function (str) {
    return str
        .toLowerCase()
        .split('-')
        .map(function (segment) { return segment.charAt(0).toUpperCase() + segment.slice(1); })
        .join('');
};
export var createForwardRef = function (ReactComponent, displayName) {
    var forwardRef = function (props, ref) {
        return React.createElement(ReactComponent, __assign({}, props, { forwardedRef: ref }));
    };
    forwardRef.displayName = displayName;
    return React.forwardRef(forwardRef);
};
export * from './attachEventProps';
//# sourceMappingURL=index.js.map