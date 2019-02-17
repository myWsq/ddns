import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Domain } from './Domain';
import { Log } from './Log';

@Entity()
export class Provider extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;
	@Column() type: string;
	@Column() accessKeyId: string;
	@Column() accessKeySecret: string;
	@OneToMany((type) => Domain, (domain) => domain.provider, { cascade: true })
	domains: Domain[];
	@OneToMany((type) => Log, (log) => log.provider, { cascade: true })
	logs: Log[];
	@Column({ default: 300000 })
	delay: number;
	@Column({ default: false })
	valid: boolean;
	isRunning: boolean = false;
}
