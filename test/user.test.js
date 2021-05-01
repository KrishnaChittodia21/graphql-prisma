import "cross-fetch/polyfill";
import ApolloBoost, { gql } from "apollo-boost";
import prisma from '../src/prisma';
import seedDatabase from './utils/seedDatabase';
import getClient from './utils/getClient';

const client = getClient();

beforeEach(seedDatabase);

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
})

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

test('should not login with bad credentials', async () => {
  const login = gql`
    mutation {
      login (
        data: {
          email: "krishna@krishna.com",
          password: "123456789"
        }
      ){
        token
      }
    }
  `;

  await expect(client.mutate({mutation: login})).rejects.toThrow();
})

test('should not signup user with invalid password', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "d20",
          email: "k@k.com",
          password: "999999999999",
        }
      ){
        token
      }
    }
  `;
  await expect(client.mutate({mutation: createUser})).rejects.toThrow();
})

