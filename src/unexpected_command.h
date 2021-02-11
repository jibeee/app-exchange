#ifndef _UNEXPECTED_COMMAND_H_
#define _UNEXPECTED_COMMAND_H_

#include "swap_app_context.h"
#include "send_function.h"
#include "commands.h"

int unexpected_command(rate_e P1,
                       subcommand_e P2,
                       swap_app_context_t *ctx,
                       const buf_t *input,
                       SendFunction send);

#endif  //_UNEXPECTED_COMMAND_H_
