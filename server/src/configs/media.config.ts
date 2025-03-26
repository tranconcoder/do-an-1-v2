import bytes from "bytes"
import path from "path"

export const AVATAR_MAX_SIZE = bytes.parse("5MB") || 5 * 1024 * 1024;

export const AVATAR_BASE_PATH = path.join(import.meta.dirname, "../../public/avatars");
