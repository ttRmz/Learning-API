require('dotenv').config()

const hapi = require('hapi')
const mongoose = require('mongoose')
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi')
const schema = require('./graphql/schema')
const Painting = require('./models/Painting')

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
mongoose.connection.once('open', () => {
  console.log('DB connected ✅')
})

const server = hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.URI || 'localhost',
})

const init = async () => {
  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql',
      },
      route: {
        cors: true,
      },
    },
  })

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema,
      },
      route: {
        cors: true,
      },
    },
  })

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (req, res) => {
        return `<h1>modern api</h1>`
      },
    },
    {
      method: 'GET',
      path: '/api/v1/paintings',
      handler: (req, res) => {
        return Painting.find()
      },
    },
    {
      method: 'POST',
      path: '/api/v1/paintings',
      handler: (req, res) => {
        const { name, url, techniques } = req.payload
        const painting = new Painting({
          name,
          url,
          techniques,
        })
        return painting.save()
      },
    },
  ])

  await server.start()
  console.log(`Server running at: ${server.info.uri} 🚀`)
}

init()
