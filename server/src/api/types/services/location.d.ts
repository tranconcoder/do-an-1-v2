import '';

declare global {
    namespace service {
        namespace location {
            interface CreateLocation {
                provinceId: string;
                districtId: string;
                wardId?: string;
                address: string;
            }
        }
    }
}
