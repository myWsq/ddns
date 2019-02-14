import { Provider } from '../entity/Provider';
import { getPubIp } from './IpService';
import { pushService, removeService } from './ConnectionPoolService';

export interface DomainRecordInterface {
	Value: string /** 记录值 */;
	RecordId: string /** 唯一ID */;
}
/** 重新尝试请求的次数 */
const MAX_RETRY_TIMES = 100;

/** 重新尝试验证有效请次数 */
const MAX_INVALID_RETRY_TIMES = 10;

export class DnsService {
	constructor(public readonly config: Provider) {}

	private intervalID: NodeJS.Timeout;
	private inValidRetryTimes = 0;
	private retryTimes = 0;

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

	validate(): Promise<boolean> {
		throw new Error('You must rewrite this function');
	}

	async run() {
		/** 写入公共连接池 */
		await pushService(this);

		/** 如果ID重复先关闭一个 */
		if (this.intervalID) {
			this.shutdown();
		}

		/** 验证信息有效性 */
		this.config.valid = await this.validate();
		await this.config.save();

		/** 开启定时器 */
		this.intervalID = setInterval(async () => {
			try {
				/** 首先验证信息是否有效 */
				if (await this.validate()) {
					await this.config.reload();
					/** 获取当前公网IP */
					const pubIp = await getPubIp();
					if (pubIp) {
						/** 获取用户配置的记录值列表, 如果某个域名已经配置过, 则对应项不为空 */
						const recordList = await this.getDomainRecords();
						recordList.forEach((item, index) => {
							/** 此域名已存在, 更新域名记录值 */
							if (item && item.Value !== pubIp) {
								this.updateDomainRecord(item.RecordId, this.config.domains[index].rr, pubIp);
							/** 域名不存在, 新增一条记录 */
							} else if (!item) {
								this.createDomainRecord(
									this.config.domains[index].name,
									this.config.domains[index].rr,
									pubIp
								);
							}
						});
					}
					/** 正常则清空尝试次数 */
					this.inValidRetryTimes = 0;
					this.retryTimes = 0;
				/** 如果无效则重新尝试 */
				} else if (this.inValidRetryTimes <= MAX_INVALID_RETRY_TIMES) {
					console.log(
						`Invalid Provider [${this.config.id}] ... retry ${this
							.inValidRetryTimes}/${MAX_INVALID_RETRY_TIMES}`
					);
					this.inValidRetryTimes++;
				/** 超过最大尝试次数停止 */
				} else {
					this.config.valid = false;
					await this.config.save();
					this.shutdown();
				}
			/** 防止意外发生挂起, 设置总的异常重试处理 */
			} catch (error) {
				if (this.retryTimes <= MAX_RETRY_TIMES) {
					this.retryTimes++;
				} else {
					this.shutdown();
				}
			}
		}, this.config.delay);

		console.log(`DnsService [${this.config.id}] start`);
	}

	shutdown() {
		if (this.intervalID) {
			clearInterval(this.intervalID);
			this.intervalID = undefined;
			removeService(this.config.id);
			console.log(`DnsService [${this.config.id}] stop`);
		}
	}
}
