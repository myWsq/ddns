import { ContextParameters } from 'graphql-yoga/dist/types';
import { validateSecretKey } from '../service/configService';

export const auth = async (next, _, __, ctx: ContextParameters) => {
	const key = ctx.request.header('Authorization');
	if (key && (await validateSecretKey(key))) {
		next();
	} else {
		throw new Error('Forbidden Resource');
	}
};
