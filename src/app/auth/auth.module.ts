import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { sessionTimeout } from '../../core/constants';
import type { EnvType } from '../../core/env';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSession } from './auth.session';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MfaModule } from '../mfa/mfa.module';

@Module({
	imports: [
		forwardRef(() => MfaModule),
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService<EnvType>) => ({
				secret: configService.get('AUTH_SECRET', { infer: true }),
				signOptions: { expiresIn: sessionTimeout / 1000 }, // Convert ms to seconds
			}),
		}),
	],
	providers: [AuthService, JwtStrategy, GoogleStrategy, AuthSession],
	controllers: [AuthController],
	exports: [AuthService, AuthSession],
})
export class AuthModule {}
