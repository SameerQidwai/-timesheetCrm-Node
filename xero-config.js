// xero-config.js
import {XeroClient}  from 'xero-node'

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET ) {
  console.log(process.env.CLIENT_ID)
  console.log(process.env.CLIENT_SECRET )
  throw Error('Environment Variables not all set - please check your .env file in the project root or create one!')
}

const xero = new XeroClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUris: [`http://localhost:3301/api/v1/callback`],
    scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
    httpTimeout: 3000, // ms (optional)
    clockTolerance: 10 // seconds (optional)
  /* other configuration options */
});

export default xero;