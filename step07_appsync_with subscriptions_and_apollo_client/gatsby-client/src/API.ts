/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TodoInput = {
  title: string,
  done: boolean,
};

export type AddTodoMutationVariables = {
  todo: TodoInput,
};

export type AddTodoMutation = {
  addTodo:  {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  },
};

export type UpdateTodoMutationVariables = {
  id: string,
  todo: TodoInput,
};

export type UpdateTodoMutation = {
  updateTodo:  {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  },
};

export type DeleteTodoMutationVariables = {
  id: string,
};

export type DeleteTodoMutation = {
  deleteTodo:  {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  },
};

export type GetTodosQuery = {
  getTodos:  Array< {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  } | null > | null,
};

export type OnAddTodoSubscription = {
  onAddTodo:  {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  } | null,
};

export type OnDeleteTodoSubscription = {
  onDeleteTodo:  {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  } | null,
};

export type OnUpdateTodoSubscription = {
  onUpdateTodo:  {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
  } | null,
};
