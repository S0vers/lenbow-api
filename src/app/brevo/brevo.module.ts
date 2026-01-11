import { Module } from '@nestjs/common';
import { TemplateModule } from '../template/template.module';
import { BrevoController } from './brevo.controller';
import { BrevoService } from './brevo.service';

@Module({
	imports: [TemplateModule],
	controllers: [BrevoController],
	providers: [BrevoService],
	exports: [BrevoService],
})
export class BrevoModule {}
