import { ConsoleLogger, Injectable } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
export class AuthLoggerService extends ConsoleLogger {
  log(message: string) {
    super.log(chalk.green(`[LOG] ${new Date().toISOString()} — ${message}`));
  }

  debug(message: string) {
    super.debug(chalk.cyan(`[DEBUG] ${new Date().toISOString()} — ${message}`));
  }

  warn(message: string) {
    super.warn(chalk.yellow(`[WARN] ${new Date().toISOString()} — ${message}`));
  }

  error(message: string, trace?: string) {
    super.error(chalk.red(`[ERROR] ${new Date().toISOString()} — ${message}`));
    if (trace) {
      super.error(chalk.gray(trace));
    }
  }

  verbose(message: string) {
    super.verbose(chalk.magenta(`[VERBOSE] ${new Date().toISOString()} — ${message}`));
  }
}
