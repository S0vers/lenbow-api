import { Module } from '@nestjs/common';
import { BrevoModule } from '../brevo/brevo.module';
import { ContactsModule } from '../contacts/contacts.module';
import { HistoryModule } from '../history/history.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
	imports: [ContactsModule, HistoryModule, BrevoModule],
	controllers: [TransactionsController],
	providers: [TransactionsService],
	exports: [TransactionsService],
})
export class TransactionsModule {}
