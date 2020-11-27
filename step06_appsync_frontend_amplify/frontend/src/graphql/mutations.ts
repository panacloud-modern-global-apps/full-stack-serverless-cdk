/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addTodo = /* GraphQL */ `
  mutation AddTodo($todo: TodoInput!) {
    addTodo(todo: $todo) {
      id
      title
      done
    }
  }
`;
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo($todo: TodoInput!) {
    updateTodo(todo: $todo) {
      id
      title
      done
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo($todoId: String!) {
    deleteTodo(todoId: $todoId)
  }
`;
