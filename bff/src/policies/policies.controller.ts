import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { Policy } from '../domain/pricing';

@Controller('api/policies')
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Get()
  findAll(): Policy[] {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: Policy): Policy {
    return this.service.create(body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): void {
    this.service.remove(id);
  }
}
