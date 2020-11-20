import "core-js/stable";
import "regenerator-runtime/runtime";
import { bip32asBuffer } from "./bip32";
import Btc from "@ledgerhq/hw-app-btc";
import Swap from "./Swap.js";
import secp256k1 from "secp256k1";
import sha256 from "js-sha256";
import "./protocol_pb.js";
// import { getTransport, numberToBigEndianBuffer, swapTestPrivateKey, partnerSerializedNameAndPubKey, DERSignatureOfPartnerNameAndPublicKey, BTCConfig, BTCConfigSignature, LTCConfig, LTCConfigSignature } from "./common";



/**
 * address format is one of legacy | p2sh | bech32
 */
export type AddressFormat = "legacy" | "p2sh" | "bech32";

const addressFormatMap = {
    legacy: 0,
    p2sh: 1,
    bech32: 2
};

export function getSerializedAddressParametersBTC(
    path: string, format?: AddressFormat
): { addressParameters: Buffer } {
    format = format || "legacy";
    if (!(format in addressFormatMap)) {
        throw new Error("btc.getWalletPublicKey invalid format=" + format);
    }
    const buffer = bip32asBuffer(path);
    const addressParameters = Buffer.concat([Buffer.from([addressFormatMap[format]]), buffer]);
    return { addressParameters };
}



test('Wrong payout address should be rejected', async () => {
    jest.setTimeout(100000);
    let transport = await getTransport();
    const swap: Swap = new Swap(transport);
    const btc: Btc = new Btc(transport);
    const transactionId: string = await swap.startNewTransaction();
    await swap.setPartnerKey(partnerSerializedNameAndPubKey);
    await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
    var tr = new proto.ledger_swap.NewTransactionResponse();
    tr.setPayinAddress("2324234324324234");
    tr.setPayinExtraId("");
    tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
    tr.setRefundExtraId("");
    tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjL");
    tr.setPayoutExtraId("");
    tr.setCurrencyFrom("BTC");
    tr.setCurrencyTo("LTC");
    // 1 BTC to 1 LTC
    tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
    tr.setAmountToWallet(numberToBigEndianBuffer(48430000000000000000));
    tr.setDeviceTransactionId(transactionId);

    const payload: Buffer = Buffer.from(tr.serializeBinary());
    await swap.processTransaction(payload, 10000000);
    const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
    const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
    await swap.checkTransactionSignature(signature);
    const params = await getSerializedAddressParametersBTC("49'/0'/0'/0/0");
    console.log(params);
    await expect(swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, params.addressParameters))
        .rejects.toEqual(new Error("Swap application report error INVALID_ADDRESS"));
})


test('Valid payout address should be accepted', async () => {
    jest.setTimeout(100000);
    let transport = await getTransport();
    const swap: Swap = new Swap(transport);
    const btc: Btc = new Btc(transport);
    const transactionId: string = await swap.startNewTransaction();
    await swap.setPartnerKey(partnerSerializedNameAndPubKey);
    await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
    var tr = new proto.ledger_swap.NewTransactionResponse();
    tr.setPayinAddress("2324234324324234");
    tr.setPayinExtraId("");
    tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
    tr.setRefundExtraId("");
    tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
    tr.setPayoutExtraId("");
    tr.setCurrencyFrom("BTC");
    tr.setCurrencyTo("LTC");
    // 1 BTC to 10 LTC
    tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
    tr.setAmountToWallet(numberToBigEndianBuffer(1000000000));
    tr.setDeviceTransactionId(transactionId);

    const payload: Buffer = Buffer.from(tr.serializeBinary());
    await swap.processTransaction(payload, 10000000);
    const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
    const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
    await swap.checkTransactionSignature(signature);
    const params = await getSerializedAddressParametersBTC("49'/0'/0'/0/0");
    console.log(params);
    await expect(swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, params.addressParameters)).resolves.toBe(undefined);
})


test('Wrong refund address should be rejected', async () => {
    jest.setTimeout(100000);
    let transport = await getTransport();
    const swap: Swap = new Swap(transport);
    const btc: Btc = new Btc(transport);
    const transactionId: string = await swap.startNewTransaction();
    await swap.setPartnerKey(partnerSerializedNameAndPubKey);
    await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
    var tr = new proto.ledger_swap.NewTransactionResponse();
    tr.setPayinAddress("2324234324324234");
    tr.setPayinExtraId("");
    tr.setRefundAddress("sfdsfdsfsdfdsfsdf");
    tr.setRefundExtraId("");
    tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
    tr.setPayoutExtraId("");
    tr.setCurrencyFrom("BTC");
    tr.setCurrencyTo("LTC");
    // 1 BTC to 10 LTC
    tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
    tr.setAmountToWallet(numberToBigEndianBuffer(1000000000));
    tr.setDeviceTransactionId(transactionId);

    const payload: Buffer = Buffer.from(tr.serializeBinary());
    await swap.processTransaction(payload, 10000000);
    const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
    const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
    await swap.checkTransactionSignature(signature);
    const ltcAddressParams = await getSerializedAddressParametersBTC("49'/0'/0'/0/0");
    await swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, ltcAddressParams.addressParameters);

    const btcAddressParams = await getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
    await expect(swap.checkRefundAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters))
        .rejects.toEqual(new Error("Swap application report error INVALID_ADDRESS"));
})


test('Valid refund address should be accepted', async () => {
    jest.setTimeout(100000);
    let transport = await getTransport();
    const swap: Swap = new Swap(transport);
    const btc: Btc = new Btc(transport);
    const transactionId: string = await swap.startNewTransaction();
    await swap.setPartnerKey(partnerSerializedNameAndPubKey);
    await swap.checkPartner(DERSignatureOfPartnerNameAndPublicKey);
    var tr = new proto.ledger_swap.NewTransactionResponse();
    tr.setPayinAddress("2324234324324234");
    tr.setPayinExtraId("");
    tr.setRefundAddress("bc1qwpgezdcy7g6khsald7cww42lva5g5dmasn6y2z");
    tr.setRefundExtraId("");
    tr.setPayoutAddress("LKtSt6xfsmJMkPT8YyViAsDeRh7k8UfNjD");
    tr.setPayoutExtraId("");
    tr.setCurrencyFrom("BTC");
    tr.setCurrencyTo("LTC");
    // 1 BTC to 10 LTC
    tr.setAmountToProvider(numberToBigEndianBuffer(100000000));
    tr.setAmountToWallet(numberToBigEndianBuffer(1000000000));
    tr.setDeviceTransactionId(transactionId);

    const payload: Buffer = Buffer.from(tr.serializeBinary());
    await swap.processTransaction(payload, 10000000);
    const digest: Buffer = Buffer.from(sha256.sha256.array(payload));
    const signature: Buffer = secp256k1.signatureExport(secp256k1.sign(digest, swapTestPrivateKey).signature);
    await swap.checkTransactionSignature(signature);
    const ltcAddressParams = await getSerializedAddressParametersBTC("49'/0'/0'/0/0");
    await swap.checkPayoutAddress(LTCConfig, LTCConfigSignature, ltcAddressParams.addressParameters);

    const btcAddressParams = await getSerializedAddressParametersBTC("84'/0'/0'/1/0", "bech32");
    await expect(swap.checkRefundAddress(BTCConfig, BTCConfigSignature, btcAddressParams.addressParameters)).resolves.toBe(undefined);
})