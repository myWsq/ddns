import { validateSecretKey, setSecretKey } from '../../service/configService';


export default {
	Mutation: {
		async validateSecretKey(_, { secretKey }) {
			return await validateSecretKey(secretKey);
		},
		async setSecretKey(_, arg: { old: string; new: string }) {
			if (!await validateSecretKey(arg.old)) {
				throw new Error('Invalid old secret key');
			}

			if (!arg.new) {
				throw new Error('Invalid new secret key');
			}
			await setSecretKey(arg.new);
			return arg.new;
		},
	},
};
