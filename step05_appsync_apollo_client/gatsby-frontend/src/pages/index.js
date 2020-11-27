import React, { useEffect, useState } from "react"
import { useQuery, gql, useMutation } from "@apollo/client"

const LIST_NOTES = gql`
  query {
    listNotes {
      id
      name
      completed
    }
  }
`
const CREATE_NOTE = gql`
  mutation createNote($note: NoteInput!) {
    createNote(note: $note) {
      id
      name
      completed
    }
  }
`

const Index = () => {
  const [name, setName] = useState("")
  const { data, loading } = useQuery(LIST_NOTES)
  const [createNote] = useMutation(CREATE_NOTE)

  const handleSubmit = async () => {
    const note = {
      id: data?.listNotes ? `${data.listNotes.length + 1}` : "1",
      name,
      completed: false,
    }
    console.log("Creating Note:", note)
    setName("")
    await createNote({
      variables: {
        note,
      },
    })
  }

  return (
    <div>
      {loading && <h1>Loading ...</h1>}
      <label>
        Note:
        <input value={name} onChange={({ target }) => setName(target.value)} />
      </label>
      <button onClick={() => handleSubmit()}>Create Note</button>
      {!loading &&
        data &&
        data.listNotes.map(item => (
          <div key={item.id}>
            {item.name} {item.completed ? "DONE" : "NOT COMPLETED"}
          </div>
        ))}
    </div>
  )
}

export default Index
