import "";


declare global {
    namespace service {
        namespace location {
            interface CreateLocation {
                provinceId: string;
                cityId: string;
                districtId?: string;
                address: string;
            }
        }
    }
}
