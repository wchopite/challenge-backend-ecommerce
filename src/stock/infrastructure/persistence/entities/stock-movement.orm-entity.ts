import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Motive } from '../../../domain/motive/motive.js';

@Entity('stock_movements')
export class StockMovementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id' })
  variantId: string;

  @Column()
  sku: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar' })
  motive: Motive;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;
}
