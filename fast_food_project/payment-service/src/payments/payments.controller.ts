import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Khi user-service emit user_created → payment-service nhận được
  @MessagePattern('user_created')
  handleUserCreated(@Payload() data: any) {
    console.log('User created event received in Payment Service:', data);
    // Có thể tạo "tài khoản ví" cho user ở đây
  }

  @MessagePattern('create_payment')
  async createPayment(@Payload() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }
}
