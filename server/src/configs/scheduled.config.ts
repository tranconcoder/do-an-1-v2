import LoggerService from '../api/services/logger.service';

export const TIMEZONE = 'Asia/Ho_Chi_Minh';

const CRON_TIME_DEV = '* * * * *';

// Cleanup key token scheduled
export const CLEAN_UP_KEY_TOKEN_CRON_TIME =
    process.env.CLEAN_UP_KEY_TOKEN_CRON_TIME || CRON_TIME_DEV;

// Cleanup product remove failed scheduled
export const CLEAN_UP_PRODUCT_CRON_TIME =
    process.env.CLEAN_UP_PRODUCT_CRON_TIME || CRON_TIME_DEV;

export const getCronOptions = (
    options: serviceTypes.scheduled.arguments.GetCronOption
) => {
    return {
        timeZone: TIMEZONE,
        start: false,
        waitForCompletion: true,
        errorHandler: (error: unknown) => {
            let message = 'Error: cleanup key token';

            if (error instanceof Error) {
                message = error.message;
            }

            LoggerService.getInstance().error(message);
        },
        ...options
    } as serviceTypes.scheduled.arguments.GetCronOption;
};
