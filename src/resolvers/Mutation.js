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
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    return prisma.mutation.updateUser({ data: args.data, where: {
      id: userId
    }}, info)
  },
  async updatePost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })
    if(!postExists){
      throw new Error('No post found')
    }
    return prisma.mutation.updatePost({ data: args.data, where: {
      id: args.id
    }}, info)
  },
  async updateComment(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: userId
    })
    if(!commentExists) {
      throw new Error('Comment does not exists')
    }
    return prisma.mutation.updateComment({
      data: args.data,
      where: {
        id: args.id
      }
    }, info)
  },
  async createComment(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    return prisma.mutation.createComment({
      data: {
        text: args.data.text,
        author: {
          connect: {
            id: userId
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
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    
    return prisma.mutation.deleteUser({
      where: {
        id: userId
      }
    }, info)
  },
  async deletePost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })
    if(!postExists){
      throw new Error('No post found')
    }
    return prisma.mutation.deletePost({ where: {
      id: args.id }
    }, info)
  },
  async deleteComment(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);
    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: userId
    })
    if(!commentExists) {
      throw new Error('Comment does not exists')
    }
    return prisma.mutation.deleteComment({ where: {
       id: args.id }}, info)
  }
}

export { Mutation as default }