import { Auth } from './Auth';
import { CognitoHostedUIIdentityProvider } from './types/Auth';
import { CognitoUser, CookieStorage, appendToCognitoUserAgent } from 'amazon-cognito-identity-js';
import { AuthErrorStrings } from './common/AuthErrorStrings';
/**
 * @deprecated use named import
 */
export default Auth;
export { Auth, CognitoUser, CookieStorage, CognitoHostedUIIdentityProvider, appendToCognitoUserAgent, AuthErrorStrings, };
