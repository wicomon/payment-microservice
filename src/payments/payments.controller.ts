import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // @Post('create-payment-session')
  @MessagePattern('create.payment.session')
  createPayment(
    @Payload() paymentSessionDto: PaymentSessionDto
  ) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      message: 'Payment successful!',
      ok: true,
    }
  }

  @Get('cancel')
  cancel() {
    return {
      message: 'Payment cancelled!',
      ok: true,
    }
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebHook(req, res);
  }
}