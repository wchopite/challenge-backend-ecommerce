import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Motive } from '../../../domain/motive/motive.js';

@Entity('stock_movements')
export class StockMovementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column()
  sku: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar' })
  motive: Motive;

  @Column({ name: 'idempotency_key', type: 'varchar', nullable: true, unique: true })
  idempotencyKey: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;
}
