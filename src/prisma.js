import  { Prisma } from 'prisma-binding';

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint:'http://localhost:4466',
});

export{ prisma as default }

// prisma.query.users(null, '{ id name post { id title } }').then((data) => {
//   console.log(JSON.stringify(data, undefined, 2));
// }).catch((err) => {
//   console.log(err)
// })

// prisma.query.comments(null, '{ id text author { name email } post { id title } }').then((data) => {
//   console.log(JSON.stringify(data, undefined, 2));
// }).catch((err) => {
//   console.log(err)
// })

// const createPostForUser = async (authorId, data) => {
//   const checkUserExists = await prisma.exists.User({id: authorId});
//   if(!checkUserExists){
//     throw new Error('User Not found')
//   } 
//   const post = await prisma.mutation.createPost({
//     data: {
//       ...data,
//       author: {
//         connect: {
//           id: authorId,
//         }
//       }
//     }
//   }, '{ author { id name email post { id title published }} }')
//   return post.author;
// }

// createPostForUser('ckkb68nq0000u09126as7qcpl', {
//   title: 'Call of duty',
//   body: 'i love this game',
//   published: true
// }).then((user) => {
//   console.log(JSON.stringify(user, undefined, 2))
// }).catch((err) => {
//   console.log(err)
// })

// const updatePostForUser = async (postId, data) => {
//   const postExists = await prisma.exists.Post({
//     id: postId
//   })
//   if(!postExists){
//     throw new Error('post does not exists')
//   }
//   const post = await prisma.mutation.updatePost({
//     data,
//     where: {
//       id: postId
//     }
//   }, '{author { id name email post { id title published }}}')
//   return post.author;
// }

// updatePostForUser('ckkb7kaau001t0912m620zy6n', {
//   body: 'i love warzone'
// }).then((user) => {
//   console.log(JSON.stringify(user, undefined, 2))
// }).catch((err) => {
//   console.log(err)
// })
