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
import { SuggestionsService } from './suggestions.service';
import { SuggestionsDto } from './dto/suggestions.dto';
import { Suggestions } from './schemas/suggestions.schema';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(
    @Body() suggestions: SuggestionsDto,
    @Request() req,
  ): Promise<Suggestions> {
    const tokenInfo: UserEntity = req.user;
    return await this.suggestionsService.add(suggestions, tokenInfo.userId);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Suggestions[]> {
    return await this.suggestionsService.findAll();
  }

  @Get('details')
  async info(
    @Query('id', new ValidationIDPipe()) suggestionsId: string,
  ): Promise<Suggestions> {
    return await this.suggestionsService.findById(suggestionsId);
  }

  @Post('uploadFile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 3))
  uploadFile(@Request() req, @UploadedFiles() files): any {
    const tokenInfo: UserEntity = req.user;
    return this.suggestionsService.uploadFile(files, tokenInfo.openId);
  }
}
