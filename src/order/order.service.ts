import { LocalDateTime } from '@js-joda/core';
import { Order } from './domain/order';
import { OrderRepository } from './order.repository';
import { NotFoundException } from '@nestjs/common';
import { Money } from 'src/money/domain/money';

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  // case 1
  async receiptWorstCase(amount: number, description: string) {
    if (amount < 0) {
      throw new Error(`금액은 -가 될 수 없습니다. amount=${amount}`);
    }
    if (!Number.isInteger(amount)) {
      throw new Error(`금액은 정수만 가능합니다. amount=${amount}`);
    }
    const order = Order.createBadCase(amount, description);
    await this.orderRepository.save(order);
  }

  // bad case (case1을 리팩토링한 버전)
  // 문제상황  private으로 선언된 함수들은 어떻게 테스트 해야 할까?
  // private 메소드/함수의 테스트 코드는 작성하지 않는 것이 좋을때가 많다.
  // 그럼에도 불구하고 테스트코드를 작성해야 한다면 클래스 혹은 public함수들로 분리하는 것도 고려해볼만 하다.
  // 아래의 good case처럼 말이다.
  async receiptBadcase(amount: number, description: string) {
    this.validatePositive(amount);
    this.validateInteger(amount);
    const order = Order.createBadCase(amount, description);
    await this.orderRepository.save(order);
  }

  private validatePositive(amount: number) {
    if (amount < 0) {
      throw new Error(`금액은 -가 될 수 없습니다. amount=${amount}`);
    }
  }

  private validateInteger(amount: number) {
    if (!Number.isInteger(amount)) {
      throw new Error(`금액은 정수만 가능합니다. amount=${amount}`);
    }
  }
  /////////////////////////////////////////////////////

  // good case
  async recept(amount: number, description: string) {
    const money = new Money(amount);
    const order = Order.create(money, description);
    await this.orderRepository.save(order);
  }

  async discountWith(orderId: number, now = LocalDateTime.now()) {
    const order: Order = await this.orderRepository.findById(orderId);
    order.discountWith(now);
    await this.orderRepository.save(order);
  }

  async discountWith2(orderId: number) {
    const order: Order = await this.orderRepository.findById(orderId);
    // order.discountWith(this.time.now());
    await this.orderRepository.save(order);
  }

  async validateCompletedOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (order.isNotCompleted()) {
      throw new Error('아직 완료처리되지 못했습니다.');
    }
  }

  async compareBilling(orderId: number) {
    // const order = await this.orderRepository.findById(orderId);
    // // const billingStatus = this.billingApi.getBillingStatus(orderId);
    // if (order.equalsBilling(billingStatus)) {
    //   return;
    // }
    // if (order.isCompleted()) {
    //   // this.billingApi.complete(order);
    // }
    // if (order.isCanceled()) {
    //   this.billingApi.cancel(order);
    // }
  }

  async accept(orderId: number, now = LocalDateTime.now()) {
    const order = await this.orderRepository.findById(orderId);
    order.accept(now);
    await this.orderRepository.update(order);
  }

  /**
   * 케이스1) 외부 API 호출과 이를 저장하는 형태
   * 케이스2) 분기에 따른 서로 다른 API 호출
   */

  async saveOrUpdate(order: Order) {
    const savedOrder = await this.orderRepository.findById(order.id);
    if (savedOrder) {
      await this.orderRepository.update(order);
    } else {
      await this.orderRepository.save(order);
    }
  }

  async saveOrUpdate2(order: Order) {
    await this.orderRepository.saveOrUpdate(order);
  }

  // 변경전
  // Active Record 패턴으로 작업을 수행할 경우
  // 도메인 객체에 DB의존성이 생겨서, 도메인객체의 테스트가 어려워진다.
  async cancelBadCase(orderId: number) {
    // const order = await this.orderRepository.findById(orderId);
    // async 함수는 도메인 로직에 최대한 거리를 두는 것이 좋다.
    // const cancelOrder = await order.cancelBadCase(); // Order와 OrderService 모두 데이터베이스 의존성 필요
  }

  // 변경후
  // Data mapper 패턴으로 작업을 수행할 경우
  // 도메인 객체에 DB의존성이 없어서, 도메인객체의 테스트가 쉬워진다.
  // 변경후 코드는 Servcie만 테스트가 어렵다(도메인 객체는 테스트가 쉽다. 즉, 테스트하기 어려운 범위가 최소화된 것이다.)
  async cancelOrder1(orderId: number, cancelTime: LocalDateTime) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logAndThrow(orderId);
    }
    const cancelOrder = order.cancel(cancelTime);

    return this.orderRepository.save(cancelOrder);
  }

  logAndThrow(orderId: number) {
    const errorMessage = `orderId=${orderId}에 해당하는 주문이 존재하지 않습니다.`;
    console.log(errorMessage);
    throw new NotFoundException(errorMessage);
  }

  async cancelOrder2(orderId: number, cancelTime: LocalDateTime) {
    const order = await this.orderRepository.findById(orderId);
    this.validateOrder(order, orderId);

    const cancelOrder = order.cancel(cancelTime);

    return this.orderRepository.save(cancelOrder);
  }

  validateOrder(order: Order, orderId: number) {
    if (!order) {
      const errorMessage = `orderId=${orderId}에 해당하는 주문이 존재하지 않습니다.`;
      throw new NotFoundException(errorMessage);
    }
  }
}
