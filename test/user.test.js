import "cross-fetch/polyfill";
import ApolloBoost, { gql } from "apollo-boost";
import bcrypt from 'bcryptjs';
import prisma from '../src/prisma';

const client = new ApolloBoost({
  uri: "http://localhost:4000"
});

beforeEach(async () => {
  await prisma.mutation.deleteManyPosts();
  await prisma.mutation.deleteManyUsers();
  const user = await prisma.mutation.createUser({
    data: {
      name: 'krishna',
      email: 'krishna@krishna.com',
      password: bcrypt.hashSync('k1234!@#$')
    }
  })
  await prisma.mutation.createPost({
    data: {
      title: 'My published post',
      body: '',
      published: true,
      author: {
        connect: {
          id: user.id,
        }
      }
    }
  })
  await prisma.mutation.createPost({
    data: {
      title: 'My draft post',
      body: '',
      published: false,
      author: {
        connect: {
          id: user.id,
        }
      }
    }
  })
}, 10000)

test('should create a new user', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "dollu2120",
          email: "dollu11@dollu11.com",
          password: "k123456789",
        }
      ){
        token,
        user {
          id
        }
      }
    }
  `;

  const response = await client.mutate({
    mutation: createUser
  }).catch((err) => console.log(err))
  const exists = await prisma.exists.User({ id: response.data.createUser.user.id });
  expect(exists).toBe(true);
}, 10000)

test('should expose public author profiles', async () => {
  const getUsers = gql`
    query {
      users {
        id
        name
        email
      }
    }
  `;
  const response = await client.query({ query: getUsers});
  expect(response.data.users.length).toBe(1);
  expect(response.data.users[0].email).toBeNull();
  expect(response.data.users[0].name).toBe('krishna')
})

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

