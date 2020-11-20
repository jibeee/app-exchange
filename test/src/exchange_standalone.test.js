// @flow
import "core-js/stable";
import "regenerator-runtime/runtime";

import Swap from "./Swap.js";
import secp256k1 from "secp256k1";
import sha256 from "js-sha256";
import "./protocol_pb.js";
import { getTransport, numberToBigEndianBuffer, swapTestPrivateKey, partnerSerializedNameAndPubKey, DERSignatureOfPartnerNameAndPublicKey } from "./common";


test('TransactionId should be 10 uppercase letters', async () => {
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string = await swap.startNewTransaction();
  expect(transactionId.length).toBe(10);
  expect(transactionId).toBe(transactionId.toUpperCase());
})

test('SetPartnerKey should not throw', async () => {
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string = await swap.startNewTransaction();
  await expect(swap.setPartnerKey(partnerSerializedNameAndPubKey)).resolves.toBe(undefined);
})

test('Wrong partner data signature should not be accepted', async () => {
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await expect(swap.checkPartner(Buffer.alloc(70)))
    .rejects.toEqual(new Error("Swap application report error SIGN_VERIFICATION_FAIL"));
})

test('Correct signature of partner data should be accepted', async () => {
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  await expect(swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey)).resolves.toBe(undefined);
})


test('Process transaction should not fail', async () => {
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("asdasdassasadsada");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("ETH");
  // 100000000 Satoshi to 48430000000000000000 Wei (1 BTC to 48.43 ETH)
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  await expect(swap.processTransaction(payload, 10000000)).resolves.toBe(undefined);
})

test('Transaction signature should be checked without errors', async () => {
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("asdasdassasadsada");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("ETH");
  // 100000000 Satoshi to 48430000000000000000 Wei (1 BTC to 48.43 ETH)
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  swap.processTransaction(payload, 10000000);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.sign(digest, swapTestPrivateKey).signature;
  await expect(swap.checkTransactionSignature(secp256k1.signatureExport(signature))).resolves.toBe(undefined);
})


test('Wrong transactions signature should be rejected', async () => {
  let transport = await getTransport();
  const swap: Swap = new Swap(transport);
  const transactionId: string = await swap.startNewTransaction();
  swap.setPartnerKey(partnerSerializedNameAndPubKey);
  swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
  var tr = new proto.ledger_swap.NewTransactionResponse();
  tr.setPayinAddress("2324234324324234");
  tr.setPayinExtraId("");
  tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
  tr.setRefundExtraId("");
  tr.setPayoutAddress("asdasdassasadsada");
  tr.setPayoutExtraId("");
  tr.setCurrencyFrom("BTC");
  tr.setCurrencyTo("ETH");
  // 100000000 Satoshi to 48430000000000000000 Wei (1 BTC to 48.43 ETH)
  tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
  tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
  tr.setDeviceTransactionId(transactionId);

  const payload: Buffer = Buffer.from(tr.serializeBinary());
  swap.processTransaction(payload, 10000000);
  const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
  const signature: Buffer = secp256k1.sign(digest, swapTestPrivateKey).signature;
  const wrongSign: Buffer = secp256k1.signatureExport(signature);
  console.log(wrongSign.length);
  wrongSign.reverse();
  wrongSign[1] = wrongSign.length - 2;
  await expect(swap.checkTransactionSignature(wrongSign))
    .rejects.toEqual(new Error("Swap application report error SIGN_VERIFICATION_FAIL"));
})




// JEAN test('Test BTC swap to LTC fails', async () => {
//   jest.setTimeout(100000);

//   let transport = await getTransport();
//   const swap: Swap = new Swap(transport);
//   const transactionId: string  = await swap.startNewTransaction();
//   await swap.setPartnerKey(partnerSerializedNameAndPubKey);
//   await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
//   var tr  = new proto.ledger_swap.NewTransactionResponse();
//   tr.setPayinAddress("34dZAvAf1ywuKj1iAydSpPtavigteo1T5G");
//   tr.setPayinExtraId("");
//   tr.setRefundAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
//   tr.setRefundExtraId("");
//   tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
//   tr.setPayoutExtraId("");
//   tr.setCurrencyFrom("BTC");
//   tr.setCurrencyTo("LTC");
//   tr.setAmountToProvider(numberToBigEndianBuffer(500000));
//   tr.setAmountToWallet(numberToBigEndianBuffer(10000000));
//   tr.setDeviceTransactionId(transactionId);

