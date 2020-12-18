var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { attachEventProps, createForwardRef, dashToPascalCase, isCoveredByReact, } from './utils/index';
export var createReactComponent = function (tagName) {
    var displayName = dashToPascalCase(tagName);
    var ReactComponent = /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1(props) {
            var _this = _super.call(this, props) || this;
            _this.ref = React.createRef();
            return _this;
        }
        class_1.prototype.componentDidMount = function () {
            this.componentDidUpdate(this.props);
        };
        class_1.prototype.componentDidUpdate = function (prevProps) {
            var node = this.ref.current;
            attachEventProps(node, this.props, prevProps);
        };
        class_1.prototype.render = function () {
            var _a = this.props, children = _a.children, forwardedRef = _a.forwardedRef, style = _a.style, className = _a.className, ref = _a.ref, cProps = __rest(_a, ["children", "forwardedRef", "style", "className", "ref"]);
            var propsToPass = Object.keys(cProps).reduce(function (acc, name) {
                var isEventProp = name.indexOf('on') === 0 && name[2] === name[2].toUpperCase();
                var isDataProp = name.indexOf('data-') === 0;
                var isAriaProp = name.indexOf('aria-') === 0;
                if (isEventProp) {
                    var eventName = name.substring(2).toLowerCase();
                    if (typeof document !== "undefined" && isCoveredByReact(eventName)) {
                        acc[name] = cProps[name];
                    }
                }
                else if (isDataProp || isAriaProp) {
                    acc[name] = cProps[name];
                }
                return acc;
            }, {});
            var newProps = __assign(__assign({}, propsToPass), { ref: this.ref, style: style,
                className: className });
            return React.createElement(tagName, newProps, children);
        };
        Object.defineProperty(class_1, "displayName", {
            get: function () {
                return displayName;
            },
            enumerable: true,
            configurable: true
        });
        return class_1;
    }(React.Component));
    return createForwardRef(ReactComponent, displayName);
};
//# sourceMappingURL=createComponent.js.map