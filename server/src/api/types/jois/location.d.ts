import '';

declare global {
    namespace joi {
        namespace location {
            interface CreateLocation extends service.location.CreateLocation {}
        }
    }
}
