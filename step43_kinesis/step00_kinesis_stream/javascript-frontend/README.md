
# Getting started

1. Install the dependencies listed in the package.json.
```
npm install
```

2. Run sample code:
```
cd src
update IdentityPoolId and region values in kinesis-example.js file ( Once backend is up on aws, then these values can be found on cognito -> Identity pool -> Your-Identity-Pool -> Edit Settings)
execute html file. 
To send data to aws kinesis stream click anywhere on page (With every click a new record will be sent to stream)
```
