import { Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { LocalDateTime } from '@js-joda/core';

@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/accept')
  accept(orderId: number): void {
    this.orderService.accept(orderId);
  }

  // @Post('/discount')
  // async discount(orderId: number): Promise<void> {
  //   await this.orderService.discount(orderId);
  // }

  @Post('/discount2')
  async discount2(orderId: number): Promise<void> {
    await this.orderService.discountWith(orderId, LocalDateTime.now());
  }

  @Post('/discount3')
  async discount3(orderId: number): Promise<void> {
    await this.orderService.discountWith(orderId, LocalDateTime.now());
  }
}
