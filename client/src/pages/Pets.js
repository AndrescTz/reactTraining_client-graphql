import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'

// const GET_ALL_PETS = gql`
//   query getAllPets {
//     pets {
//     # result: pets { # (1)
//       id
//       name
//       type
//       img
//       owner {
//         id
//         age @client # getting value defined on client but not on server
//       }
//     }
//   }
// `
// const NEW_PET = gql`
//   mutation CreateAPet($newPet: NewPetInput!) {
//     addPet(input: $newPet) {
//       id
//       name
//       type
//       img
//       # we should keep same fields that we want to refresh on GET_ALL_PETS
//       owner {
//         id
//         age @client # getting value defined on client but not on server
//       }
//     }
//   }
// `

// using fragments
const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
    id
    name
    type
    img
    vaccinated @client
    owner {
      id
      age @client
    }
  }
`
const GET_ALL_PETS = gql`
  query getAllPets {
    pets {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`
const NEW_PET = gql`
  mutation CreateAPet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`

export default function Pets () {
  const [modal, setModal] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_PETS) // react hooks: woll render the page again
  const [newPet, newPetPayload] = useMutation(NEW_PET, {
    update(cache, { data: { addPet } }) {
      const { pets } = cache.readQuery({ query: GET_ALL_PETS })
      // const { result } = cache.readQuery({ query: GET_ALL_PETS }) // (1)
      cache.writeQuery({
        query: GET_ALL_PETS,
        data: { pets: [addPet, ...pets] }
        // data: { result: [addPet, ...result] } // (1)
      })
    },
    optimisticResponse: {
      __typename: 'Mutation',
      addPet: {
        __typename: 'Pet',
        id: Math.floor(Math.random() * 1000) + '',
        name: '...',
        type: '...',
        img: 'https://via.placeholder.com/300',
        owner: {
          __typename: 'User',
          id: Math.floor(Math.random() * 1000) + '',
          age: 0
        }
      }
    }
  })

  const onSubmit = input => {
    setModal(false)
    newPet({
      variables: { newPet: input } //,
      /* you can also call optimisticResponse here, it will have priority */
      // optimisticResponse: {
      //   __typename: 'Mutation',
      //   addPet: {
      //     __typename: 'Pet',
      //     id: Math.floor(Math.random() * 1000) + '',
      //     name: input.name,
      //     type: input.type,
      //     img: 'https://via.placeholder.com/300'
      //   }
      // }
    })
  }
  
  /* dont forget this, otherwise app will break. If loading true data is undefined */
  // if (loading || newPetPayload.loading) {
  if (loading) { /* for optimisticResponse remove mutation loading */
    return <Loader/>
  }

  if (error || newPetPayload.error) {
    return <p>Error!</p>
  }

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={ () => setModal(false) } />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={ () => setModal(true) }>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={ data.pets }/>
      </section>
    </div>
  )
}
