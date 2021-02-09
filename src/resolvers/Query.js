import getUserId from '../utils/getUserId';

const Query = {
  users(parent, args, { prisma }, info) {
    const opArgs = {};
    if(args.query) {
      opArgs.where = {
        OR: [{
          name_contains: args.query,
        }, {
          email_contains: args.query
        }]
      }
    }

    return prisma.query.users(opArgs, info)
  },
  posts(parent, args, { prisma }, info) {
    const opArgs = {
      where: {
        published: true
      }
    };
    if(args.query) {
      opArgs.where.OR = [{
        title_contains: args.query,
      }, {
        body_contains: args.query
      }]
    }
    return prisma.query.posts(opArgs, info);
  },
  async post(parent, args, {  prisma, request }, info) {
    const userId = getUserId(request, false);

    const posts = await prisma.query.posts({
      where: {
        id: args.id,
        OR: [{
          published: false,
        }, {
          author: {
            id: userId
          }
        }]
      }
    }, info);

    if(posts.length === 0) {
      throw new Error('post not found');
    }

    return posts[0]
  },
  comments(parents, args, { prisma }, info) {
    return prisma.query.comments(null, info)
  },
  me(parent, args, { prisma, request }, info) {
    const userId = getUserId(request);

    return prisma.query.user({
      where: {
        id: userId,
      }
    })
  },
  myPosts(parents, args, {prisma, request }, info) {
    const userId = getUserId(request);

    const opArgs = {
      where: {
        author: {
          id: userId,
        }
      }
    }
    if(args.query) {
      opArgs.where.OR = [{
        title_contains: args.query,
      }, {
        body_contains: args.query
      }]
    }
    return prisma.query.posts(opArgs, info)
  }
}

export { Query as default};