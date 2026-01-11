import { Controller } from '@nestjs/common';
import { BrevoService } from './brevo.service';

@Controller('brevo')
export class BrevoController {
  constructor(private readonly brevoService: BrevoService) {}
}
