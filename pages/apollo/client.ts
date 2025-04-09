import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { refreshAccessToken } from '../lib/auth';

const httpLink = new HttpLink({
    uri: '/api/graphql',
  });

const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('accessToken');
    operation.setContext({
        headers: {
        authorization: token ? `Bearer ${token}` : '',
        },
    });
    return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL Error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
        );
      });

      const unauthorizedError = graphQLErrors.find((err) => err.message === 'Invalid or expired token');
      if (unauthorizedError) {
        refreshAccessToken()
          .catch(() => {
            console.error('Token refresh failed, redirecting to login');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login'; // Simple redirect
          });
      }
    }
    if (networkError) {
      console.error(`[Network Error]: ${networkError.message}`);
    }
});

export const client = new ApolloClient({
    link: from([errorLink,authLink, httpLink]),
    // uri: 'https://your-graphql-endpoint.com/graphql',
    cache: new InMemoryCache(),
});
