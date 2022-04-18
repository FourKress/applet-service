import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { NoAuth } from '../common/decorators/no-auth.decorator';
import { User } from './schemas/user.schema';
import { ModifyUserDto } from './dto/modify-user.dto';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('findAll')
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @NoAuth()
  @Get('findOneByOpenId')
  async findOneByOpenId(@Query('openId') openId: string): Promise<User> {
    return await this.usersService.findOneByOpenId(openId);
  }

  @Get('findOneById')
  async findOneById(
    @Request() req,
    @Query('userId') userId?: string,
  ): Promise<User> {
    const tokenInfo: UserEntity = req.user;
    return await this.usersService.findOneById(userId || tokenInfo.userId);
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(
    @Request() req,
    @Body() modifyUser: ModifyUserDto,
  ): Promise<User> {
    const tokenInfo: UserEntity = req.user;
    return await this.usersService.modify(
      Object.assign({}, modifyUser, {
        id: tokenInfo.userId,
      }),
    );
  }

  @Post('setBoss')
  @HttpCode(HttpStatus.OK)
  async setBoss(@Body('id', new ValidationIDPipe()) id: string): Promise<User> {
    return await this.usersService.setBoss(id);
  }

  @Post('findBossList')
  @HttpCode(HttpStatus.OK)
  async findBossList(): Promise<User[]> {
    return await this.usersService.findBossList();
  }

  @Post('findUserList')
  @HttpCode(HttpStatus.OK)
  async findUserList(@Body() params): Promise<User[]> {
    return await this.usersService.findUserList(params);
  }

  @Post('changeBossStatus')
  @HttpCode(HttpStatus.OK)
  async changeBossStatus(@Body() params: any): Promise<User> {
    return await this.usersService.changeBossStatus(params);
  }

  @Get('applyForBoss')
  async applyForBoss(@Request() req): Promise<User> {
    const tokenInfo: UserEntity = req.user;
    return await this.usersService.applyForBoss(tokenInfo.userId);
  }

  @Post('changeApplyForBoss')
  @HttpCode(HttpStatus.OK)
  async changeApplyForBoss(@Body() params: any): Promise<User> {
    return await this.usersService.changeApplyForBoss(params);
  }
}
