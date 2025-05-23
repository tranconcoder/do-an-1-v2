import { generateValidateWithBody } from "@/middlewares/zod.middleware.js";
import { z } from "zod";

/* ---------------------------------------------------------- */
/*                       Update profile                       */
/* ---------------------------------------------------------- */
export const updateProfileSchema = z.object({
    user_fullName: z.string().optional(),
    user_email: z.string().email().optional(),
    user_sex: z.string().optional(),
    user_dayOfBirth: z.string().optional().refine((val) => {
        if (!val) return true;
        const dayOfBirth = new Date(val);
        return dayOfBirth < new Date();
    }, {
        message: 'Day of birth is in the future!',
    }),
});
export type updateProfileSchema = z.infer<typeof updateProfileSchema>;
export const validateUpdateprofile = generateValidateWithBody(updateProfileSchema)

/* ---------------------------------------------------------- */
/*                   Update profile by admin                  */
/* ---------------------------------------------------------- */
export const updateProfileByAdminSchema = updateProfileSchema.extend({
    user_role: z.string().optional(),
    user_status: z.string().optional(),
});
export type updateProfileByAdminSchema = z.infer<typeof updateProfileByAdminSchema>;
export const validateUpdateprofileByAdmin = generateValidateWithBody(updateProfileByAdminSchema)
