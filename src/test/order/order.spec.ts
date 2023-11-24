import { LocalDateTime } from '@js-joda/core';
import { Order } from '../../order/domain/order';
import { OrderStatus } from '../../order/domain/order-status.enum';
import { Money } from '../../money/domain/money';

describe('Order1', () => {
  it('주문취소 테스트1', () => {
    const money = new Money(1000);
    const description = '주문';

    // beforeEaceh를 사용하여 테스트 픽스처를 구성하는 것보다
    // 클래스 내부에 private 팩토리 메서드를 만들어서 사용하거나,
    // 클래스 외부에 static 팩토리 메서들를 만들어 사용하는 것이 좋다!
    const sut = createOrder(money, description);
    const cancelOrder = sut.cancel(LocalDateTime.of(2024, 10, 31, 0, 0, 0));
    // 검증부는 하드코딩하자((도메인)로직이 들어가면 안된다.)
    expect(cancelOrder.status).toBe(OrderStatus.CANCEL);
    expect(cancelOrder.amount).toBe(-1000);
    expect(cancelOrder.description).toBe('주문');
  });

  it('일요일에는 주문금액 10% 할인', () => {
    const sut = Order.of(10_000, OrderStatus.APPROVAL);
    const now = LocalDateTime.of(2022, 8, 14, 10, 15, 0);
    sut.discountWith(now);
    expect(sut.amount).toBe(9_000);
  });

  /*
 cancelBadCase 테스트 코드는 아래와 같이 작성할 수 있다.
 -> 테스트 환경 구축에 많은 리소스가 필요하다.
 describe('Order', () => {
    beforeAll(async () => {
      await setupTestingModule();
      await createDatabase();
      await createTable();
    });

    afterAll(async () => {
      await databaseConnection().close();
    });

    beforeEach(async () => {
      allRepository().clear();
    });

    it('주문 취소시 최소 주문이 생성된다', () => {
      //given
      const sut = await orderRepository.save(createOrder());

      // when
      sut.cancel();

      // then
      const result = await orderRepository.findOne(orderId);
      expect('~~');
    });
  });
 */

  /**
   * Best Case
   * cancel에 대한 테스트코드를 아래와 같이 작성할 수 있다. 
  describe('Order', () => {

    it('주문 취소시 최소 주문이 생성된다', () => {
      //given
      const sut = createOrder();

      // when
      const result = sut.cancel();

      // then
      expect(~~)
    });
});

   */

  // beforeEach(() => {
  //   sut = Order.create(
  //     1000,
  //     '배민주문',
  //     LocalDateTime.of(2021, 10, 30, 10, 0, 0),
  //   );
  // });

  // it('주문취소1', () => {
  //   const cancelOrder: Order = sut.cancel(
  //     LocalDateTime.of(2021, 10, 31, 0, 0, 0),
  //   );

  //   expect(cancelOrder.status).toBe(OrderStatus.CANCEL);
  //   expect(cancelOrder.amount).toBe(-1000);
  //   expect(cancelOrder.description).toBe('배민주문');
  // });

  // it('주문취소2', () => {
  //   expect(sut.cancel(LocalDateTime.of(2021, 10, 31, 0, 0, 0)).amount).toBe(
  //     -1000,
  //   );
  // });
});

function createOrder(money: Money, description: string = '주문') {
  return Order.create(
    money,
    description,
    LocalDateTime.of(2021, 10, 30, 10, 0, 0),
  );
}
