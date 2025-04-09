import { useMutation, gql } from '@apollo/client';

const GET_USER_DONE_TASKS_LISTS = gql`
  mutation GetUserDoneTasksLists($userId: String!){
    getUserDoneTasksLists(userId: $userId) {
        name
        description
        isDone
        priority
        tags
        createdAt
        updatedAt
        userId
    }
}
`;


const userId = "67f5132858a9a62357ffd5f9";
export default function Home() {
    const [mutateFunction, { data, loading, error }] = useMutation(GET_USER_DONE_TASKS_LISTS, {
    variables: { userId: userId },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  console.log(data);
  return (
  <div>Hello From Pinecone Advocate Graphql Challenge 
    <button onClick={()=>mutateFunction({variables: { userId: userId }})}>refetch</button>
  </div>);
}
