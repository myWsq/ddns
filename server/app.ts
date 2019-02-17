import { GraphQLServer } from 'graphql-yoga';
import * as directiveResolvers from './directiveResolver';
import * as path from 'path';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';
import * as express from 'express';

/** 统一处理resolver与typedef */
const typesArray = fileLoader(path.join(__dirname, 'typeDefs/*.typedef.graphql'));
const typeDefs = mergeTypes(typesArray);
const resolvers = fileLoader(path.join(__dirname, './resolvers/*.resolver.ts'));

const server = new GraphQLServer({
	typeDefs,
	resolvers,
	directiveResolvers,
	context: (req) => {
		return req;
	},
});

/** 提供静态文件 */
server.express.use(express.static(__dirname + '/client'))

export default server;
