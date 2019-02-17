import { Domain } from '../../entity/Domain';
import { Provider } from '../../entity/Provider';

interface DomainDto {
	name: string;
	rr: string;
}

export default {
	Mutation: {
		async addDomain(_, arg: { providerID: number; domain: DomainDto }) {
			const domain = new Domain();
			domain.name = arg.domain.name;
			domain.rr = arg.domain.rr;
			domain.provider = await Provider.findOneOrFail(arg.providerID);
			return await domain.save();
		},
		async deleteDomain(_, arg: { id: number }) {
			const domain = await Domain.findOneOrFail(arg.id);
			await Domain.delete(arg.id);
			return domain;
		},
		async updateDomain(_, arg: { id: number; domain: DomainDto }) {
			const domain = await Domain.findOneOrFail(arg.id);
			domain.name = arg.domain.name;
			domain.rr = arg.domain.rr;
			return await domain.save();
		},
	},
};
