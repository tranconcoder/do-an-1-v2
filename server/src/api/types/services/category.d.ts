import '';

declare global {
    namespace service {
        namespace category {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {}

            /* ------------------------------------------------------ */
            /*                   Function arguments                   */
            /* ------------------------------------------------------ */
            namespace arguments {
                interface CreateCategory
                    extends Pick<
                        model.category.Category,
                        | 'category_description'
                        | 'category_icon'
                        | 'category_level'
                        | 'category_name'
                        | 'category_order'
                        | 'category_parent'
                        | 'category_product_count'
                    > {}
            }
        }
    }
}
