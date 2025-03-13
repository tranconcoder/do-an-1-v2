import '';

declare global {
    namespace repoTypes {
        namespace product {
            interface FindAllProductId
                extends Omit<
                    moduleTypes.mongoose.FindAllWithPageSlittingArgs,
                    'query' | "select"
                > {}
        }
    }
}
