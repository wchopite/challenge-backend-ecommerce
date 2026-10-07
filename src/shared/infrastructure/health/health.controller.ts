import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

const DB_PING_TIMEOUT_MS = 1500;

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (process is up)' })
  live(): { status: string } {
    return { status: 'ok' };
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe (checks the database)' })
  check(): Promise<HealthCheckResult> {
    return this.runChecks();
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe (checks the database)' })
  ready(): Promise<HealthCheckResult> {
    return this.runChecks();
  }

  private runChecks(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.database.pingCheck('database', { timeout: DB_PING_TIMEOUT_MS }),
    ]);
  }
}
