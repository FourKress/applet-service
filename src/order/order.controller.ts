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
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { OrderDto } from './dto/order.dto';
import { CreateOderDto } from './dto/create-oder.dto';
import { OrderInterface } from './interfaces/order.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  async findAll(): Promise<IResponse> {
    const orders = await this.orderService.findAll();
    return new ResponseSuccess(orders);
  }

  @Get('listCount')
  async orderCount(@Request() req): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const counts = await this.orderService.orderCount(tokenInfo.userId);
    return new ResponseSuccess(counts);
  }

  @Get('info')
  async info(@Query() params: OrderDto): Promise<IResponse> {
    const orderInfo = await this.orderService.findOrderById(params.id);
    return new ResponseSuccess(orderInfo);
  }

  @HttpCode(HttpStatus.OK)
  @Post('listByStatus')
  async listByStatus(
    @Request() req,
    @Body() params: OrderDto,
  ): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const orders = await this.orderService.findOrderByStatus(
      params.status,
      tokenInfo.userId,
    );
    return new ResponseSuccess(orders);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(
    @Request() req,
    @Body() addOrder: CreateOderDto,
  ): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const orderId = await this.orderService.addOrder({
      ...addOrder,
      userId: tokenInfo.userId,
    });
    return new ResponseSuccess(orderId);
  }

  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(@Body() payInfo: OrderInterface): Promise<IResponse> {
    const result = await this.orderService.orderPay(payInfo);
    return new ResponseSuccess(result);
  }
}
