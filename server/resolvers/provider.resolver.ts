import { Provider } from '../../entity/Provider';
import AliyunDnsService from '../../service/AliyunDnsService';
import { getManager } from 'typeorm';
import { DnsService } from '../../service/DnsService';
import { isServiceRunning, getService } from '../../service/ConnectionPoolService';

export default {
	Query: {
		async providers() {
			return await Provider.find();
		},
	},
	Provider: {
		async isRunning(provider: Provider) {
			return await isServiceRunning(provider.id);
		},
	},
	Mutation: {
		async startProvider(_, arg: { id: number }) {
			const provider = await Provider.findOneOrFail(arg.id);
			let dnsService: DnsService = undefined;
			if (provider.type === 'aliyun') {
				dnsService = new AliyunDnsService(provider);
			}

			if (dnsService) {
				const isRunning = await isServiceRunning(provider.id);

				if (isRunning) {
					throw new Error(`The DnsService ${dnsService.config.id} is already running.`);
				} else {
					await dnsService.run();
					return provider;
				}
			} else {
				throw new Error('There is no matching DnsService');
			}
		},
		async stopProvider(_, arg: { id: number }) {
			const service = await getService(arg.id);
			service && service.shutdown();
			return await Provider.findOneOrFail(arg.id);
		},
		async addProvider(_, { input }) {
			const entityManager = getManager();
			return await entityManager.create(Provider, input).save();
		},
	},
};
