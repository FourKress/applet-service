import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Query,
} from '@nestjs/common';
import { RefundRuleService } from './refundRule.service';
import { RefundRule } from './schemas/space.schema';
import { CreateRefundRuleDto } from './dto/create-refundRule.dto';
import { query } from 'express';

@Controller('refundRule')
export class RefundRuleController {
  constructor(private readonly refundRuleService: RefundRuleService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createRules(
    @Body() createRules: CreateRefundRuleDto,
  ): Promise<RefundRule> {
    return await this.refundRuleService.createRules(createRules);
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modifyRules(@Body() modifyRules): Promise<RefundRule> {
    return await this.refundRuleService.modifyRules(modifyRules);
  }

  @Post('close')
  @HttpCode(HttpStatus.OK)
  async closeRules(@Body('id') id): Promise<RefundRule> {
    return await this.refundRuleService.closeRules(id);
  }

  @Post('checkByStadium')
  @HttpCode(HttpStatus.OK)
  async checkByStadium(@Body('stadiumId') stadiumId): Promise<RefundRule> {
    return await this.refundRuleService.checkByStadium(stadiumId);
  }
}
