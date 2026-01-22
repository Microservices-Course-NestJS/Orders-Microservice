import { HttpStatus, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma.service';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto, productValidatorDto } from './dto';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class OrdersService{

  private readonly logger = new Logger('OrdersService')
  constructor(
    @Inject(NATS_SERVICE)
    private readonly natsClient: ClientProxy,
    private readonly prisma: PrismaService
  ){}


    
  async create(createOrderDto: CreateOrderDto) {

    try {

      const productIds: number[] = createOrderDto.items.map( item => item.productId)

      const products: productValidatorDto[] = await firstValueFrom(
        this.natsClient.send({cmd: 'validate_products'}, productIds)
      );

      const totalAmount = createOrderDto.items.reduce((acc, orderItem)=>{
        const price = products.find(
          product => product.id === orderItem.productId
        )!.price;
        return acc + price * orderItem.quantity
      }, 0)

      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity
      }, 0);

      const order = await this.prisma.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map(item => ({
                price: products.find(product => product.id === item.productId)!.price,
                quantity: item.quantity,
                productId: item.productId
              }))
            }
          }
        },
        include: {
          OrderItem: {
            select:{
              productId: true,
              id:true,
              price: true,
              quantity: true,
            }
          }
        }
      })

      return {
        ...order,
        OrderItem: order.OrderItem.map(item => ({
            ...item,
            name: products.find(product => product.id === item.productId)!.name
          })
        )
      }
      
    } catch (error) {
      throw new RpcException({status: error.status, message: error.message})
    }

  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.prisma.order.count({where:{status: orderPaginationDto.status}});

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      data: await this.prisma.order.findMany({
        skip: (currentPage!-1)*perPage!,
        take: perPage,
        where: {
          status: orderPaginationDto.status
        }
      }),
      meta:{
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages/perPage!)
      }
    };
  }

  async findOne(id: string) {
    

    try {

      const order = await this.prisma.order.findUnique({
        where: {id},
        include: {
          OrderItem: {
            select: {
              productId: true,
              quantity: true,
              price: true
            }
          }
        }
      }) 
    
      if(!order){
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Error ${HttpStatus.NOT_FOUND}, no se encontro la orden con id: ${id}`});
      }
      const productsIds: number[] = order.OrderItem.map(item => item.productId)
      const products: productValidatorDto[] = await firstValueFrom(
        this.natsClient.send({cmd: 'validate_products'},productsIds)
      )
  
      const {OrderItem, ...data} = order;
      return {
        ...data,
        Items: order.OrderItem.map(item => ({
          ...item,
          name: products.find(product => product.id === item.productId)!.name
        }))
      }
      
    } catch (error) {
      throw new RpcException({status: error.stats, message: error.message});
    }
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto){
    console.log('Entra al change status')
    const { id , status } = changeOrderStatusDto;

    const order = await this.findOne(id);
    if(order.status === status){
      return order
    }
    return this.prisma.order.update({
      where: {id},
      data:{
        status
      }
    })

  }
  
}
