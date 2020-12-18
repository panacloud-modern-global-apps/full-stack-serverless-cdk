const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---cache-dev-404-page-js": hot(preferDefault(require("/home/uzairbangee/Development/Jamstack/full-stack-serverless-cdk/step19_Cognito/Examplexx_adding_identity_pool/client/.cache/dev-404-page.js"))),
  "component---src-pages-index-js": hot(preferDefault(require("/home/uzairbangee/Development/Jamstack/full-stack-serverless-cdk/step19_Cognito/Examplexx_adding_identity_pool/client/src/pages/index.js")))
}

