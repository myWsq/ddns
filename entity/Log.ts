import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, getManager } from 'typeorm';
import { Provider } from './Provider';

@Entity()
export class Log extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;
	@Column() info: string;
	@ManyToOne((type) => Provider, (provider) => provider.logs)
	provider: Provider;
	@CreateDateColumn() createdAt: Date;

	/** 添加一条日志 */
	static async add(providerId: number, info: string) {
		const manager = getManager();
		const log = manager.create(Log, { provider: { id: providerId }, info });
		return await log.save();
	}

	static async deleteAll(providerId: number) {
		return await Log.delete({ provider: { id: providerId } });
	}
}
