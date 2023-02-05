# Main API Service - node, graphql and express

## Installation

```
yarn install
```

## Start

```
yarn dev
```

The server will run on port 8080.

## Database

Below is not needed to run locally currently.

1. start mongodb locally and add the connection to the proper `DB_URL` env variable example `mongodb://127.0.0.1:27017/?compressors=zlib&gssapiServiceName=mongodb`.
2. get mongodump contents from team member and run `mongorestore`.

## Data Info

### User

`free`: role = 0
`basic`: role = 1
`premium`: role = 2

### Model Setup

1. In the model folder the methods have the first param as direct props descendant and the second is the params from the query.

## LICENSE

check the license file in the root of the project.
