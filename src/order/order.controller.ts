import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  async findAll(): Promise<any> {
    const orders = await this.orderService.findAll();
    if (!orders) {
      return {
        msg: '获取订单列表失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: orders,
      code: 10000,
    };
  }

  @Get('listCount')
  async orderCount(@Request() req): Promise<any> {
    const {
      user: { userId },
    } = req;
    const counts = await this.orderService.orderCount(userId);
    if (!counts) {
      return {
        msg: '获取订单数量失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: counts,
      code: 10000,
    };
  }

  @Get('info')
  async info(@Query() params) {
    const orders = await this.orderService.findOrderById(params.id);
    if (!orders) {
      return {
        msg: '订单信息获取失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: orders,
      code: 10000,
    };
  }

  @HttpCode(200)
  @Post('listByStatus')
  async listByStatus(@Request() req, @Body() params: Order) {
    const tokenInfo: UserEntity = req.user;
    const orders = await this.orderService.findOrderByStatus(
      params.status,
      tokenInfo.userId,
    );
    if (!orders) {
      return {
        msg: '订单列表获取失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: orders,
      code: 10000,
    };
  }

  @Post('add')
  @HttpCode(200)
  async add(@Request() req, @Body() addOrder: Order) {
    const { userId } = req.user;
    const result = await this.orderService.addOrder({
      ...addOrder,
      userId,
    });
    return result;
  }

  @Post('pay')
  @HttpCode(200)
  async pay(@Body() payInfo: Order) {
    const result = await this.orderService.orderPay(payInfo);
    if (!result) {
      return {
        msg: '订单支付失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: result,
      code: 10000,
    };
  }
}
