import { Injectable, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient{
    private readonly logger = new Logger('PrismaService')

    constructor(){
        const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
        super({ adapter: pool });
        this.logger.log('Database connected');
    }
}

