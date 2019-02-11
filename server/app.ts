import { GraphQLServer } from 'graphql-yoga';

import * as path from "path";
import { fileLoader, mergeTypes } from "merge-graphql-schemas";

/** 统一处理resolver与typedef */
const typesArray = fileLoader(path.join(__dirname, "typeDefs/*.typedef.graphql"));
const typeDefs = mergeTypes(typesArray);
const resolvers = fileLoader(path.join(__dirname, './resolvers/*.resolver.ts'))

const server = new GraphQLServer({
    typeDefs,
    resolvers
})


export default server;

