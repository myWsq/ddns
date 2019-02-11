import AliyunDnsService from './service/AliyunDnsService';
import 'reflect-metadata';
import { createConnection, getManager } from 'typeorm';
import { Provider } from './entity/Provider';
import server from './server/app';

async function main() {
	await createConnection();
	// const entityManager = getManager();
	// const providers = await entityManager.find(Provider, {
	// 	where: { type: 'aliyun' },
	// 	relations: [
	// 		'domains',
	// 	],
	// });
	// providers.forEach((item) => {
	// 	const aliyunService = new AliyunDnsService(item);
	// 	connectionPoolSerivce.push(aliyunService)
	// });

	await server.start({ port: 4004 });

	console.log('Server is running on http://localhost:4004');
	
}

main();
