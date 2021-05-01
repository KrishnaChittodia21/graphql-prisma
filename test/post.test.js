import "cross-fetch/polyfill";
import { gql } from "apollo-boost";
import seedDatabase, { postOne } from './utils/seedDatabase';
import getClient from './utils/getClient';

const client = getClient();

beforeEach(seedDatabase);

test('should expose published post', async () => {
  const getPosts = gql`
    query {
      posts {
        id
        title
        body
        published
      }
    }
  `;

  const response = await client.query({ query: getPosts});
  expect(response.data.posts.length).toBe(1);
  expect(response.data.posts[0].published).toBe(true);
})

test('should be able to update', async () => {
  const updatePost = gql`
    mutation {
      updatePost(
        id: "${postOne.post.id}",
        data: {
          published: false
        }
      ){
        id
        published
      }
    }
  `;
  const { data } = await client.mutate({ mutation: updatePost});
  expect(data.updatePost.published).toBe(false)
})