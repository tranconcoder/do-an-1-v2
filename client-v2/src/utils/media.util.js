import { API_URL } from "../configs/env.config";

export const getMediaUrl = (id) => {
    return `${API_URL}/media/${id}`;
}