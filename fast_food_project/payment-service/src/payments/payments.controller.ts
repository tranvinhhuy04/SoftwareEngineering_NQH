import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Nhận event từ user-service
  @MessagePattern({cmd: 'user_created'})
  handleUserCreated(@Payload() data: any) {
    console.log('User created event received in Payment Service:', data);
    // Có thể tạo ví/tài khoản liên kết cho user ở đây
  }

  @MessagePattern({cmd : 'create_payment'})
  async createPayment(@Payload() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @MessagePattern({cmd: 'get_payments'})
  async getPayments() {
    return this.paymentsService.findAll();
  }
}
