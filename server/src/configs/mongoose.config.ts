import mongoose from "mongoose";

export const required = true,
    unique = true;

export const timestamps = {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};

export const ObjectId = mongoose.Schema.Types.ObjectId;
