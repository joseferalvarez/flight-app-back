import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private jwtService: JwtService,
    ){}

    async canActivate(context: ExecutionContext):  Promise<boolean>{
       return await this.getAuthValid(context, "c");
    }

    async getAuthValid(context: ExecutionContext, role): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if(!token) throw new UnauthorizedException('User token not found');

        try{
            const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SALT });

            if(
                (role === "a" && payload.role === "c") ||
                (role === "s" && (payload.role === "c" || payload.role === "a"))    
            ) throw new UnauthorizedException("You have not enough access to this resource.");

            request['user'] = payload;
        }catch(e){
            throw new UnauthorizedException(`Token error: ${e}`);
        }

        return true;
    }

    extractTokenFromHeader(request: Request): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}

export class AdminGuard extends AuthGuard{
    async canActivate(context: ExecutionContext): Promise<boolean> {
        return await this.getAuthValid(context, "a");
    }
}

export class SuperAdminGuard extends AuthGuard{
    async canActivate(context: ExecutionContext): Promise<boolean> {
        return await this.getAuthValid(context, "s");
    }
}