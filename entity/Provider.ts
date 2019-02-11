import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Domain } from './Domain';
import connectionPoolSerivce from '../service/ConnectionPoolService';

@Entity()
export class Provider extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;
	@Column({
		enum: [
			'aliyun',
		],
	})
	type: 'aliyun';
	@Column() accessKeyId: string;
	@Column() accessKeySecret: string;
	@OneToMany((type) => Domain, (domain) => domain.provider, { eager: true })
	domains: Domain[];
	@Column({ default: 300000 })
	delay: number;
	get isRunning() {
		if (this.id) {
			return connectionPoolSerivce.isRunning(this.id);
		} else {
			return false;
		}
	}
}
