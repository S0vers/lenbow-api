import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';
import { MfaTotpService } from './mfa-totp.service';

@Module({
	imports: [forwardRef(() => AuthModule)],
	controllers: [MfaController],
	providers: [MfaTotpService, MfaService],
	exports: [MfaService],
})
export class MfaModule {}
