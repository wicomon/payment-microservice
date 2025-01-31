import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from 'src/config/envs';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;
    // return paymentSessionDto;
    const lineItems = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // 20.00 dollars  2000 / 100 = 20.00
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return session;

    // return this.stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: {
    //           name: 'T-shirt',
    //         },
    //         unit_amount: 2000,
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'payment',
    //   success_url: 'http://localhost:3000/payments/success',
    //   cancel_url: 'http://localhost:3000/payments/cancel',
    // });
  }

  async stripeWebHook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    // test
    // const endpointSecret = 'whsec_6a2d656aabf67f26fefdbc5141d1e15c88f104357dfdf23aa44bcabb1287b546';

    // real
    const endpointSecret = envs.stripeEndpointSecret;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (error) {
      console.log(error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }
    
    // console.log({event})

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceded = event.data.object;
        console.log({metadata: chargeSucceded.metadata, orderId: chargeSucceded.metadata.orderId });
        break;
    
      default:
        console.log(`event ${event.type} not handled`);
    }

    return res.status(200).json({
      sig,
    });
  }
}
