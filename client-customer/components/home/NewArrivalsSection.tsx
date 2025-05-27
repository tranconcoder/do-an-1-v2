import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewArrivalsSection() {
    return (
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Hàng mới về</h2>
                    <Button variant="ghost" className="text-blue-600 gap-1">
                        Xem tất cả <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* {newArrivals.map((product) => (
            <div key={product.id} className="group">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {product.isNew && <Badge className="absolute top-2 left-2 bg-blue-600">Mới</Badge>}
                <Button
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Thêm vào danh sách yêu thích</span>
                </Button>
              </div>
              <div>
                <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">{product.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="font-semibold">${product.price.toFixed(2)}</div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="sr-only">Thêm vào giỏ hàng</span>
                  </Button>
                </div>
              </div>
            </div>
          ))} */}
                </div>
            </div>
        </section>
    );
}
