import { AliyunConfigInterface } from '../config';
import * as Core from '@alicloud/pop-core';
import { getPubIp } from './ipService';
import { isIP } from 'net';

const API_ENDPOINT = 'https://alidns.aliyuncs.com';
const API_VERSION = '2015-01-09';
const REFRESH_DELAY = 300 * 1000;

export interface DomainRecordInterface {
	RR: string /** 解析值 */;
	Status: 'ENABLE' | 'DISABLE' /** 解析状态 */;
	Value: string /** 记录值 */;
	Weight: number /** 权重 */;
	RecordId: string /** 唯一ID */;
	Type: string /** 记录类型 */;
	DomainName: string /** 当前域名 */;
	Locked: false /** 解析记录锁定状态 */;
	Line: string /** 解析线路 */;
	TTL: 600 /** 生存时间 */;
}

export default class AliyunDnsService {
	constructor(private readonly config: AliyunConfigInterface) {
		/** 初始化请求客户端实例 */
		this.instance = new Core({
			accessKeyId: config.accessKeyId,
			accessKeySecret: config.accessKeySecret,
			endpoint: API_ENDPOINT,
			apiVersion: API_VERSION,
		});
	}

	instance: Core;
	intervalID: NodeJS.Timeout;

	/** 获得当前的解析对 */
	async getDomainRecords() {
		/** 组合请求, 查询所有的配置项中的域名信息 */
		const requests = await Promise.all(
			this.config.domains.map((item) =>
				(async () => {
					const { DomainRecords } = await this.instance.request('DescribeDomainRecords', {
						DomainName: item.domainName,
						RRKeyWord: item.rr,
						Type: 'A',
					});
					const record = DomainRecords.Record.filter(
						(record: DomainRecordInterface) => record.RR === item.rr
					)[0] as DomainRecordInterface;
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
			return await this.instance.request('AddDomainRecord', params);
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

			return await this.instance.request('UpdateDomainRecord', params);
		}
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
						this.createDomainRecord(
							this.config.domains[index].domainName,
							this.config.domains[index].rr,
							pubIp
						);
					}
				});
			}
		}, REFRESH_DELAY);
	}

	shutdown() {
		if (this.intervalID) {
			clearInterval(this.intervalID);
			this.intervalID = undefined;
		}
	}
}
