# Algorand Smart Contract - Read/Write Demo

This project demonstrates a simple proof of concept for reading and writing data to global storage in an Algorand smart contract. It includes transaction cost analysis for each operation.

## Overview

The project consists of a basic smart contract that can:
- Store a name in global storage
- Read the stored name from global storage
- Track transaction costs for each operation

## Smart Contract Details

The smart contract (`ReadWrite.algo.ts`) has three main methods:
- `createApplication()`: Initializes the contract with an empty name
- `writeName(name: string)`: Stores a name in global storage
- `readName()`: Retrieves the stored name

## Prerequisites

- Node.js and npm installed
- Algorand development environment
- Access to Algorand testnet
- Testnet account with sufficient funds

## Setup

1. Clone the repository
```bash
git clone https://github.com/SatishGAXL/read-write.git
cd read-write/projects/read-write
```
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.sample` to `.env`
   - Fill in your configuration:
```properties
WALLET_MNEMONIC="your_mnemonic"
ALGOD_TOKEN="your_algod_token"
ALGOD_URL="your_algod_url"
ALGOD_PORT=your_port
```

## Running the Demo

Compile Smart Contract (Optional)
```bash
npm run build
```

Execute the demo script:
```bash
npx tsx .\contracts\ReadWrite.demo.ts
```

### Sample Output
```
Before Deploying Application
Balance: 6.985
Min Balance: 1.2355

After Deploying Application
Balance: 6.984
TXN Fee: 0.001
Min Balance: 1.3855
Min Balance Increased by: 0.15

Before Writing Name To Smart Contract
Balance: 6.984

After Writing Name To Smart Contract
Balance: 6.983
TXN Fee: 0.001

Before Reading Name From Smart Contract
Balance: 6.983

Name Received From Contract: satish

After Reading Name From Smart Contract
Balance: 6.982
TXN Fee: 0.001
```

## Transaction Costs

- Application Creation: 0.001 ALGO + 0.15 ALGO (minimum balance requirement increase)
- Writing to Storage: 0.001 ALGO
- Reading from Storage: 0.001 ALGO

## Project Structure

```
├── projects/read-write/
│   ├── contracts/
│   │   ├── ReadWrite.algo.ts      # Smart contract implementation
│   │   ├── ReadWrite.demo.ts      # Demo script
│   │   └── config.ts              # Configuration setup
│   ├── .env                       # Environment variables
│   └── .env.sample               # Environment variables template
```

## Notes

- All transactions are executed on the Algorand testnet
- The demo includes detailed balance tracking before and after each operation
- Transaction fees and minimum balance requirements are displayed for educational purposes
