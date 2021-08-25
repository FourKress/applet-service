import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { CreateOderDto } from './dto/create-oder.dto';
import { ModifyOderDto } from './dto/modify-oder.dto';
import { OrderCountInterface } from './interfaces/order-count.interface';
import { OrderInfoInterface } from './interfaces/order-info.interface';
import { Order } from './schemas/order.schema';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  async findAll(): Promise<Order[]> {
    return await this.orderService.findAll();
  }

  @Get('listCount')
  async orderCount(@Request() req): Promise<OrderCountInterface> {
    const tokenInfo: UserEntity = req.user;
    return await this.orderService.orderCount(tokenInfo.userId);
  }

  @Get('info')
  async info(
    @Query('id', new ValidationIDPipe()) id: string,
  ): Promise<OrderInfoInterface> {
    return await this.orderService.findOrderById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('listByStatus')
  async listByStatus(
    @Request() req,
    @Body('status') status: string,
  ): Promise<Order[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.orderService.findOrderByStatus(status, tokenInfo.userId);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(@Request() req, @Body() addOrder: CreateOderDto): Promise<string> {
    const tokenInfo: UserEntity = req.user;
    return await this.orderService.addOrder({
      ...addOrder,
      userId: tokenInfo.userId,
    });
  }

  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(@Body('id', new ValidationIDPipe()) id: string): Promise<boolean> {
    return await this.orderService.orderPay(id);
  }
}
