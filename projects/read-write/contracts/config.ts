import { config } from 'dotenv';
config({path: __dirname + `/../.env`});

// Check if environment variables are missing
if(!process.env.ALGOD_PORT || !process.env.ALGOD_URL || !process.env.ALGOD_TOKEN || !process.env.WALLET_MNEMONIC) {
  throw new Error('Missing environment variables. Please make sure to create a .env file in the root directory of the project and add the following variables: ALGOD_PORT, ALGOD_URL, ALGOD_TOKEN, WALLET_MNEMONIC')
}

// Export Algod port
export const ALGOD_PORT = Number(process.env.ALGOD_PORT)
// Export Algod URL
export const ALGOD_URL = process.env.ALGOD_URL
// Export Algod token
export const ALGOD_TOKEN = process.env.ALGOD_TOKEN
// Export Wallet mnemonic
export const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC