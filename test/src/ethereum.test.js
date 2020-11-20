import "core-js/stable";
import "regenerator-runtime/runtime";
import { bip32asBuffer } from "./bip32";
import { byContractAddress } from "@ledgerhq/hw-app-eth/erc20";
import Eth from "@ledgerhq/hw-app-eth";

export function getSerializedAddressParametersETH(
    path: string
): { addressParameters: Buffer } {
    const addressParameters = bip32asBuffer(path);
    return { addressParameters };
}
