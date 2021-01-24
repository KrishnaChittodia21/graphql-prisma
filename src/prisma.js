import  { Prisma } from 'prisma-binding';

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint:'http://localhost:4466',
});

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

// prisma.mutation.createPost({
//   data: {
//     title: 'test user is active',
//     body: 'test user body',
//     published: true,
//     author: {
//       connect: {
//         id: "ckk9o9d9g00ef0912h0si59ls"
//       }
//     }
//   }
// }, '{ id title body published }').then((data) => {
//   console.log(JSON.stringify(data, undefined, 2));
// }).catch((err) => {
//   console.log(err)
// })

prisma.mutation.updatePost({
  where: {
    id: "ckkacqs7e01i909126hzijvj4"
  },
  data: {
    body: "body number 1",
    published: true
  },
}, '{ id }').then((data) => {
  return prisma.query.posts(null, '{ id title body published }').then((postData) => {
    console.log(JSON.stringify(postData, undefined, 2));
  })
}).catch((err) => {
  console.log(err)
})
