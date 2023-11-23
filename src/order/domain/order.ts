import { DayOfWeek, LocalDateTime } from '@js-joda/core';
import { OrderStatus } from './order.status';
import { Money } from 'src/money/domain/money';
// import { Pay } from './Pay';
// import { getConnection } from 'typeorm';

export class Order {
  private _id: number;
  private _amount: number;
  private _status: OrderStatus;
  private _orderDateTime: LocalDateTime;
  private _acceptDateTime: LocalDateTime;
  private _description: string;
  private _parentId: number;
  // private _pays: Pay[];

  constructor() {
    this._id = Order.generateId();
    this._parentId = this._id;
  }

  private static generateId(): number {
    return Math.random() * (99999 - 1) + 1;
  }

  static of(amount: number, orderStatus: OrderStatus): Order {
    const newOrder = new Order();
    newOrder._amount = amount;
    newOrder._status = orderStatus;
    return newOrder;
  }

  static createBadCase(
    amount: number,
    description: string,
    orderTime = LocalDateTime.now(),
  ): Order {
    if (amount < 0) {
      throw new Error(`주문시 -금액은 될 수 없습니다. amount=${amount}`);
    }

    if (!description) {
      throw new Error(`주문명은 필수입니다.`);
    }

    const newOrder = new Order();
    newOrder._amount = amount;
    newOrder._status = OrderStatus.REQUEST;
    newOrder._orderDateTime = orderTime;
    newOrder._description = description;
    return newOrder;
  }

  static create(
    money: Money,

    description: string,
    orderTime = LocalDateTime.now(),
  ): Order {
    const newOrder = new Order();
    newOrder._amount = money.amount; // money 파라미터
    newOrder._status = OrderStatus.REQUEST;
    newOrder._orderDateTime = orderTime;
    newOrder._description = description;
    return newOrder;
  }

  // static createWithPays(
  //   pays: Pay[],
  //   orderTime: LocalDateTime,
  //   description: string,
  // ): Order {
  //   const newOrder = new Order();
  //   newOrder._amount = pays?.reduce((sum, pay) => sum + pay.amount, 0);
  //   newOrder._status = OrderStatus.REQUEST;
  //   newOrder._orderDateTime = orderTime;
  //   newOrder._description = description;
  //   return newOrder;
  // }

  validateAccept(): void {
    if (this.amount < 0) {
      throw new Error(`주문시 -금액은 될 수 없습니다. amount=${this.amount}`);
    }

    if (!this.description) {
      throw new Error(`주문명은 필수입니다.`);
    }
  }

  // bad case
  // active record 패턴
  // 단점
  // 1) 테스트하기 어려워진다. 테스트 DB 실행 등 여러 절차 때문에 테스트 환경구축에 많은 리소스가 들어간다.
  // 2) 낮은 테스트 리팩토링 내구성 - 외부 의존대상이 교체될 때마다 많은 변화가 일어난다.
  // 3) 지키기 어려운 일관성
  // 한마디로 테스트하기 어려워진다
  async cancelBadCase(cancelTime) {
    if (this._orderDateTime >= cancelTime) {
      throw new Error('주문 시간이 주문 취소 시간보다 늦을 수 없습니다.');
    }
    const cancelOrder = new Order();
    cancelOrder._amount = this._amount * -1;
    cancelOrder._status = OrderStatus.CANCEL;
    cancelOrder._orderDateTime = cancelTime;
    cancelOrder._description = this._description;
    cancelOrder._parentId = this._id;

    // await getConnection().getRepository(Order).save(cancelOrder);
    return;
  }

  // good case
  // 외부 의존성을 로직에서 떨어뜨려 놓는다.
  // 이렇게 할 경우 cancel()은 외부에 영향을 받지 않는 리턴값이 있는 메서드가 된다.
  // 굳이 이 메서드를 검증하기 위해 RDBMS에서 데이터를 조회할 필요도 없어진다.

