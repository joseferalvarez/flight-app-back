import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>("MONGODB_URL"),
            }),
            inject: [ConfigService]
        })
    ],
    providers: [{
        provide: 'MINIO_CLIENT',
        useFactory: async (configService: ConfigService) => {
            return new Minio.Client({
                endPoint: configService.get<string>('MINIO_ENDPOINT') || 'localhost',
                port: Number(configService.get<string>('MINIO_PORT')) || 9000,
                useSSL: configService.get<boolean>('MINIO_SSL') === true,
                accessKey: configService.get<string>('MINIO_ACCESS_KEY') || "",
                secretKey: configService.get<string>('MINIO_SECRET_KEY') || ""
            })
        },
        inject: [ConfigService]
    }],
    exports: [ 'MINIO_CLIENT' ]
})

export class BootModule {}
