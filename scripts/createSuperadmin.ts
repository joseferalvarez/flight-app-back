import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/user.service';

async function bootstrap() {
    try{
        const app = await NestFactory.createApplicationContext(AppModule);
        const userService = app.get(UsersService);
  
        const username = process.env.ADMIN_USER;
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        const superAdmin = await userService.postSuperAdminUser(username, email, password);

        if(!superAdmin){
            console.log('The superadmin has not been created because of an error.');
            process.exit(0);
        }
  
        console.log('Superadmin created:', superAdmin);
        process.exit(0);
    }catch(e){
        console.log(`The superadmin has not been created because of an error: ${e}`);
    }
}
  
bootstrap();
