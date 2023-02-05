import gql from 'graphql-tag'

export const PING = gql`
  mutation Ping($jwt: String) {
    ping(jwt: $jwt) {
      jwt
    }
  }
`
