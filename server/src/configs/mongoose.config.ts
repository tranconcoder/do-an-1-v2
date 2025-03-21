import mongoose from 'mongoose';

export const required = true,
    unique = true;

export const timestamps = {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};

const ObjectId = mongoose.Schema.Types.ObjectId;

ObjectId.get((x) => x.toString());
ObjectId.prototype.valueOf = function () {
    return this.toString();
};
ObjectId.prototype.get = function () {
    return this.toString() as any;
};

export { ObjectId };
