import { ApolloClient, InMemoryCache} from '@apollo/client';

export const client = new ApolloClient({
    uri: '/api/graphql',
    // uri: 'https://your-graphql-endpoint.com/graphql',
    cache: new InMemoryCache(),
});