  // 'Throw가 왜 발생하는지', 'return으로 의도한 결과가 넘어오는지' 등
  // 검증로직, 객체 생성로직 등 외부 저장소에 저장하는 로직을 제외한 나머지 모든 로직의 검증이 쉬워진다!!
  cancel(cancelTime: LocalDateTime): Order {
    if (this._orderDateTime >= cancelTime) {
      throw new Error('주문 시간이 주문 취소 시간보다 늦을 수 없습니다.');
    }
    const cancelOrder = new Order();
    cancelOrder._amount = this._amount * -1;
    cancelOrder._status = OrderStatus.CANCEL;
    cancelOrder._orderDateTime = cancelTime;
    cancelOrder._description = this._description;
    cancelOrder._parentId = this._id;
    return cancelOrder;
  }

  async cancelOrder(cancelTime: LocalDateTime) {
    if (this._orderDateTime >= cancelTime) {
      throw new Error('주문 시간이 주문 취소 시간보다 늦을 수 없습니다.');
    }

    const cancelOrder = new Order();
    cancelOrder._amount = this._amount * -1;
    cancelOrder._status = OrderStatus.CANCEL;
    cancelOrder._orderDateTime = cancelTime;
    cancelOrder._description = this._description;
    cancelOrder._parentId = this._id;

    // await getConnection().getRepository(Order).save(cancelOrder);
  }

  // bad case
  discount() {
    // 제어할 수 없는 값이 비지니스 로직에 사용되어 테스트하기 어려워진다
    // 도메인 로직이 테스트하기 어려울 경우 다른 계층 전반의 테스트가 어려워지는 것을 의미한다.

    // 개발자가 제어할 수 없는 값에 의존하는 함수는 테스트하기 어렵다.
    // 예를들어 Random, new Date(), 전역함수, 전역변수, 외부 API 의존 등을 사용하는 경우이다.
    const now = LocalDateTime.now();
    if (now.dayOfWeek() == DayOfWeek.SUNDAY) {
      this._amount = this._amount * 0.9;
    }
  }

  // good case
  // 현재시간을 밖에서 주입받는다!
  // 제어할 수 없는 시간이라는 값을
  // 내가 원하는 값으로 지정해서 테스트를 작성할 수 있게 된다.

  // 교훈 1
  // 테스트를 위해 구현 설계가 변경될 수 있다.
  // 잘 작성된 코드는 테스트하기 쉽다.
  // 테스트하기 어렵게 구현되어 있다면, 코드의 확장성이 떨어지고, 의존성 설계가 잘못되어 있을 확률이 높다.

  // 교훈 2
  // Q. 테스트하기 좋은 코드란 무엇인가?
  // A. 몇번을 수행해도 항상 같은 결과가 반환되는 함수 (순수함수) 가 테스트하기 좋은 코드
  discountWith(now: LocalDateTime) {
    if (now.dayOfWeek() == DayOfWeek.SUNDAY) {
      this._amount = this._amount * 0.9;
    }
  }

  update(other: Order): void {
    this._orderDateTime = other._orderDateTime;
    this._description = other._description;
    this._amount = other._amount;
  }

  updateAmount(amount: number): void {
    this._amount = amount;
  }

  copy(): Order {
    const order = new Order();
    order._id = this._id;
    order._orderDateTime = this._orderDateTime;
    order._amount = this._amount;
    order._status = this._status;
    order._description = this._description;
    order._parentId = this._parentId;
    // order._pays = this._pays;

    return order;
  }

  accept(now: LocalDateTime): void {
    this._status = OrderStatus.APPROVAL;
    this._acceptDateTime = now;
  }

  complete(now: LocalDateTime): void {
    this._status = OrderStatus.COMPLETED;
    this._acceptDateTime = now;
  }

  equalsBilling(billingStatus: string): boolean {
    return this._status === billingStatus;
  }

  get id(): number {
    return this._id;
  }

  get amount(): number {
    return this._amount;
  }

  set status(value: OrderStatus) {
    this._status = value;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get orderDateTime(): LocalDateTime {
    return this._orderDateTime;
  }

  get description(): string {
    return this._description;
  }

  get parentId(): number {
    return this._parentId;
  }

  // get pays(): Pay[] {
  //   return this._pays;
  // }

  get acceptDateTime(): LocalDateTime {
    return this._acceptDateTime;
  }

  isNotCompleted() {
    return !this.isCompleted();
  }

  isCompleted() {
    return this._status === OrderStatus.COMPLETED;
  }

  isCanceled() {
    return this._status === OrderStatus.CANCEL;
  }
}
