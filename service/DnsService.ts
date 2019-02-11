import { Provider } from '../entity/Provider';
import { getPubIp } from './IpService';

export interface DomainRecordInterface {
	Value: string /** 记录值 */;
	RecordId: string /** 唯一ID */;
}
export class DnsService {
	constructor(public readonly config: Provider) {}

	intervalID: NodeJS.Timeout;

	getDomainRecords(): Promise<DomainRecordInterface[]> {
		throw new Error('You must rewrite this function');
	}

	/**
     * 新增解析记录
     * @param domainName 域名
     * @param rr 解析值
     * @param value 记录值
     */
	createDomainRecord(domainName: string, rr: string, value: string): Promise<DomainRecordInterface> {
		throw new Error('You must rewrite this function');
	}

	/**
     * 更新解析记录
     * @param recordId 解析记录的ID
     * @param rr 解析值
     * @param value 记录值
     */
	updateDomainRecord(recordId: string, rr: string, value: string): Promise<DomainRecordInterface> {
		throw new Error('You must rewrite this function');
	}

	run() {
		if (this.intervalID) {
			this.shutdown();
		}
		this.intervalID = setInterval(async () => {
			const pubIp = await getPubIp();
			if (pubIp) {
				const recordList = await this.getDomainRecords();
				recordList.forEach((item, index) => {
					if (item && item.Value !== pubIp) {
						this.updateDomainRecord(item.RecordId, this.config.domains[index].rr, pubIp);
					} else if (!item) {
						this.createDomainRecord(this.config.domains[index].name, this.config.domains[index].rr, pubIp);
					}
				});
			}
		}, this.config.delay);
		console.log(`DnsService [${this.config.id}] start`);
	}

	shutdown() {
		if (this.intervalID) {
			clearInterval(this.intervalID);
			this.intervalID = undefined;
			console.log(`DnsService [${this.config.id}] stop`);
		}
	}
}
