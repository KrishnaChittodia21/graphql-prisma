import bcrypt from 'bcryptjs';
import prisma from '../../src/prisma';

const userOne = {
  input: {
    name: 'krishna',
    email: 'krishna@krishna.com',
    password: bcrypt.hashSync('k1234!@#$')
  },
  user: undefined
}

const postOne = {
  input: {
    title: 'My post 101',
    body: '',
    published: true
  },
  post: undefined
}

const seedDatabase = async () => {
  jest.setTimeout(5000);
  await prisma.mutation.deleteManyPosts();
  await prisma.mutation.deleteManyUsers();
  userOne.user = await prisma.mutation.createUser({
    data: userOne.input
  })
  await prisma.mutation.createPost({
    data: {
      title: 'My published post',
      body: '',
      published: true,
      author: {
        connect: {
          id: userOne.user.id,
        }
      }
    }
  })
  postOne.post = await prisma.mutation.createPost({
    data: {
      ...postOne.input,
      author: {
        connect: {
          id: userOne.user.id,
        }
      }
    }
  })
};

export { seedDatabase as default, postOne, userOne };