import "";

declare global {
    namespace repo {
        namespace sku {
            interface  GetSKUOfSKU {
                spuId: string;
            }

            interface CheckSKUListAvailable {
                skuList: string[];
            }
        }
    }
}