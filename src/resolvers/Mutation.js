import { v4 as uuidv4 } from 'uuid';

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const emailTaken = await prisma.exists.User({ email: args.data.email})
    if(emailTaken){
      throw new Error('Email already exists');
    }
    return prisma.mutation.createUser({ data: args.data}, info)
  },
  async createPost(parent, args, { prisma, pubsub }, info) {
    return prisma.mutation.createPost({ data: {
      title: args.data.title,
      body: args.data.body,
      published: args.data.published,
      author: {
        connect: {
          id: args.data.author
        }
      }

    }}, info);
  },
  async updateUser(parent, args, { prisma }, info) {
    return prisma.mutation.updateUser({ data: args.data, where: {
      id: args.id
    }}, info)
  },
  updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args;
    const post = db.posts.find((post) =>  post.id === id);
    const originalPost = {...post};
    if(!post) {
      throw new Error('Post does not exits');
    }
    if( typeof data.title === 'string') {
      post.title = data.title;
    }
    if( typeof data.body === 'string') {
      post.body = data.body;
    }
    if( typeof data.published === 'boolean') {
      post.published = data.published;
      if(originalPost.published && !post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost
          }
        })
      } else if(!originalPost.published && post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post
          }
        })
      }
    } else if(post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post
        }
      })
    }
    return post;
  },
  updateComment(parent, args, { db, pubsub }, info) {
    const { id, data } = args;
    const comment = db.comments.find((comment) => comment.id === id);
    if(!comment) {
      throw new Error('comment does not exists');
    }
    if(typeof data.text === 'string') {
      comment.text = data.text;
    }

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'UPDATED',
        data: comment
      }
    })
    return comment;
  },
  createComment(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some((user) => user.id === args.data.author);
    const postExistsAndPublished = db.posts.some((post) => (post.id === args.data.post && post.published));
    if(!userExists || !postExistsAndPublished) {
      throw new Error('Either User or Post does not exists');
    }
    const comment = {
      id: uuidv4(),
      ...args.data
    }
    db.comments.push(comment);
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment
      }
     })
    return comment;
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
  deletePost(parent, args, { db, pubsub }, info) {
    const postIndex = db.posts.findIndex((post) => post.id === args.id);
    if(postIndex === -1) {
      throw new Error("post does not exists");
    }
    const [post] = db.posts.splice(postIndex, 1);
    db.comments = db.comments.filter((comment) => comment.post !== args.id);
    if(post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post
        }
      })
    }
    return post;
  },
  deleteComment(parent, args, { db, pubsub }, info) {
    const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);
    if(commentIndex === -1) {
      throw new Error('Comment does not exists');
    }
    const [deletedComment] = db.comments.splice(commentIndex, 1);
    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment
      }
    })
    return deletedComment;
  }
}

export { Mutation as default }