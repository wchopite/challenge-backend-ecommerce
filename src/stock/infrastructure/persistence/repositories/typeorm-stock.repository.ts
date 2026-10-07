import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, type Repository } from 'typeorm';
import {
  MovementStatus,
  type RegisterMovementOutcome,
} from '../../../domain/models/register-movement-outcome.js';
import type { StockMovement } from '../../../domain/models/stock-movement.js';
import { Direction, directionOf } from '../../../domain/motive/motive.js';
import type { StockRepository } from '../../../domain/ports/out/stock.repository.js';
import { StockItemOrmEntity } from '../entities/stock-item.orm-entity.js';
import { StockMovementOrmEntity } from '../entities/stock-movement.orm-entity.js';
import { StockMovementMapper } from '../mappers/stock-movement.mapper.js';

@Injectable()
export class TypeOrmStockRepository implements StockRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(StockItemOrmEntity)
    private readonly items: Repository<StockItemOrmEntity>,
  ) {}

  async register(
    movement: StockMovement,
    idempotencyKey: string,
  ): Promise<RegisterMovementOutcome> {
    return this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .insert()
        .into(StockItemOrmEntity)
        .values({ variantId: movement.variantId, available: 0 })
        .orIgnore()
        .execute();

      if (directionOf(movement.motive) === Direction.OUT) {
        const result = await manager
          .createQueryBuilder()
          .update(StockItemOrmEntity)
          .set({ available: () => 'available - :quantity' })
          .where('variant_id = :variantId', { variantId: movement.variantId })
          .andWhere('available >= :quantity')
          .setParameter('quantity', movement.quantity)
          .execute();

        if (result.affected === 0) {
          const current = await manager.findOne(StockItemOrmEntity, {
            where: { variantId: movement.variantId },
          });
          return { status: MovementStatus.INSUFFICIENT, available: current?.available ?? 0 };
        }
      } else {
        await manager
          .createQueryBuilder()
          .update(StockItemOrmEntity)
          .set({ available: () => 'available + :quantity' })
          .where('variant_id = :variantId', { variantId: movement.variantId })
          .setParameter('quantity', movement.quantity)
          .execute();
      }

      await manager.insert(
        StockMovementOrmEntity,
        StockMovementMapper.toOrm(movement, idempotencyKey),
      );

      const item = await manager.findOne(StockItemOrmEntity, {
        where: { variantId: movement.variantId },
      });

      return { status: MovementStatus.APPLIED, available: item?.available ?? 0 };
    });
  }

  async getAvailable(variantId: string): Promise<number> {
    const item = await this.items.findOne({ where: { variantId } });
    return item?.available ?? 0;
  }
}
