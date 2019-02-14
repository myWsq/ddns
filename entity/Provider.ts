import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Domain } from './Domain';

@Entity()
export class Provider extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;
	@Column() type: string;
	@Column() accessKeyId: string;
	@Column() accessKeySecret: string;
	@OneToMany((type) => Domain, (domain) => domain.provider, { eager: true })
	domains: Domain[];
	@Column({ default: 300000 })
	delay: number;
	@Column({ default: false })
	valid: boolean;
	isRunning: boolean = false;
}
