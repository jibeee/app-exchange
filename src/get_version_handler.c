#include "get_version_handler.h"

int get_version_handler(swap_app_context_t *ctx __attribute__((unused)),
                        const command_t *cmd __attribute__((unused)),
                        SendFunction send) {
    unsigned char output_buffer[5];
    output_buffer[0] = LEDGER_MAJOR_VERSION;
    output_buffer[1] = LEDGER_MINOR_VERSION;
    output_buffer[2] = LEDGER_PATCH_VERSION;
    output_buffer[3] = 0x90;
    output_buffer[4] = 0x00;
    if (send(output_buffer, 5) < 0) {
        return -1;
    }
    return 0;
}
