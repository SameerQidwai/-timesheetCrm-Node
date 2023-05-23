import { XeroClient } from 'xero-node';
declare module 'xero-config' {
    const xero: XeroClient;
    export default xero;
  }