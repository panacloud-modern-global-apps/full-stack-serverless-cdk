"use strict";

exports.__esModule = true;
exports["default"] = exports.appendToCognitoUserAgent = void 0;

// constructor
function UserAgent() {} // public


UserAgent.prototype.userAgent = 'aws-amplify/0.1.x js';

var appendToCognitoUserAgent = function appendToCognitoUserAgent(content) {
  if (!content) {
    return;
  }

  if (UserAgent.prototype.userAgent && !UserAgent.prototype.userAgent.includes(content)) {
    UserAgent.prototype.userAgent = UserAgent.prototype.userAgent.concat(' ', content);
  }

  if (!UserAgent.prototype.userAgent || UserAgent.prototype.userAgent === '') {
    UserAgent.prototype.userAgent = content;
  }
}; // class for defining the amzn user-agent


exports.appendToCognitoUserAgent = appendToCognitoUserAgent;
var _default = UserAgent;
exports["default"] = _default;