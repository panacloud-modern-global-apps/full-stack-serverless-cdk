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
  mutation UpdateTodo($id: ID!, $todo: TodoInput!) {
    updateTodo(id: $id, todo: $todo) {
      id
      title
      done
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
      title
      done
    }
  }
`;
