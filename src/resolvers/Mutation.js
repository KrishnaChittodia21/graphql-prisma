import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getUserId from '../utils/getUserId';

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    if(args.data.password.length <  8) {
      throw new Error('password must le atleast 8 character long')
    }
    const password = await bcrypt.hash(args.data.password, 10)
    
    const user = await prisma.mutation.createUser({ 
      data: {
        ...args.data,
        password
      }
    })

    return {
      user,
      token: jwt.sign({ userId: user.id }, 'mysecret')
    }
  },
  async login(parent, args, { prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.data.email
      }
    });
    if(!user) {
      throw new Error('user does not exists')
    }
    const verifyPassword = await bcrypt.compare(args.data.password, user.password);
    if(!verifyPassword){
      throw new Error('invalid password')
    }
    return {
      user,
      token: jwt.sign({ userId: user.id}, 'mysecret')
    }
  },
  async createPost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    return prisma.mutation.createPost({ data: {
      title: args.data.title,
      body: args.data.body,
      published: args.data.published,
      author: {
        connect: {
          id: userId
        }
      }

    }}, info);
  },
  async updateUser(parent, args, { prisma }, info) {
    return prisma.mutation.updateUser({ data: args.data, where: {
      id: args.id
    }}, info)
  },
  async updatePost(parent, args, { prisma }, info) {
    return prisma.mutation.updatePost({ data: args.data, where: {
      id: args.id
    }}, info)
  },
  async updateComment(parent, args, { prisma }, info) {
    return prisma.mutation.updateComment({
      data: args.data,
      where: {
        id: args.id
      }
    }, info)
  },
  async createComment(parent, args, { prisma }, info) {
    return prisma.mutation.createComment({
      data: {
        text: args.data.text,
        author: {
          connect: {
            id: args.data.author
          }
        },
        post: {
          connect: {
            id: args.data.post
          }
        }
      }
    }, info)
  },
  async deleteUser(parent, args, { prisma }, info) {
    const userExists = await prisma.exists.User({ id: args.id})
    if(!userExists){
      throw new Error('User not found');
    }
    return prisma.mutation.deleteUser({
      where: {
        id: args.id
      }
    }, info)
  },
  async deletePost(parent, args, { prisma }, info) {
    return prisma.mutation.deletePost({ where: {
      id: args.id }
    }, info)
  },
  deleteComment(parent, args, { prisma }, info) {
    return prisma.mutation.deleteComment({ where: {
       id: args.id }}, info)
  }
}

export { Mutation as default }