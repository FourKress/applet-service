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
import { OrderDto } from './dto/order.dto';
import { CreateOderDto } from './dto/create-oder.dto';
import { OrderInterface } from './interfaces/order.interface';
import { OrderCountInterface } from './interfaces/order-count.interface';
import { OrderInfoInterface } from './interfaces/order-info.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  async findAll(): Promise<OrderInterface[]> {
    return await this.orderService.findAll();
  }

  @Get('listCount')
  async orderCount(@Request() req): Promise<OrderCountInterface> {
    const tokenInfo: UserEntity = req.user;
    return await this.orderService.orderCount(tokenInfo.userId);
  }

  @Get('info')
  async info(@Query() params: OrderDto): Promise<OrderInfoInterface> {
    return await this.orderService.findOrderById(params.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('listByStatus')
  async listByStatus(
    @Request() req,
    @Body() params: OrderDto,
  ): Promise<OrderInterface[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.orderService.findOrderByStatus(
      params.status,
      tokenInfo.userId,
    );
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
  async pay(@Body() payInfo: OrderInterface): Promise<boolean> {
    return await this.orderService.orderPay(payInfo);
  }
}
