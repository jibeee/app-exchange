#ifndef _COMMANDS_H_
#define _COMMANDS_H_

#include "buffer.h"
// commands
typedef enum {
    GET_VERSION_COMMAND = 0x02,
    START_NEW_TRANSACTION_COMMAND = 0x03,
    SET_PARTNER_KEY_COMMAND = 0x04,
    CHECK_PARTNER_COMMAND = 0x05,
    PROCESS_TRANSACTION_RESPONSE_COMMAND = 0x06,
    CHECK_TRANSACTION_SIGNATURE_COMMAND = 0x07,
    CHECK_PAYOUT_ADDRESS = 0x08,  // CHECK_ASSET_IN for SELL
    CHECK_REFUND_ADDRESS = 0x09,
    START_SIGNING_TRANSACTION = 0x0A,
} command_e;

// subcommands
typedef enum { SWAP = 0x00, SELL = 0x01, FUND = 0x02 } subcommand_e;

// Different rates possible
typedef enum { FIXED = 0x00, FLOATING = 0x01 } rate_e;

/**
 * Structure with fields of APDU command.
 */
typedef struct {
    command_e ins;            /// Instruction code
    rate_e rate;              /// P1
    subcommand_e subcommand;  /// P2
    buf_t data;               /// Command data
} command_t;

#endif  //_COMMANDS_H_
