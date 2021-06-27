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

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post('listByStatus')
  async listByStatus(@Request() req, @Body() params: Order) {
    const {
      user: { userId },
    } = req;
    const orders = await this.orderService.findOrderByStatus({
      ...params,
      userId,
    });
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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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
