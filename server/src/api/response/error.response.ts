import { StatusCodes } from 'http-status-codes';

// Libs
import _ from 'lodash';

export default class ErrorResponse {
    public readonly statusCode: StatusCodes;
    public readonly name: commonTypes.string.StringOrUndefined;
    public readonly message: commonTypes.string.StringOrUndefined;
    public hideOnProduction: boolean;
    public readonly routePath: commonTypes.string.StringOrUndefined;
    public readonly metadata: commonTypes.object.ObjectAnyKeys;
    public readonly stack: string;

    public constructor({
        statusCode,
        name = 'ErrorResponse',
        message = StatusCodes[statusCode],
        hideOnProduction = true,
        metadata = {},
        routePath = undefined,
        stack = new Error().stack as string
    }: {
        statusCode: StatusCodes;
        name?: string;
        message?: commonTypes.string.StringOrUndefined;
        hideOnProduction?: boolean;
        metadata?: commonTypes.object.ObjectAnyKeys;
        routePath?: commonTypes.string.StringOrUndefined;
        stack?: string;
    }) {
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
        this.hideOnProduction = hideOnProduction;
        this.routePath = routePath;
        this.metadata = metadata;
        this.stack = stack;
    }
    public get() {
        const pickList = ['statusCode', 'name', 'message', 'routePath', 'stack'];

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
