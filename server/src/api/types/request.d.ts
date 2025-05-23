import type { RequestHandler } from 'express';

export interface RequestWithBody<T> extends RequestHandler<any, any, T> {}

export interface RequestWithParams<T> extends RequestHandler<T, any, any> {}

export interface RequestWithQuery<T>
    extends RequestHandler<any, any, any, qs.ParsedQs & T, T> {}
