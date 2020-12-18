// TODO: Move these values to or extract them from the Cognito Provider in the Auth category for Auth V2
var AuthState;
(function (AuthState) {
    AuthState["SignUp"] = "signup";
    AuthState["SignOut"] = "signout";
    AuthState["SignIn"] = "signin";
    AuthState["Loading"] = "loading";
    AuthState["SignedOut"] = "signedout";
    AuthState["SignedIn"] = "signedin";
    AuthState["SigningUp"] = "signingup";
    AuthState["ConfirmSignUp"] = "confirmSignUp";
    AuthState["confirmingSignUpCustomFlow"] = "confirmsignupcustomflow";
    AuthState["ConfirmSignIn"] = "confirmSignIn";
    AuthState["confirmingSignInCustomFlow"] = "confirmingsignincustomflow";
    AuthState["VerifyingAttributes"] = "verifyingattributes";
    AuthState["ForgotPassword"] = "forgotpassword";
    AuthState["ResetPassword"] = "resettingpassword";
    AuthState["SettingMFA"] = "settingMFA";
    AuthState["TOTPSetup"] = "TOTPSetup";
    AuthState["CustomConfirmSignIn"] = "customConfirmSignIn";
    AuthState["VerifyContact"] = "verifyContact";
})(AuthState || (AuthState = {}));
var MfaOption;
(function (MfaOption) {
    MfaOption["TOTP"] = "TOTP";
    MfaOption["SMS"] = "SMS";
    MfaOption["NOMFA"] = "NOMFA";
})(MfaOption || (MfaOption = {}));
var ChallengeName;
(function (ChallengeName) {
    ChallengeName["SoftwareTokenMFA"] = "SOFTWARE_TOKEN_MFA";
    ChallengeName["SMSMFA"] = "SMS_MFA";
    ChallengeName["NewPasswordRequired"] = "NEW_PASSWORD_REQUIRED";
    ChallengeName["MFASetup"] = "MFA_SETUP";
    ChallengeName["CustomChallenge"] = "CUSTOM_CHALLENGE";
})(ChallengeName || (ChallengeName = {}));
var AuthFormField;
(function (AuthFormField) {
    AuthFormField["Password"] = "password";
})(AuthFormField || (AuthFormField = {}));
var UsernameAlias;
(function (UsernameAlias) {
    UsernameAlias["username"] = "username";
    UsernameAlias["email"] = "email";
    UsernameAlias["phone_number"] = "phone_number";
})(UsernameAlias || (UsernameAlias = {}));

export { AuthState as A, ChallengeName as C, MfaOption as M, UsernameAlias as U, AuthFormField as a };
