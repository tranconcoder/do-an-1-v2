import { StatusCodes } from 'http-status-codes';

// Libs
import _ from 'lodash';

export default class ErrorResponse {
    public readonly file: commonTypes.string.StringOrUndefined;
    public readonly statusCode: StatusCodes;
    public readonly name: commonTypes.string.StringOrUndefined;
    public readonly message: commonTypes.string.StringOrUndefined;
    public hideOnProduction: boolean;
    public readonly routePath: commonTypes.string.StringOrUndefined;
    public readonly metadata: commonTypes.object.ObjectAnyKeys;

    public constructor({
        statusCode,
        name = 'ErrorResponse',
        message = StatusCodes[statusCode],
        hideOnProduction = true,
        metadata = {},
        routePath = undefined
    }: {
        statusCode: StatusCodes;
        name?: string;
        message?: commonTypes.string.StringOrUndefined;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
        routePath?: commonTypes.string.StringOrUndefined;
    }) {
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
        this.hideOnProduction = hideOnProduction;
        this.routePath = routePath;
        this.metadata = metadata;
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
        const pickList = ['statusCode', 'name', 'message'];

        if (Object.keys(this.metadata).length) pickList.push('metadata');

        return _.pick(this, pickList);
    }

    public toString() {
        const hideOnProductTitle = this.hideOnProduction ? 'HIDE' : 'VISIBLE';

        return `${hideOnProductTitle}::${this.statusCode}::${this.name}::${this.message}::`;
    }
}

export class InternalServerErrorResponse extends ErrorResponse {
    public constructor({
        message = StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR],
        hideOnProduction = true,
        metadata = {}
    }: {
        message?: string;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
    } = {}) {
        super({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            name: 'InternalServerError',
            message,
            hideOnProduction,
            metadata
        });
    }
}

export class BadRequestErrorResponse extends ErrorResponse {
    public constructor({
        message = StatusCodes[StatusCodes.BAD_REQUEST],
        hideOnProduction = true,
        metadata = {}
    }: {
        message?: string;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
    } = {}) {
        super({
            statusCode: StatusCodes.BAD_REQUEST,
            name: 'BadRequest',
            message,
            hideOnProduction,
            metadata
        });
    }
}

export class UnauthorizedErrorResponse extends ErrorResponse {
    public constructor({
        message = StatusCodes[StatusCodes.UNAUTHORIZED],
        hideOnProduction = true,
        metadata = {}
    }: {
        message?: string;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
    } = {}) {
        super({
            statusCode: StatusCodes.UNAUTHORIZED,
            name: 'Unauthorized',
            message,
            hideOnProduction,
            metadata
        });
    }
}

export class NotFoundErrorResponse extends ErrorResponse {
    public constructor({
        message = StatusCodes[StatusCodes.NOT_FOUND],
        hideOnProduction = true,
        metadata = {}
    }: {
        message?: string;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
    } = {}) {
        super({
            statusCode: StatusCodes.NOT_FOUND,
            name: 'NotFound',
            message,
            hideOnProduction,
            metadata
        });
    }
}

export class ForbiddenErrorResponse extends ErrorResponse {
    public constructor({
        message = StatusCodes[StatusCodes.FORBIDDEN],
        hideOnProduction = true,
        metadata = {}
    }: {
        message?: string;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
    } = {}) {
        super({
            statusCode: StatusCodes.FORBIDDEN,
            name: 'Forbidden',
            message,
            hideOnProduction,
            metadata
        });
    }
}

export class ConflictErrorResponse extends ErrorResponse {
    public constructor({
        message = StatusCodes[StatusCodes.CONFLICT],
        hideOnProduction = true,
        metadata = {}
    }: {
        message?: string;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
    } = {}) {
        super({
            statusCode: StatusCodes.CONFLICT,
            name: 'Conflict',
            message,
            hideOnProduction,
            metadata
        });
    }
}

export class InvalidPayloadErrorResponse extends ErrorResponse {
    public constructor({
        message = StatusCodes[StatusCodes.BAD_REQUEST],
        hideOnProduction = true,
        metadata = {}
    }: {
        message?: string;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
    } = {}) {
        super({
            statusCode: StatusCodes.BAD_REQUEST,
            name: 'InvalidPayload',
            message,
            hideOnProduction,
            metadata
        });
    }
}
