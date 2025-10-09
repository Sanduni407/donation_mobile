// lib/stripe.ts
import { functions } from './appwrite';

const STRIPE_FUNCTION_ID = '68e573e4003c05292a34';

interface PaymentIntentParams {
  amount: number; // Amount in USD
  currency?: string;
  metadata?: Record<string, string>;
  cardDetails: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  };
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
}

export const createPaymentIntent = async (
  params: PaymentIntentParams
): Promise<PaymentIntentResponse> => {
  try {
    console.log('🔵 Creating and confirming payment with params:', {
      ...params,
      cardDetails: { ...params.cardDetails, number: '****', cvc: '***' }
    });

    // Call the Appwrite function
    const response = await functions.createExecution(
      STRIPE_FUNCTION_ID,
      JSON.stringify(params),
      false
    );

    console.log('🔵 Function response status:', response.status);
    console.log('🔵 Function response code:', response.responseStatusCode);

    // Check if execution was successful
    if (response.status !== 'completed') {
      throw new Error(`Function execution failed with status: ${response.status}`);
    }

    if (response.responseStatusCode !== 200) {
      const errorResult = JSON.parse(response.responseBody);
      throw new Error(errorResult.error || 'Payment failed');
    }

    // Parse the response body
    const result = JSON.parse(response.responseBody);
    console.log('🔵 Parsed result:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to process payment');
    }

    console.log('✅ Payment processed successfully!');

    return {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      status: result.status,
    };
  } catch (error: any) {
    console.error('❌ Error processing payment:', error);
    throw new Error(error.message || 'Failed to process payment');
  }
};

/**
 * Stripe test card numbers - use these for testing
 */
export const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  SUCCESS_DEBIT: '4000056655665556',
  SUCCESS_MASTERCARD: '5555555555554444',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED_CARD: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
  PROCESSING_ERROR: '4000000000000119',
};