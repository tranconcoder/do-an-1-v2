import { StatusCodes } from 'http-status-codes';

// Libs
import _ from 'lodash';

export default class ErrorResponse {
    private readonly file: commonTypes.string.StringOrUndefined;

    public constructor(
        public readonly statusCode: StatusCodes,
        public readonly name: string = 'ErrorResponse',
        public readonly message: commonTypes.string.StringOrUndefined = StatusCodes[
            statusCode
        ],
        public readonly hideOnProduction: boolean = true,
        public readonly routePath: commonTypes.string.StringOrUndefined = undefined
    ) {
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
        this.hideOnProduction = hideOnProduction;
        this.routePath = routePath;
        this.file = new Error()?.stack
            ?.split('\n')
            ?.at(2)
            ?.split('/')
            ?.slice(-2)
            ?.join('/')
            ?.slice(0, -1);

        if (this.file && !this.file.includes('index')) {
            this.file = this.file.split('/').at(-1);
        }
    }
    public get() {
        return _.pick(this, ['statusCode', 'name', 'message']);
    }

    public toString() {
        const hideOnProductTitle = this.hideOnProduction ? 'HIDE' : 'VISIBLE';

        return `${hideOnProductTitle}::${this.statusCode}::${this.name}::${this.message}::`;
    }
}

export class InternalServerErrorResponse extends ErrorResponse {
    public constructor(
        message: string = StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR],
        hideOnProduction: boolean = true
    ) {
        super(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'InternalServerError',
            message,
            hideOnProduction
        );
    }
}

export class BadRequestErrorResponse extends ErrorResponse {
    public constructor(
        message: string = StatusCodes[StatusCodes.BAD_REQUEST],
        hideOnProduction: boolean = true
    ) {
        super(StatusCodes.BAD_REQUEST, 'BadRequest', message, hideOnProduction);
    }
}

export class UnauthorizedErrorResponse extends ErrorResponse {
    public constructor(
        message: string = StatusCodes[StatusCodes.UNAUTHORIZED]
    ) {
        super(StatusCodes.UNAUTHORIZED, 'Unauthorized', message);
    }
}

export class NotFoundErrorResponse extends ErrorResponse {
    public constructor(
        message: string = StatusCodes[StatusCodes.NOT_FOUND],
        hideOnProduction: boolean = true
    ) {
        super(StatusCodes.NOT_FOUND, 'NotFound', message, hideOnProduction);
    }
}

export class ForbiddenErrorResponse extends ErrorResponse {
    public constructor(
        message: string = StatusCodes[StatusCodes.FORBIDDEN],
        hideOnProduction: boolean = true
    ) {
        super(StatusCodes.FORBIDDEN, 'Forbidden', message, hideOnProduction);
    }
}

export class ConflictErrorResponse extends ErrorResponse {
    public constructor(
        message: string = StatusCodes[StatusCodes.CONFLICT],
        hideOnProduction: boolean = true
    ) {
        super(StatusCodes.CONFLICT, 'Conflict', message, hideOnProduction);
    }
}

export class InvalidPayloadErrorResponse extends ErrorResponse {
    public constructor(
        message: string = StatusCodes[StatusCodes.BAD_REQUEST],
        hideOnProduction: boolean = true
    ) {
        super(
            StatusCodes.BAD_REQUEST,
            'InvalidPayload',
            message,
            hideOnProduction
        );
    }
}
