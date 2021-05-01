import bcrypt from 'bcryptjs';
import prisma from '../../src/prisma';

const seedDatabase = async () => {
  jest.setTimeout(5000);
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
};

export default seedDatabase;