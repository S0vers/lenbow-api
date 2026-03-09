import { Module } from '@nestjs/common';

import { BrevoModule } from '../brevo/brevo.module';
import { EmailTemplatesController } from './email-templates.controller';
import { EmailTemplatesService } from './email-templates.service';

@Module({
	imports: [BrevoModule],
	controllers: [EmailTemplatesController],
	providers: [EmailTemplatesService],
	exports: [EmailTemplatesService],
})
export class EmailTemplatesModule {}

