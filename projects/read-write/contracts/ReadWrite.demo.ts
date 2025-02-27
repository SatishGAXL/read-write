import * as algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { ReadWriteClient } from './clients/ReadWriteClient';
import { ALGOD_PORT, ALGOD_TOKEN, ALGOD_URL, WALLET_MNEMONIC } from './config';

// Initialize Algod client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);

/**
 * Transfers test tokens from a sender to a receiver.
 * @param algodClient Algod client.
 * @param sender Sender account.
 * @param reciever Receiver address.
 * @param amount Amount to transfer in Algos.
 * @returns True if the transfer was successful, false otherwise.
 */
const transferTestTokens = async (
  algodClient: algosdk.Algodv2,
  sender: algosdk.Account,
  reciever: string,
  amount: number
) => {
  // Get suggested transaction parameters
  const suggestedParams = await algodClient.getTransactionParams().do();
  // Create a payment transaction
  const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: reciever,
    suggestedParams,
    amount: algokit.algos(amount).microAlgos,
  });
  // Sign the transaction
  const signedXferTxn = xferTxn.signTxn(sender.sk);
  try {
    // Send the raw transaction
    await algodClient.sendRawTransaction(signedXferTxn).do();
    // Wait for confirmation
    const result = await algosdk.waitForConfirmation(algodClient, xferTxn.txID().toString(), 3);
    var confirmedRound = result['confirmed-round'];
    return true;
  } catch (e: any) {
    return false;
  }
};

/**
 * Gets detailed balance information for an account.
 * @param address Account address.
 * @returns An object containing the balance, minimum balance, and delta balance.
 */
const getDetailedBalances = async (address: string) => {
  const r = await algodClient.accountInformation(address).do();
  const balance = algosdk.microalgosToAlgos(r['amount-without-pending-rewards']);
  const minBalance = algosdk.microalgosToAlgos(r['min-balance']);
  const deltaBalance = balance - minBalance;
  return {
    balance,
    minBalance,
    deltaBalance,
  };
};

/**
 * Rounds a number to a specified scale.
 * @param num Number to round.
 * @param scale Number of decimal places.
 * @returns The rounded number.
 */
const roundwithScale = (num: number, scale: number) => {
  return Math.round((num + Number.EPSILON) * 10 ** scale) / 10 ** scale;
};

(async () => {
  // Recover account from mnemonic
  const sender = algosdk.mnemonicToSecretKey(WALLET_MNEMONIC);

  // Create a ReadWriteClient instance
  const Caller = new ReadWriteClient(
    {
      sender,
      resolveBy: 'id',
      id: 0,
    },
    algodClient
  );

  // Get account balance before deploying the application
  var { balance, minBalance } = await getDetailedBalances(sender.addr);
  console.log(`\n\nBefore Deploying Application\nBalance: ${balance}\nMin Balance: ${minBalance}`);

  // Create the application
  await Caller.create.createApplication({});

  // Get the application ID and address
  const { appId, appAddress } = await Caller.appClient.getAppReference();
  console.log('APP ID : ', appId);
  // Get account balance after deploying the application
  var newBalance = await getDetailedBalances(sender.addr);
  console.log(
    `\n\nAfter Deploying Application\nBalance: ${newBalance.balance}\nTXN Fee: ${roundwithScale(balance - newBalance.balance, 3)}\nMin Balance: ${newBalance.minBalance}\nMin Balance Increased by: ${roundwithScale(newBalance.minBalance - minBalance, 3)}`
  );

  // Transfer test tokens to the application address
  await transferTestTokens(algodClient, sender, appAddress, 10);

  // Get account balance before writing the name to the smart contract
  var { balance, minBalance } = await getDetailedBalances(sender.addr);
  console.log(`\n\nBefore Writing Name To Smart Contract\nBalance: ${balance}`);

  // Write the name to the smart contract
  const result1 = await Caller.writeName({
    name: 'satish',
  });

  // Get account balance after writing the name to the smart contract
  var newBalance = await getDetailedBalances(sender.addr);
  console.log(
    `\n\nAfter Writing Name To Smart Contract\nBalance: ${newBalance.balance}\nTXN Fee: ${roundwithScale(balance - newBalance.balance, 3)}`
  );

  // Get account balance before reading the name from the smart contract
  var { balance, minBalance } = await getDetailedBalances(sender.addr);
  console.log(`\n\nBefore Reading Name From Smart Contract\nBalance: ${balance}`);

  // Read the name from the smart contract
  const result = await Caller.readName({});

  // Print the name received from the contract
  console.log('\n\nName Received From Contract: ', result.return);

  // Get account balance after reading the name from the smart contract
  var newBalance = await getDetailedBalances(sender.addr);
  console.log(
    `\n\nAfter Reading Name From Smart Contract\nBalance: ${newBalance.balance}\nTXN Fee: ${roundwithScale(balance - newBalance.balance, 3)}`
  );
})();
