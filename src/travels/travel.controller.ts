import { Controller, Get } from '@nestjs/common';
import { TravelService } from './travel.service';

@Controller('travels')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Get('/hello/')
  getHello(): string {
    return this.travelService.getHello();
  }
}
