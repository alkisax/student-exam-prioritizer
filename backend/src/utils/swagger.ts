// // import m2s from 'mongoose-to-swagger'
// import swaggerJsdoc from 'swagger-jsdoc';
// import yaml from 'yamljs';
// import path from 'path';
// // import Todo from '../todo/todo.model'

// const todoRoutesDocs = yaml.load(
//   path.join(__dirname, 'swaggerRoutes', 'todoRoutes.swagger.yml' )
// )

// const options = {
//   definition: {
//     openapi: '3.1.0',
//     info: {
//       version: '1.0.0',
//       title: 'todo',
//       description: 'basic todo with node',
//     },
//     components: {
//       schemas: {
//         // Todo: m2s(Todo),
//       },
//       // securitySchemes: {
//       //   bearerAuth: {
//       //     type: 'http',
//       //     scheme: 'bearer',
//       //     bearerFormat: 'JWT'
//       //   }
//       // }
//     },
//     // security: [{ bearerAuth: [] }],
//     paths: {
//       ...todoRoutesDocs.paths,
//     },
//   },
//   apis: []
// };

// const swaggerSpec = swaggerJsdoc(options)
// export default swaggerSpec