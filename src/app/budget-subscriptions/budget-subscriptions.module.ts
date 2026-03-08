import { Module } from '@nestjs/common';
import { BudgetSubscriptionsController } from './budget-subscriptions.controller';
import { BudgetSubscriptionsService } from './budget-subscriptions.service';

@Module({
	controllers: [BudgetSubscriptionsController],
	providers: [BudgetSubscriptionsService],
	exports: [BudgetSubscriptionsService],
})
export class BudgetSubscriptionsModule {}
