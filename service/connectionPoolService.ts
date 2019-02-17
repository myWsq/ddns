import { DnsService } from './DnsService';

/** 公共的连接池, 统一管理正在运行的provider进程 */
const STORE: {
	[key: number]: DnsService;
} = {};

export function pushService(dnsService: DnsService) {
	STORE[dnsService.config.id] = dnsService;
}

export function removeService(id: number) {
	delete STORE[id];
}

export function isServiceRunning(id: number) {
	return !!STORE[id];
}

export function getService(id: number) {
	return STORE[id];
}
