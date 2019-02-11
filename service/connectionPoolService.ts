import { DnsService } from './DnsService';
import * as Keyv from 'keyv';

/** 公共的连接池, 统一管理正在运行的provider进程 */
const STORE = new Keyv();

export async function pushService(dnsService: DnsService) {
	await STORE.set(dnsService.config.id.toString(), dnsService);
}

export async function removeService(id: number) {
	await STORE.delete(id.toString());
}

export async function isServiceRunning(id: number) {
	return !!await STORE.get(id.toString());
}

export async function getService(id: number): Promise<DnsService> {
	return await STORE.get(id.toString());
}
