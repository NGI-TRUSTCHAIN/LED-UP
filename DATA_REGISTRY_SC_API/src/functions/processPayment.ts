import { ProcessPaymentParams } from '../types';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { processPayment } from '../helpers/update-query';
import erc20 from '../helpers/erc20';
import { parseEther } from 'ethers';
import { getUnitPrice } from '../helpers/view-query';

const handler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const compensationSmartContractAddress = process.env.COMPENSATION_CONTRACT_ADDRESS as string;
    const ConsumerAddress = process.env.OWNER_ADDRESS as string;

    const { producer, recordId, dataSize } = (await request.json()) as ProcessPaymentParams;
    const { unitPrice } = await getUnitPrice();

    await erc20.approve(compensationSmartContractAddress, parseEther(`${dataSize * unitPrice}`));

    console.log({
      producer,
      recordId,
      dataSize,
      amount: parseEther(`${dataSize * unitPrice}`),
    });

    const receipt = await processPayment({ producer, recordId, dataSize });

    return {
      status: 200,
      jsonBody: {
        receipt,
      },
    };
  } catch (error) {
    context.error(`Error processing payment: ${error}`);
    return {
      status: 500,
      jsonBody: {
        error: error,
        message: 'Failed to process payment',
      },
    };
  }
};

app.http('processPayment', {
  methods: ['POST'],
  route: 'processPayment',
  authLevel: 'anonymous',
  handler,
});
