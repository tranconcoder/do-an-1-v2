import { CronJob } from 'cron';

declare global {
    namespace serviceTypes {
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
