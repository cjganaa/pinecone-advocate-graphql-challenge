import { useQuery, gql } from '@apollo/client';

const GET_TASKS = gql`
  query {
    getAllTasks {
      name
      description
      isDone
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_TASKS);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  console.log(data.getAllTasks);
  return <div>Hello From Pinecone Advocate Graphql Challenge</div>;
}
