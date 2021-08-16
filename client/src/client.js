import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import gql from 'graphql-tag'

/**
 * Create a new apollo client and export as default
 */

// new LOCAL typeDef
const typeDefs = gql`
  extend type User {
    age: Int
  }
  extend type Pet {
    vaccinated: Boolean!
  }
`
// resolver to set LOCAL definiton of local typeDef
const resolvers = {
  User: {
    // age(user, args, context, info, other) {
    age() {
      return 35
    }
  },
  Pet: {
    vaccinated() {
      return true
    }
  }
}

const http = new HttpLink({
  uri: 'http://localhost:4000/'
  // uri: 'https://rickandmortyapi.com/graphql'
})
const delay = setContext(
  request =>
    new Promise((success, fail) => {
      setTimeout(() => {
        success()
      }, 1500);
    })
)

const cache = new InMemoryCache()

const link = ApolloLink.from([
  delay,
  http
])

const client = new ApolloClient({
  link,
  cache,
  resolvers,
  typeDefs
})


// const link = new HttpLink({
//   uri: 'http://localhost:4000/'
//   // uri: 'https://rickandmortyapi.com/graphql'
// })
// const cache = new InMemoryCache()
// const client = new ApolloClient({
//   link,
//   cache
// })

// const query = gql`
//   {
//     characters {
//       results {
//         name
//         id
//         __typename
//       }
//     }
//   }
// `
// try {
//   client.query({query})
//   .then(result => console.log(result))
// } catch (error) {
//   console.log('Error: ', error)
// }

export default client
