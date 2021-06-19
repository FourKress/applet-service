import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
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
  async orderCount(@Query() params: any): Promise<any> {
    const counts = await this.orderService.orderCount(params.userId);
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
  @Post('info')
  async info(@Body() params: any) {
    const orders = await this.orderService.findOrderById(params.userId);
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
  async listByStatus(@Body() params: Order) {
    const orders = await this.orderService.findOrderByStatus(params);
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
  async add(@Body() addOrder: Order) {
    console.log(addOrder);
    const order = await this.orderService.addOrder(addOrder);
    if (!order) {
      return {
        msg: '订单添加失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: order,
      code: 10000,
    };
  }
}
