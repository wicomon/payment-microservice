import { Controller, Get } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {

  @Get()
  healthCheck() {
    return 'Payments MS is up and running!';
  }
}