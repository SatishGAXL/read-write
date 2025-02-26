import * as algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { ReadWriteClient } from './clients/ReadWriteClient';

const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
const indexerClient = new algosdk.Indexer('a'.repeat(64), 'http://localhost', 8980);
const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

const transferTestTokens = async (
  algodClient: algosdk.Algodv2,
  sender: algosdk.Account,
  reciever: string,
  amount: number
) => {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: reciever,
    suggestedParams,
    amount: algokit.algos(amount).microAlgos,
  });
  const signedXferTxn = xferTxn.signTxn(sender.sk);
  try {
    await algodClient.sendRawTransaction(signedXferTxn).do();
    const result = await algosdk.waitForConfirmation(algodClient, xferTxn.txID().toString(), 3);
    var confirmedRound = result['confirmed-round'];
    return true;
  } catch (e: any) {
    return false;
  }
};

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

const roundwithScale = (num: number, scale: number) => {
  return Math.round((num + Number.EPSILON) * 10 ** scale) / 10 ** scale;
};

(async () => {
  const sender = await algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

  const Caller = new ReadWriteClient(
    {
      sender,
      resolveBy: 'id',
      id: 0,
    },
    algodClient
  );

  var { balance, minBalance } = await getDetailedBalances(sender.addr);
  console.log(`\n\nBefore Deploying Application\nBalance: ${balance}\nMin Balance: ${minBalance}`);

  await Caller.create.createApplication({});

  const { appId, appAddress } = await Caller.appClient.getAppReference();
  console.log('APP ID : ', appId);
  var newBalance = await getDetailedBalances(sender.addr);
  console.log(
    `\n\nAfter Deploying Application\nBalance: ${newBalance.balance}\nTXN Fee: ${roundwithScale(balance - newBalance.balance, 3)}\nMin Balance: ${newBalance.minBalance}\nMin Balance Increased by: ${roundwithScale(newBalance.minBalance - minBalance, 3)}`
  );

  await transferTestTokens(algodClient, sender, appAddress, 10);

  var { balance, minBalance } = await getDetailedBalances(sender.addr);
  console.log(`\n\nBefore Writing Name To Smart Contract\nBalance: ${balance}`);

  const result1 = await Caller.writeName({
    name: 'satish',
  });

  var newBalance = await getDetailedBalances(sender.addr);
  console.log(
    `\n\nAfter Writing Name To Smart Contract\nBalance: ${newBalance.balance}\nTXN Fee: ${roundwithScale(balance - newBalance.balance, 3)}`
  );

  var { balance, minBalance } = await getDetailedBalances(sender.addr);
  console.log(`\n\nBefore Reading Name From Smart Contract\nBalance: ${balance}`);

  const result = await Caller.readName({});

  console.log('\n\nName Received From Contract: ', result.return);

  var newBalance = await getDetailedBalances(sender.addr);
  console.log(
    `\n\nAfter Reading Name From Smart Contract\nBalance: ${newBalance.balance}\nTXN Fee: ${roundwithScale(balance - newBalance.balance, 3)}`
  );
})();
