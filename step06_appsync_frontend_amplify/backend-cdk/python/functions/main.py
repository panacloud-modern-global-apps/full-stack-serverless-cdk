from __future__ import print_function
from addTodo import addTodoItem
from getTodo import getItem
from deleteTodo import deleteItem
from updateTodo import updateItem
import os
import boto3
dynamodb = boto3.resource('dynamodb')
def handler(event, context):

    field = event['info']['fieldName']
    if field == "addTodo":
        todo = event['arguments']['todo']
        return addTodoItem(todo)
    if field == "getTodos":
        return getItem()
    if field == "deleteTodo":
        todoId = event['arguments']['todoId']
        return deleteItem(todoId)
    if field == "updateTodo":
        todo = event['arguments']['todo']
        return updateItem(todo)