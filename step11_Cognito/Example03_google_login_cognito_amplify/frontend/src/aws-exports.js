/* eslint-disable */

const awsmobile = {
    "aws_project_region": "eu-west-1", // REGION
    "aws_cognito_region": "eu-west-1", // REGION
    "aws_user_pools_id": "eu-west-1_xluFXgOKm", // ENTER YOUR USER POOL ID
    "aws_user_pools_web_client_id": "1uimf76uo9d9neswq6s5in72lm", // ENTER YOUR CLIENT ID
    "oauth": {
        "domain": "eru-test-pool.auth.eu-west-1.amazoncognito.com", // ENTER COGNITO DOMAIN LIKE: eru-test-pool.auth.eu-west-1.amazoncognito.com
        "scope": [
            "phone",
            "email",
            "openid",
            "profile"
        ],
        "redirectSignIn": "http://localhost:8000/", // ENTER YOUR SITE (enter http://localhost:8000 if testing frontend locally) 
        "redirectSignOut": "http://localhost:8000/", // ENTER YOUR SITE (enter http://localhost:8000 if testing frontend locally) 
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS"
};

export default awsmobile;
