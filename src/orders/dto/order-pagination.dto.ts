import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";
import { OrderStatus } from "src/generated/prisma/enums";
import { OrderStatusList } from "../enum/order.enum";

export class OrderPaginationDto extends PaginationDto{
    @IsOptional()
    @IsEnum(OrderStatus,{
        message: `Valida status are: ${OrderStatusList}`
    })
    status?: OrderStatus
}