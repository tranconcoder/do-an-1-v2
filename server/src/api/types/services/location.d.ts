import type { CreateLocation as CreateLocationSchema } from "@/validations/zod/location.zod";

declare global {
    namespace service {
        namespace location {
            interface CreateLocation extends CreateLocationSchema {
            }
        }
    }
}
