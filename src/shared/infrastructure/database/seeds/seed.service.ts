import type { DataSource } from 'typeorm';
import { CategoryOrmEntity } from '../../../../catalog/infrastructure/persistence/entities/category.orm-entity.js';
import { ProductOrmEntity } from '../../../../catalog/infrastructure/persistence/entities/product.orm-entity.js';
import { VariantOrmEntity } from '../../../../catalog/infrastructure/persistence/entities/variant.orm-entity.js';
import { MovementAlreadyProcessedError } from '../../../../stock/domain/errors/movement-already-processed.error.js';
import { Motive } from '../../../../stock/domain/motive/motive.js';
import type { RegisterStockMovement } from '../../../../stock/domain/ports/in/register-stock-movement.js';

const CATEGORIES = [
  { id: 'a1000000-0000-4000-8000-000000000001', name: 'Sneakers' },
  { id: 'a1000000-0000-4000-8000-000000000002', name: 'Apparel' },
];

const PRODUCTS = [
  {
    id: 'b2000000-0000-4000-8000-000000000001',
    name: 'Runner',
    description: 'Lightweight running shoe',
    priceCents: 8999900,
    categoryName: 'Sneakers',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000002',
    name: 'Trail',
    description: 'Rugged trail shoe',
    priceCents: 10999900,
    categoryName: 'Sneakers',
  },
  {
    id: 'b2000000-0000-4000-8000-000000000003',
    name: 'Hoodie',
    description: 'Warm fleece hoodie',
    priceCents: 4999900,
    categoryName: 'Apparel',
  },
];

const VARIANTS = [
  {
    id: 'c3000000-0000-4000-8000-000000000001',
    sku: 'RUN-42-BLACK',
    attributes: { size: '42', color: 'black' },
    productId: 'b2000000-0000-4000-8000-000000000001',
    initialStock: 10,
  },
  {
    id: 'c3000000-0000-4000-8000-000000000002',
    sku: 'RUN-43-BLACK',
    attributes: { size: '43', color: 'black' },
    productId: 'b2000000-0000-4000-8000-000000000001',
    initialStock: 5,
  },
  {
    id: 'c3000000-0000-4000-8000-000000000003',
    sku: 'RUN-42-WHITE',
    attributes: { size: '42', color: 'white' },
    productId: 'b2000000-0000-4000-8000-000000000001',
    initialStock: 7,
  },
  {
    id: 'c3000000-0000-4000-8000-000000000004',
    sku: 'TRAIL-42-BLACK',
    attributes: { size: '42', color: 'black' },
    productId: 'b2000000-0000-4000-8000-000000000002',
    initialStock: 4,
  },
  {
    id: 'c3000000-0000-4000-8000-000000000005',
    sku: 'HOODIE-M-BLACK',
    attributes: { size: 'M', color: 'black' },
    productId: 'b2000000-0000-4000-8000-000000000003',
    initialStock: 12,
  },
  {
    id: 'c3000000-0000-4000-8000-000000000006',
    sku: 'HOODIE-L-BLACK',
    attributes: { size: 'L', color: 'black' },
    productId: 'b2000000-0000-4000-8000-000000000003',
    initialStock: 3,
  },
];

export class SeedService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly registerMovement: RegisterStockMovement,
  ) {}

  async run(): Promise<void> {
    await this.seedCatalog();
    await this.seedStock();
  }

  private async seedCatalog(): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(CategoryOrmEntity)
      .values(CATEGORIES)
      .orIgnore()
      .execute();

    const categories = await this.dataSource.query<Array<{ id: string; name: string }>>(
      'SELECT id, name FROM categories',
    );
    const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(ProductOrmEntity)
      .values(
        PRODUCTS.map(({ categoryName, ...product }) => {
          const categoryId = categoryIdByName.get(categoryName);
          if (categoryId === undefined) {
            throw new Error(`Seed category not found: ${categoryName}`);
          }
          return { ...product, categoryId };
        }),
      )
      .orIgnore()
      .execute();

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(VariantOrmEntity)
      .values(
        VARIANTS.map(({ id, sku, attributes, productId }) => ({ id, sku, attributes, productId })),
      )
      .orIgnore()
      .execute();
  }

  private async seedStock(): Promise<void> {
    for (const variant of VARIANTS) {
      try {
        await this.registerMovement.execute({
          sku: variant.sku,
          quantity: variant.initialStock,
          motive: Motive.PURCHASE,
          idempotencyKey: `seed:initial:${variant.sku}`,
        });
      } catch (error) {
        if (!(error instanceof MovementAlreadyProcessedError)) {
          throw error;
        }
      }
    }
  }
}
