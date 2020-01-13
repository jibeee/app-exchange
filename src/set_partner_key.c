#include "set_partner_key.h"
#include "os.h"
#include "swap_errors.h"
#include "der_serialization.h"
#include "globals.h"
#include "reply_error.h"

int set_partner_key(
    swap_app_context_t* ctx,
    unsigned char* input_buffer, int input_buffer_length,
    SendFunction send) {
    // data is serialized as
    // 1 byte - partner name length L
    // L bytes - partner name
    // 33 bytes - partner public key
    // 70 bytes - DER serialized signature
    if (input_buffer_length < 1) {
        PRINTF("Error: Input buffer is too small");
        return reply_error(ctx, INCORRECT_COMMAND_DATA, send);
    }
    ctx->partner.name_length = input_buffer[0];
    const unsigned char name_offset = 1;
    const unsigned char pub_key_offset = name_offset + ctx->partner.name_length;
    const unsigned char sign_offset = pub_key_offset + PUB_KEY_LENGTH;
    const unsigned char signed_data_length = 1 + ctx->partner.name_length + PUB_KEY_LENGTH;
    if (sign_offset + DER_SIGNATURE_LENGTH > input_buffer_length) {
        PRINTF("Error: Input buffer is too small to contain correct SET_PARTNER_KEY message");
        return reply_error(ctx, INCORRECT_COMMAND_DATA, send);
    }
    if ((ctx->partner.name_length < 3) || (ctx->partner.name_length > 15)) {
        PRINTF("Error: Partner name length should be in [3, 15]");
        return reply_error(ctx, INCORRECT_COMMAND_DATA, send);
    }
    // check signature
    unsigned char hash[CURVE_SIZE_BYTES];
    cx_hash_sha256(input_buffer, signed_data_length, hash, CURVE_SIZE_BYTES);
    if (cx_ecdsa_verify(&ctx->ledger_public_key, CX_LAST, CX_SHA256, hash, CURVE_SIZE_BYTES, input_buffer + sign_offset, DER_SIGNATURE_LENGTH) == 0) {
        PRINTF("Error: Fail to verify signature of partner name and public key");
        return reply_error(ctx, SIGN_VERIFICATION_FAIL, send);
    }
    os_memcpy(ctx->partner.name, input_buffer + name_offset, ctx->partner.name_length);
    cx_ecfp_init_public_key(CX_CURVE_SECP256K1, input_buffer + pub_key_offset, PUB_KEY_LENGTH, &ctx->partner.public_key);
    
    unsigned char ouput_buffer[2] = { 0x90, 0x00 };
    if (send(ouput_buffer, 2) < 0) {
        PRINTF("Error: failed to send");
        return -1;
    }
    ctx->state = PROVIDER_SET;
    return 0;
}