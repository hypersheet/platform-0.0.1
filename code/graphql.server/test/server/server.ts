import { ApolloServer, express, t, pkg } from './common';
import { Context } from './Context';
import { init } from './schema';

/**
 * [Express] web server.
 */
export const server = express();

/**
 * [GraphQL] server.
 */
const schema = init({});
export const graphql = new ApolloServer({
  schema,

  /**
   * Enable playground in production.
   * - https://www.apollographql.com/docs/apollo-server/features/graphql-playground#enabling-graphql-playground-in-production
   */
  playground: true,
  introspection: true,

  /**
   * Generate the context that is passed to each resolver.
   */
  context(e): t.IContext {
    const { req } = e;
    return new Context({ req });
  },
});

graphql.applyMiddleware({ app: server });

/**
 * [Routes]
 */
server.get('*', (req, res) => {
  const { name, version } = pkg;
  res.send({ name, version });
});