import { Controller, Get, Inject, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ChangeOrderStatusDto, CreateOrderDto, OrderPaginationDto } from './dto';
import { PRODUCTS_SERVICE } from 'src/config';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    
    @Inject(PRODUCTS_SERVICE)
    private readonly productsMicroservice: ClientProxy
  ) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

 @MessagePattern('changeOrderStatus')
 changeOrderStatus(@Payload() changeOrderStatusDto: ChangeOrderStatusDto) {
  return this.ordersService.changeOrderStatus(changeOrderStatusDto)
 }

}
