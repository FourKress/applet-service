import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { WxGroupService } from './wxGroup.service';
import { WxGroup } from './schemas/wxGroup.schema';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('wxGroup')
export class WxGroupController {
  constructor(private readonly wxGroupService: WxGroupService) {}

  @NoAuth()
  @Get('list')
  async wxGroupList(): Promise<WxGroup[]> {
    return this.wxGroupService.findAll();
  }

  @NoAuth()
  @Post('add')
  @HttpCode(HttpStatus.OK)
  async wxGroupAdd(@Body() params): Promise<WxGroup> {
    return this.wxGroupService.add(params);
  }

  @NoAuth()
  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async wxGroupModify(@Body() params): Promise<WxGroup> {
    return this.wxGroupService.modify(params);
  }
}
