/* eslint-disable */

const awsmobile = {
    "aws_project_region": "eu-west-1", // REGION
    "aws_cognito_region": "eu-west-1", // REGION
    "aws_user_pools_id": "ENTER_USER_POOL_ID", // ENTER YOUR USER POOL ID
    "aws_user_pools_web_client_id": "ENTER_USER_POOL_APP_CLIENT_ID", // ENTER YOUR CLIENT ID
    "oauth": {
        "domain": "ENTER_COGNITO_DOMAIN", // ENTER COGNITO DOMAIN
        "scope": [
            "phone",
            "email",
            "openid",
            "profile"
        ],
        "redirectSignIn": "SITE_TO_REDIRECT_AFTER_SIGNIN", // ENTER YOUR SITE (enter http://localhost:8000 if testing frontend locally) 
        "redirectSignOut": "SITE_TO_REDIRECT_AFTER_SIGNOUT", // ENTER YOUR SITE (enter http://localhost:8000 if testing frontend locally) 
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS"
};

export default awsmobile;
