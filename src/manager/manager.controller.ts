import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerInterfaces } from './interfaces/manager.interfaces';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post('auth')
  @HttpCode(HttpStatus.OK)
  async authManager(
    @Request() req,
    @Body() params: any,
  ): Promise<ManagerInterfaces> {
    const tokenInfo: UserEntity = req.user;
    return await this.managerService.authManager(params, tokenInfo.userId);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async getManagerList(
    @Body('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<ManagerInterfaces[]> {
    return await this.managerService.getManagerList(stadiumId);
  }

  @Get('delete')
  async deleteManager(@Query('id') id: string): Promise<any> {
    return await this.managerService.deleteManager(id);
  }
}
