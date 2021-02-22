#Adding base image
FROM public.ecr.aws/lambda/python:3.8
# Alternatively, you can pull the base image from Docker Hub

COPY app.py ./

# Install dependencies for function
# RUN pip install --target ${FUNCTION_DIR} names
RUN pip install --target lambdaImage names

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]

# pip install awslambdaric
