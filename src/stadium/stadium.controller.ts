import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  HttpStatus,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StadiumService } from './stadium.service';
import { NoAuth } from '../common/decorators/no-auth.decorator';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { Stadium } from './schemas/stadium.schema';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { ModifyStadiumDto } from './dto/modify-stadium.dto';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @Get('list')
  async findAll(): Promise<Stadium[]> {
    return await this.stadiumService.findAll();
  }

  @Post('adminList')
  @HttpCode(HttpStatus.OK)
  async adminList(@Body() params): Promise<Stadium[]> {
    return await this.stadiumService.adminList(params);
  }

  @NoAuth()
  @Get('info')
  async info(
    @Query('id', new ValidationIDPipe()) stadiumId: string,
  ): Promise<Stadium> {
    return await this.stadiumService.findById(stadiumId);
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(@Body() modifyStadium: ModifyStadiumDto): Promise<Stadium> {
    return await this.stadiumService.modify(modifyStadium);
  }

  @NoAuth()
  @Post('modifyWxGroupName')
  @HttpCode(HttpStatus.OK)
  async modifyWxGroupName(@Body() wxGroup): Promise<Stadium> {
    return await this.stadiumService.modifyWxGroupName(wxGroup);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(@Body() addStadium: CreateStadiumDto): Promise<Stadium> {
    return await this.stadiumService.add(addStadium);
  }

  @Get('stadiumList')
  async stadiumList(@Request() req): Promise<Stadium[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.stadiumService.findByBossId(tokenInfo.bossId);
  }

  @NoAuth()
  @Post('waitStartList')
  @HttpCode(HttpStatus.OK)
  async waitStartList(@Body() params): Promise<Stadium[]> {
    return await this.stadiumService.waitStartList(params?.userId, params);
  }

  @Post('uploadFile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadFile(@Request() req, @UploadedFiles() files): any {
    const tokenInfo: UserEntity = req.user;
    return this.stadiumService.uploadFile(files, tokenInfo.openId);
  }

  @NoAuth()
  @Post('findByName')
  @HttpCode(HttpStatus.OK)
  async findByName(@Body() params): Promise<Stadium[]> {
    return await this.stadiumService.findByName(params.stadiumName);
  }

  @Post('remove')
  @HttpCode(HttpStatus.OK)
  async remove(@Body() params: any): Promise<boolean> {
    return await this.stadiumService.remove(params);
  }

  @Post('changeBotStatus')
  @HttpCode(HttpStatus.OK)
  changeBotStatus(@Body() params): any {
    return this.stadiumService.changeBotStatus(params);
  }

  @Post('modifyNotice')
  @HttpCode(HttpStatus.OK)
  modifyNotice(@Body() params): Promise<Stadium> {
    return this.stadiumService.modifyNotice(params);
  }

  @Get('getNoticeInfo')
  getNoticeInfo(
    @Query('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<Stadium> {
    return this.stadiumService.getNoticeInfo(stadiumId);
  }

  @Post('addManagerInvite')
  @HttpCode(HttpStatus.OK)
  addManagerInvite(
    @Request() req,
    @Body('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<string> {
    const tokenInfo: UserEntity = req.user;
    return this.stadiumService.addManagerInvite(stadiumId, tokenInfo.bossId);
  }

  @NoAuth()
  @Get('getManagerInvite')
  getManagerInvite(
    @Query('inviteId', new ValidationIDPipe()) inviteId: string,
  ): Promise<Stadium> {
    return this.stadiumService.getManagerInvite(inviteId);
  }
}
