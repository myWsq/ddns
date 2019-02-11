import { DnsService } from "./DnsService";

interface ConnectionStore {
	[key: number]: DnsService;
}

/** 公共的连接池, 统一管理正在运行的provider进程 */
export class ConnectionPoolService {
	constructor() {}
	public store: ConnectionStore = {};

	push(dnsService: DnsService) {
		const cur = this.store[dnsService.config.id];
		try {
			if (!cur) {
				dnsService.run();
				this.store[dnsService.config.id] = dnsService;
			}
		} catch (error) {}
	}

	remove(id: number) {
		const provider = this.store[id];
		try {
			provider.shutdown();
			delete this.store[id];
			return provider;
		} catch (error) {}
	}

	restart(id: number) {
		const provider = this.remove(id);
		this.push(provider);
	}

	isRunning(id: number) {
		return !!this.store[id];
	}
}

const connectionPoolSerivce = new ConnectionPoolService();

export default connectionPoolSerivce;
