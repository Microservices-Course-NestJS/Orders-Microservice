import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";
import { OrderStatusList } from "../enum/order.enum";
import { OrderStatus } from "generated/prisma/enums";

export class OrderPaginationDto extends PaginationDto{
    @IsOptional()
    @IsEnum(OrderStatus,{
        message: `Valida status are: ${OrderStatusList}`
    })
    status?: OrderStatus
}