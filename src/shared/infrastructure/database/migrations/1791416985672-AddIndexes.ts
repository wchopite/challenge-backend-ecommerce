import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIndexes1791416985672 implements MigrationInterface {
  name = 'AddIndexes1791416985672';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_products_category_id" ON "products" ("category_id")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_variants_product_id" ON "variants" ("product_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_variants_product_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_category_id"`);
  }
}
