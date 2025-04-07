import { app } from '@azure/functions';
import './functions';

export * from './services';
export * from './functions';
export * from './abi';
export * from './constants';

app.setup({
  enableHttpStream: true,
});
