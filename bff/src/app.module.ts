import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PoliciesModule } from './policies/policies.module';

@Module({
  imports: [PoliciesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
