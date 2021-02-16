
![](typescript-python.png | width=100)

TypeScript was the first language supported for developing AWS CDK applications, and for that reason, there is a substantial amount of example CDK code written in TypeScript. we have kept the main cdk stack code in Typescript and have changed the rest into Python, mainly lambda function code.
[Whcich programming language is best for aws-cdk ](https://awsmaniac.com/which-programming-language-is-the-best-for-aws-cdk/)

# CDK in Python

Python is a fully-supported client language for the AWS CDK and is considered stable. Python AWS CDK applications require Python 3.6 or later. The Python package installer, pip, and virtual environment manager, virtualenv, are also required. Windows installations of compatible Python versions include these tools. On Linux, pip and virtualenv may be provided as separate packages in your package manager.
[Working with the AWS CDK in Python](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)

 # Creating a project
You create a new AWS CDK project by invoking cdk init in an empty directory.

```javascript
mkdir my-project
cd my-project
cdk init app --language python

```
After initializing the project, activate the project's virtual environment. This allows the project's dependencies to be installed locally in the project folder, instead of globally.
The Python templates include a batch file, source.bat, that allows the same command to be used on Windows. The traditional Windows command, .venv\Scripts\activate.bat, works, too.

```javascript
source .venv/bin/activate
```
After activating your virtual environment, install the app's standard dependencies:

```javascript
python -m pip install -r requirements.txt
```
# Managing AWS Construct Library modules

Use the Python package installer, pip, to install and update AWS Construct Library modules for use by your apps, as well as other packages you need. pip also installs the dependencies for those modules automatically. 

```javascript
python -m pip PIP-COMMAND
```
The AWS CDK core module is named aws-cdk.core. AWS Construct Library modules are named like aws-cdk.SERVICE-NAME. 

```javascript
python -m pip install aws-cdk.aws-s3 aws-cdk.aws-lambda
```
The names used for importing AWS Construct Library modules into your Python code are similar to their package names. Simply replace the hyphens with underscores.
```python
import aws_cdk.aws_s3 as s3
import aws_cdk.aws_lambda as lambda_
```
[working with python in CDK](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)

# AWS CDK idioms in Python
## [AWS CDK idioms in Python](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html)

