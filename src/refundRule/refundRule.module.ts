import { Module } from '@nestjs/common';
import { RefundRuleController } from './refundRule.controller';
import { RefundRuleService } from './refundRule.service';
import { RefundRuleSchema, RefundRule } from './schemas/space.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefundRule.name, schema: RefundRuleSchema },
    ]),
  ],
  controllers: [RefundRuleController],
  providers: [RefundRuleService],
  exports: [RefundRuleService],
})
export class RefundRuleModule {}
