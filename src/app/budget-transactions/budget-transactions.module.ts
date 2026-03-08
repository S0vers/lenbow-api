import { Module } from '@nestjs/common';
import { BudgetTransactionsController } from './budget-transactions.controller';
import { BudgetTransactionsService } from './budget-transactions.service';

@Module({
	controllers: [BudgetTransactionsController],
	providers: [BudgetTransactionsService],
	exports: [BudgetTransactionsService],
})
export class BudgetTransactionsModule {}
