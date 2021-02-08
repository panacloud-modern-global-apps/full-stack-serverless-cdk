 # A module for managing MySQL connections at serverless scale.
 
Serverless MySQL is a wrapper for mysql Node.js module called "mysql". Normally, using the mysql module with Node apps would be just fine. However, serverless functions (like AWS Lambda, Google Cloud Functions, and Azure Functions) scale almost infinitely by creating separate instances for each concurrent user. This is a MAJOR PROBLEM for RDBS solutions like MySQL, because available connections can be quickly maxed out by competing functions.

Serverless MySQL adds a connection management component to the mysql module that is designed specifically for use with serverless applications.In addition, Serverless MySQL also adds modern async/await support to the mysql module, eliminating callback hell or the need to wrap calls in promises. It also dramatically simplifies transactions, giving you a simple and consistent pattern to handle common workflows.

# Installation

`npm install serverless-mysql`

[ How to use serverless-mysql](https://github.com/jeremydaly/serverless-mysql)
