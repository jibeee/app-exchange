// test('Valid payout address XRP should be accepted', async () => {
//     jest.setTimeout(100000);
//     let transport = await getTransport();
//     const swap: Swap = new Swap(transport);
//     const btc: Btc = new Btc(transport);
//     const transactionId: string = await swap.startNewTransaction();
//     await swap.setPartnerKey(partnerSerializedNameAndPubKey);
//     await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
//     var tr = new proto.ledger_swap.NewTransactionResponse();
//     tr.setPayinAddress("2324234324324234");
//     tr.setPayinExtraId("");
//     tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
//     tr.setRefundExtraId("");
//     tr.setPayoutAddress("ra7Zr8ddy9tB88RaXL8B87YkqhEJG2vkAJ");
//     tr.setPayoutExtraId("");
//     tr.setCurrencyFrom("BTC");
//     tr.setCurrencyTo("XRP");
//     // 1 BTC to 10 XRP
//     tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
//     tr.setAmountToWallet(numberToBigEndianBuffer(1000000000));
//     tr.setDeviceTransactionId(transactionId);
//     const payload: Buffer = Buffer.from(tr.serializeBinary());
//     await swap.processTransaction(payload, 10000000);
//     const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
//     const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
//     await swap.checkTransactionSignature(signature);
//     const params = await getSerializedAddressParametersXRP("44'/144'/0'/0/0");
//     console.log(params);
//     await expect(swap.checkPayoutAddress(XRPConfig, XRPConfigSignature, params.addressParameters)).resolves.toBe(undefined);
// })
"use strict";