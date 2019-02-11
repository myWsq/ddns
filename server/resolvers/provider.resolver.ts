import { Provider } from '../../entity/Provider';
import connectionPoolSerivce from '../../service/ConnectionPoolService';
import AliyunDnsService from '../../service/AliyunDnsService';

export default {
	Query: {
		async providers() {
			return await Provider.find();
		},
	},
	Mutation: {
		async startProvider(_, arg: { id: number }) {
			const provider = await Provider.findOneOrFail(arg.id);
			let dnsService = undefined;
			if (provider.type === 'aliyun') {
				dnsService = new AliyunDnsService(provider);
			}
			if (dnsService) {
				connectionPoolSerivce.push(dnsService);
				return provider;
			} else {
				throw new Error('There is no matching DnsService');
			}
		},
		async stopProvider(_, arg: { id: number }) {
			connectionPoolSerivce.remove(arg.id);
			return await Provider.findOneOrFail(arg.id);
		},
	},
};