//   const payload: Buffer = Buffer.from(tr.serializeBinary());
//   await swap.processTransaction(payload, 1070);
//   const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
//   const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
//   await swap.checkTransactionSignature(signature);
//   const ltcAddressParams = getSerializedAddressParametersBTC("49'/0'/0'/0/0");
//   await swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, ltcAddressParams.addressParameters);

//   const btcAddressParams = getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
//   await swap.checkRefundAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters);
//   await swap.signCoinTransaction();
//   transport.close();

//   await new Promise(r => setTimeout(r, 1000));

//   transport = await getTransport();

//   expect.assertions(1);
//   try{
//     var
//     ans = await transport.send(0xe0, 0x44, 0x00, 0x02, Buffer.from('0100000002', 'hex')); // nVersion + number of inputs
//     ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('022d5a8829df3b90a541c8ae609fa9a0436e99b6a78a5c081e77c249ced0df3db200000000409c00000000000000', 'hex'));

//     ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('ffffff00', 'hex'));

//     ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('0252203e7659e8515db292f18f4aa0235822cb89d5de136c437fe8fca09945822e0000000040420f000000000000', 'hex'));

//     ans = await transport.send(0xe0, 0x44, 0x80, 0x02, Buffer.from('ffffff00', 'hex'));

//     ans = await transport.send(0xe0, 0x4a, 0xff, 0x00, Buffer.from('058000005480000000800000000000000100000000', 'hex'));

//     ans = await transport.send(0xe0, 0x4a, 0x80, 0x00, Buffer.from('0220a107000000000017a9142040cc4169698b7f2f071e4ad14b01458bbc99b08732390800000000001600147051913704F2', 'hex'));
//     ans = await transport.send(0xe0, 0x4a, 0x80, 0x00, Buffer.from('356BC3BF6FB0E7555F67688A377D', 'hex'));

//     // start signing inputs
//     ans = await transport.send(0xe0, 0x44, 0x00, 0x80, Buffer.from('0100000001', 'hex'));

//     ans = await transport.send(0xe0, 0x44, 0x80, 0x80, Buffer.from('022d5a8829df3b90a541c8ae609fa9a0436e99b6a78a5c081e77c249ced0df3db200000000409c00000000000019', 'hex'));

//     ans = await transport.send(0xe0, 0x44, 0x80, 0x80, Buffer.from('76a914a3f6421206f0448c113b9bb95ca48a70cee23b6888acffffff00', 'hex'));
//     ans = await transport.send(0xe0, 0x48, 0x00, 0x00, Buffer.from('058000005480000000800000000000000000000000000000000001', 'hex'));

//     console.log(ans);
//   }
//   catch(error){
//     expect(error["statusCode"]).toBe(0x6A8A)
//   }

//   transport.close()

// })


// test('Test ETH swap to BTC', async () => {
//   jest.setTimeout(100000);
//   let transport = await getTransport();
//   //const transport: Transport<string> = await TransportNodeHid.open();
//   const swap: Swap = new Swap(transport);
//   const transactionId: string  = await swap.startNewTransaction();
//   await swap.setPartnerKey(partnerSerializedNameAndPubKey);
//   await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
//   let tr  = new proto.ledger_swap.NewTransactionResponse();
//   tr.setPayinAddress("0xd692Cb1346262F584D17B4B470954501f6715a82");
//   tr.setPayinExtraId("");
//   tr.setRefundAddress("0xDad77910DbDFdE764fC21FCD4E74D71bBACA6D8D");
//   tr.setRefundExtraId("");
//   tr.setPayoutAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
//   tr.setPayoutExtraId("");
//   tr.setCurrencyFrom("ETH");
//   tr.setCurrencyTo("BTC");
//   // 1 ETH to 1 BTC
//   tr.setAmountToProvider(numberToBigEndianBuffer(1000000 * 1000000 * 1000000 * 1.1234)); // 10^18 wei == 1 ETH
//   tr.setAmountToWallet(numberToBigEndianBuffer(100000000));
//   tr.setDeviceTransactionId(transactionId);

