import { findOneUser } from '@/models/repository/user/index.js';
import bcrypt from 'bcrypt';
import { ForbiddenErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import { RequestWithBody } from '@/types/request.js';

export const checkCustomerAccountToRegisterShop: RequestWithBody<
    joiTypes.auth.LoginSchema
> = async (req, _, next) => {
    const { phoneNumber, password } = req.body;

    /* -------------- Check if user is exists ------------- */
    const user = await findOneUser({ query: { phoneNumber }, select: ['password'] });
    if (!user) throw new NotFoundErrorResponse({ message: 'Username or password is not correct!' });

    /* ------------------ Check password ------------------ */
    const hashPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(password, hashPassword);
    if (!isPasswordMatch)
        throw new ForbiddenErrorResponse({ message: 'Username or password is not correct!' });

    req.userId = user._id;
    req.role = user.user_role.toString();

    next();
};
