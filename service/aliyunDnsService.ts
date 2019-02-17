import * as Core from '@alicloud/pop-core';
import { isIP } from 'net';
import { Provider } from '../entity/Provider';
import { DnsService, DomainRecordInterface } from './DnsService';
import { Log } from '../entity/Log';

const API_ENDPOINT = 'https://alidns.aliyuncs.com';
const API_VERSION = '2015-01-09';

export interface AliyunDomainRecordInterface extends DomainRecordInterface {
	RR: string /** 解析值 */;
	Status: 'ENABLE' | 'DISABLE' /** 解析状态 */;
	Weight: number /** 权重 */;
	Type: string /** 记录类型 */;
	DomainName: string /** 当前域名 */;
	Locked: false /** 解析记录锁定状态 */;
	Line: string /** 解析线路 */;
	TTL: 600 /** 生存时间 */;
}

export default class AliyunDnsService extends DnsService {
	constructor(public readonly config: Provider) {
		super(config);
		/** 初始化请求客户端实例 */
		this.instance = new Core({
			accessKeyId: config.accessKeyId,
			accessKeySecret: config.accessKeySecret,
			endpoint: API_ENDPOINT,
			apiVersion: API_VERSION,
		});
	}

	instance: Core;

	/** 获得当前的解析对 */
	async getDomainRecords() {
		await this.config.reload();
		/** 组合请求, 查询所有的配置项中的域名信息 */
		const requests = await Promise.all(
			this.config.domains.map((item) =>
				(async () => {
					const { DomainRecords } = await this.instance.request('DescribeDomainRecords', {
						DomainName: item.name,
						RRKeyWord: item.rr,
						Type: 'A',
					});
					const record = DomainRecords.Record.filter(
						(record: AliyunDomainRecordInterface) => record.RR === item.rr
					)[0] as AliyunDomainRecordInterface;
					return record;
				})()
			)
		);

		return requests;
	}

	/**
     * 新增解析记录
     * @param domainName 域名
     * @param rr 解析值
     * @param value 记录值
     */
	async createDomainRecord(domainName: string, rr: string, value: string) {
		if (isIP(value)) {
			const params = {
				DomainName: domainName,
				RR: rr,
				Type: 'A',
				Value: value,
			};
			return (await this.instance.request('AddDomainRecord', params)) as AliyunDomainRecordInterface;
		}
	}
	/**
     * 更新解析记录
     * @param recordId 解析记录的ID
     * @param rr 解析值
     * @param value 记录值
     */
	async updateDomainRecord(recordId: string, rr: string, value: string) {
		if (isIP(value)) {
			const params = {
				RecordId: recordId,
				RR: rr,
				Type: 'A',
				Value: value,
			};

			return (await this.instance.request('UpdateDomainRecord', params)) as AliyunDomainRecordInterface;
		}
	}

	async validate() {
		try {
			await this.instance.request('DescribeDomains', {});
			Log.add(this.config.id, `[${this.config.type}] Provider [${this.config.id}] validate successful.`);
			return true;
		} catch (error) {
			Log.add(this.config.id, `[${this.config.type}] Provider [${this.config.id}] validate failed, ${error}.`);
			return false;
		}
	}
}