//   const payload: Buffer = Buffer.from(tr.serializeBinary());
//   await swap.processTransaction(payload, 840000000000000);
//   const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
//   const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
//   await swap.checkTransactionSignature(signature);
//   const btcAddressParams = getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
//   await swap.checkPayoutAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters);

//   const ethAddressParams = getSerializedAddressParametersETH("44'/60'/0'/0/0");
//   await swap.checkRefundAddress(ETHConfig, ETHConfigSignature, ethAddressParams.addressParameters);
//   await swap.signCoinTransaction();
//   transport.close();

//   await new Promise(r => setTimeout(r, 5000));

//   transport = await getTransport();
//   //transport = await TransportNodeHid.open();

//   let ans = await transport.send(0xe0, 0x04, 0x00, 0x00, Buffer.from('058000002c8000003c800000000000000000000000ec808509502f900082520894d692cb1346262f584d17b4b470954501f6715a82880f971e5914ac800080018080', 'hex'));
//   console.log(ans);
// })



// test('Test Aeternity ERC20 swap to BTC', async () => {
//   jest.setTimeout(100000);
//   let transport = await getTransport();
//   const swap: Swap = new Swap(transport);
//   const transactionId: string  = await swap.startNewTransaction();
//   await swap.setPartnerKey(partnerSerializedNameAndPubKey);
//   await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
//   let tr  = new proto.ledger_swap.NewTransactionResponse();
//   tr.setPayinAddress("0xd692Cb1346262F584D17B4B470954501f6715a82");
//   tr.setPayinExtraId("");
//   tr.setRefundAddress("0xDad77910DbDFdE764fC21FCD4E74D71bBACA6D8D");
//   tr.setRefundExtraId("");
//   tr.setPayoutAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
//   tr.setPayoutExtraId("");
//   tr.setCurrencyFrom("AE");
//   tr.setCurrencyTo("BTC");
//   // 1.1234 AE to 1 BTC
//   tr.setAmountToProvider(numberToBigEndianBuffer(1000000 * 1000000 * 1000000 * 1.1234)); // 10^18 wei == 1 ETH
//   tr.setAmountToWallet(numberToBigEndianBuffer(100000000));
//   tr.setDeviceTransactionId(transactionId);

//   const payload: Buffer = Buffer.from(tr.serializeBinary());
//   await swap.processTransaction(payload, 1477845000000000);
//   const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
//   const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
//   await swap.checkTransactionSignature(signature);
//   const btcAddressParams = getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
//   await swap.checkPayoutAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters);

//   const aeAddressParams = getSerializedAddressParametersETH("44'/60'/0'/0/0");
//   await swap.checkRefundAddress(AEConfig, AEConfigSignature, aeAddressParams.addressParameters);
//   await swap.signCoinTransaction();
//   transport.close();

//   await new Promise(r => setTimeout(r, 5000));

//   transport = await getTransport();

//   const eth: Eth = new Eth(transport);
//   const aeInfo = byContractAddress("0x5CA9a71B1d01849C0a95490Cc00559717fCF0D1d")
//   if (aeInfo) await eth.provideERC20TokenInformation(aeInfo)

//   let ans = await transport.send(0xe0, 0x04, 0x00, 0x00, Buffer.from('058000002c8000003c800000000000000000000000F8690385098BCA5A00828CCD945CA9a71B1d01849C0a95490Cc00559717fCF0D1d80B844A9059CBB000000000000000000000000d692Cb1346262F584D17B4B470954501f6715a820000000000000000000000000000000000000000000000000F971E5914AC8000038080', 'hex'));
//   console.log(ans);
// })

