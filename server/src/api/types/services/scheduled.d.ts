import { CronJob } from 'cron';

declare global {
    namespace service {
        namespace scheduled {
            /* ====================================================== */
            /*                   FUNCTION ARGUMENTS                   */
            /* ====================================================== */
            namespace arguments {
                type GetCronOption = Parameters<typeof CronJob.from>[0];
            }
        }
    }
}
