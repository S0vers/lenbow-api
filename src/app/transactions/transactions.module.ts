import { Module } from '@nestjs/common';
import { ContactsModule } from '../contacts/contacts.module';
import { HistoryModule } from '../history/history.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
	imports: [ContactsModule, HistoryModule],
	controllers: [TransactionsController],
	providers: [TransactionsService],
	exports: [TransactionsService],
})
export class TransactionsModule {}
