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
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { OrderDto } from './dto/order.dto';
import { CreateOderDto } from './dto/create-oder.dto';
import { OrderInterface } from './interfaces/order.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  async findAll(): Promise<IResponse> {
    const orders = await this.orderService.findAll();
    if (orders) {
      return new ResponseSuccess('COMMON.SUCCESS', orders);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Get('listCount')
  async orderCount(@Request() req): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const counts = await this.orderService.orderCount(tokenInfo.userId);
    if (counts) {
      return new ResponseSuccess('COMMON.SUCCESS', counts);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Get('info')
  async info(@Query() params: OrderDto): Promise<IResponse> {
    const orderInfo = await this.orderService.findOrderById(params.id);
    if (orderInfo) {
      return new ResponseSuccess('COMMON.SUCCESS', orderInfo);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
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
    if (orders) {
      return new ResponseSuccess('COMMON.SUCCESS', orders);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(
    @Request() req,
    @Body() addOrder: CreateOderDto,
  ): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const result = await this.orderService.addOrder({
      ...addOrder,
      userId: tokenInfo.userId,
    });
    if (result?.orderId) {
      return new ResponseSuccess('COMMON.SUCCESS', result.orderId);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR', result.msg);
  }

  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(@Body() payInfo: OrderInterface): Promise<IResponse> {
    const result = await this.orderService.orderPay(payInfo);
    if (result) {
      return new ResponseSuccess('COMMON.SUCCESS', result);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
