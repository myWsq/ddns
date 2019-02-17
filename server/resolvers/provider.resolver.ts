import { Provider } from '../../entity/Provider';
import AliyunDnsService from '../../service/AliyunDnsService';
import { getManager, createQueryBuilder } from 'typeorm';
import { DnsService } from '../../service/DnsService';
import { isServiceRunning, getService } from '../../service/ConnectionPoolService';
import { Domain } from '../../entity/Domain';
import { Log } from '../../entity/Log';

export default {
	Query: {
		async providers() {
			return await Provider.find();
		},
	},
	Provider: {
		async isRunning(provider: Provider) {
			return isServiceRunning(provider.id);
		},
		async domains(provider: Provider) {
			return Domain.find({ where: { provider: provider.id } });
		},
		async logs(provider: Provider) {
			return Log.find({ where: { provider: provider.id } });
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
				const isRunning = isServiceRunning(provider.id);

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
			const service = getService(arg.id);
			service && service.shutdown();
			return await Provider.findOneOrFail(arg.id);
		},
		async addProvider(_, { input }) {
			const entityManager = getManager();
			return await entityManager.create(Provider, input).save();
		},
		async updateProvider(_, { id, input }) {
			const provider = await Provider.preload({
				id,
				...input,
			});
			return await provider.save();
		},
	},
};
