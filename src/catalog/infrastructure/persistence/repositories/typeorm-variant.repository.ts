import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { Variant } from '../../../domain/models/variant.js';
import type { VariantRepository } from '../../../domain/ports/out/variant.repository.js';
import { VariantOrmEntity } from '../entities/variant.orm-entity.js';
import { VariantMapper } from '../mappers/variant.mapper.js';

@Injectable()
export class TypeOrmVariantRepository implements VariantRepository {
  constructor(
    @InjectRepository(VariantOrmEntity)
    private readonly repository: Repository<VariantOrmEntity>,
  ) {}

  async findById(id: string): Promise<Variant | null> {
    const record = await this.repository.findOneBy({ id });
    return record === null ? null : VariantMapper.toDomain(record);
  }

  async findBySku(sku: string): Promise<Variant | null> {
    const record = await this.repository.findOneBy({ sku });
    return record === null ? null : VariantMapper.toDomain(record);
  }
}
