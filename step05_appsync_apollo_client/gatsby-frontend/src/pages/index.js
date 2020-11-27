import React, { useEffect, useState } from "react"
import { useQuery, gql, useMutation } from "@apollo/client"
import shortid from "shortid"

const GET_TODOS = gql`
  query {
    getTodos {
      id
      title
      done
    }
  }
`
const CREATE_TODO = gql`
  mutation createTodo($todo: TodoInput!) {
    addTodo(todo: $todo) {
      id
      title
      done
    }
  }
`

const Index = () => {
  const [title, setTitle] = useState("")
  const { data, loading } = useQuery(GET_TODOS)
  const [createNote] = useMutation(CREATE_TODO)

  const handleSubmit = async () => {
    const todo = {
      id: shortid.generate(),
      title,
      done: false,
    }
    console.log("Creating Todo:", todo)
    setTitle("")
    await createNote({
      variables: {
        todo,
      },
    })
  }

  return (
    <div>
      {loading && <h1>Loading ...</h1>}
      <label>
        Todo:
        <input
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </label>
      <button onClick={() => handleSubmit()}>Create Todo</button>
      {!loading &&
        data &&
        data.getTodos.map(item => (
          <div style={{ marginLeft: "1rem", marginTop: "2rem" }} key={item.id}>
            {item.title} {item.done ? "DONE" : "NOT COMPLETED"}
          </div>
        ))}
    </div>
  )
}

export default Index
