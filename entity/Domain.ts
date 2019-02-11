import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Provider } from './Provider';

@Entity()
export class Domain extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;
	@Column() name: string;
	@Column() rr: string;
	@ManyToOne((type) => Provider, (provider) => provider.domains)
	provider: Provider;
}
