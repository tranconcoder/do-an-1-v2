import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function SpecialOfferSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 -z-10" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-blue-600 -z-10" />
          <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className="space-y-4">
              <Badge className="bg-white text-blue-600 hover:bg-white/90">Ưu đãi có hạn</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900">Giảm 20% cho Bộ sưu tập mùa hè</h2>
              <p className="text-blue-700">Sử dụng mã SUMMER20 khi thanh toán. Ưu đãi có hiệu lực đến hết ngày 31 tháng 8.</p>
              <Button className="bg-white text-blue-600 hover:bg-white/90">Mua sắm bộ sưu tập</Button>
            </div>
            <div className="relative h-[200px] md:h-[300px] rounded-xl overflow-hidden">
              <Image
                src="/sale.jpg?height=600&width=600"
                alt="Bộ sưu tập mùa hè"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 