"use client";

import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/ui/ImageSlider"
import { Heart, ShoppingCart, Badge} from "lucide-react"
import { Input } from "@/components/ui/input"
import { categoryService, Category } from "@/lib/services/api/categoryService"
import { mediaService } from "@/lib/services/api/mediaService"
import { spuService, SPU } from "@/lib/services/api/spuService";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  // Sample images for the hero slider
  const heroImages = [
    "/hero-1.jpg",
    "/hero-2.jpg",
    "/hero-3.jpg",
    "/hero-4.jpg",
    "/hero-5.jpg",
  ]
  const heroImageAlts = [
    "Hero image 1",
    "Hero image 2",
    "Hero image 3",
    "Hero image 4",
    "Hero image 5",
  ]

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [errorCategories, setErrorCategories] = useState<string | null>(null)

  const [popularProducts, setPopularProducts] = useState<SPU[]>([]);
  const [isLoadingPopularProducts, setIsLoadingPopularProducts] = useState(true);
  const [errorPopularProducts, setErrorPopularProducts] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const fetchedCategories = await categoryService.getAllCategories()
        setCategories(fetchedCategories)
        setErrorCategories(null)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setErrorCategories("Không thể tải danh mục. Vui lòng thử lại sau.")
      }
      setIsLoadingCategories(false)
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setIsLoadingPopularProducts(true);
        const fetchedProducts = await spuService.getPopularProducts();
        setPopularProducts(fetchedProducts);
        setErrorPopularProducts(null);
      } catch (error) {
        console.error("Failed to fetch popular products:", error);
        setErrorPopularProducts("Không thể tải sản phẩm phổ biến. Vui lòng thử lại sau.");
      }
      setIsLoadingPopularProducts(false);
    };

    fetchPopularProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-400/20 -z-10" />
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Khám phá {" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Xu hướng</span> mới nhất
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Mua sắm những phong cách và bộ sưu tập mới nhất với giao hàng miễn phí cho đơn hàng trên $50.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                  Mua ngay
                </Button>
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  Khám phá bộ sưu tập
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-xl">
              <ImageSlider 
                images={heroImages} 
                imageAltText={heroImageAlts}
                imageHeightClass="h-[300px] md:h-[400px]"
                roundedClass="rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Danh mục</h2>
              <Button variant="ghost" className="text-blue-600 gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoadingCategories && Array.from({ length: 4 }).map((_, index) => (
                // Skeleton loader for categories
                <div key={index} className="group relative h-40 rounded-xl overflow-hidden bg-gray-200 animate-pulse">
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
              {!isLoadingCategories && errorCategories && (
                <div className="col-span-full text-center text-red-500">
                  <p>{errorCategories}</p>
                </div>
              )}
              {!isLoadingCategories && !errorCategories && categories.slice(0, 4).map((category) => (
                <Link key={category._id} href={`/category/${category._id}`} className="group relative h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 p-[10px] shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
                  <Image
                    src={mediaService.getMediaUrl(category.category_icon)}
                    alt={category.category_name}
                    fill
                    className="object-contain transition-transform group-hover:scale-105 m-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-75 group-hover:opacity-50 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-[10px]">
                    <h3 className="text-white font-medium text-center truncate">{category.category_name}</h3>
                  </div>
                </Link>
              ))}
              {!isLoadingCategories && !errorCategories && categories.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                  <p>Không tìm thấy danh mục nào.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Sản phẩm phổ biến</h2>
              <Button variant="ghost" className="text-blue-600 gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoadingPopularProducts && Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="group animate-pulse">
                  <Skeleton className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 mb-3 h-[200px] w-full" />
                  <Skeleton className="h-5 w-3/4 mt-1" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </div>
              ))}
              {!isLoadingPopularProducts && errorPopularProducts && (
                <div className="col-span-full text-center text-red-500">
                  <p>{errorPopularProducts}</p>
                </div>
              )}
              {!isLoadingPopularProducts && !errorPopularProducts && popularProducts.map((product) => (
                <div key={product._id} className="group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                    <Image
                      src={mediaService.getMediaUrl(product.product_thumb) || "/placeholder.svg"}
                      alt={product.product_name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <Button
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Thêm vào danh sách yêu thích</span>
                    </Button>
                  </div>
                  <div>
                    <Link href={`/products/${product._id}${product.sku ? `?sku=${product.sku._id}` : ''}`} className="hover:text-blue-600">
                      <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors truncate">
                        {product.product_name}
                      </h3>
                    </Link>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <span>Đã bán: {product.product_sold}</span>
                      <span className="mx-1">|</span>
                      <span>
                        Đánh giá: {product.product_rating_avg.toFixed(1)} ⭐
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="font-semibold">
                        {/* Assuming sku.sku_price is available and is a number. Adjust formatting as needed. */}
                        {product.sku?.sku_price ? `${product.sku.sku_price.toLocaleString('vi-VN')}₫` : 'N/A'}
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Thêm vào giỏ hàng</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {!isLoadingPopularProducts && !errorPopularProducts && popularProducts.length === 0 && (
                 <div className="col-span-full text-center text-gray-500">
                   <p>Không tìm thấy sản phẩm phổ biến nào.</p>
                 </div>
              )}
            </div>
          </div>
        </section>

        {/* Special Offer */}
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
                    src="/placeholder.svg?height=600&width=600"
                    alt="Bộ sưu tập mùa hè"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Hàng mới về</h2>
              <Button variant="ghost" className="text-blue-600 gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
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
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="p-8 md:p-12 rounded-2xl backdrop-blur-md bg-white/70 border border-blue-100 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Đăng ký nhận bản tin của chúng tôi</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Luôn cập nhật những xu hướng mới nhất, hàng mới về và các ưu đãi độc quyền.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input type="email" placeholder="Nhập email của bạn" className="flex-1 bg-white border-blue-100" />
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-blue-50 border-t border-blue-100 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="inline-block mb-4">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Aliconcon
                </span>
              </Link>
              <p className="text-gray-600 mb-4 max-w-xs">
                Điểm đến duy nhất của bạn cho thời trang và phụ kiện theo xu hướng với giá cả phải chăng.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-facebook"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-instagram"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-twitter"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Mua sắm</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Hàng mới về
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Bán chạy nhất
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Xu hướng hiện tại
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Giảm giá
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Tất cả bộ sưu tập
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Dịch vụ khách hàng</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Liên hệ với chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Vận chuyển & Trả hàng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Hướng dẫn chọn size
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Theo dõi đơn hàng
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Về chúng tôi</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Câu chuyện của chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Tuyển dụng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Bền vững
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Báo chí
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-100 pt-8 text-center text-gray-500 text-sm">
            <p>© 2023 Aliconcon. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Sample data
const products = [
  {
    id: 1,
    name: "Áo phông trắng cổ điển",
    price: 29.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 2,
    name: "Quần jean dáng slim fit",
    price: 59.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 3,
    name: "Túi đeo chéo da",
    price: 79.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 4,
    name: "Áo hoodie dáng rộng",
    price: 49.99,
    image: "/placeholder.svg?height=400&width=400",
  },
]

const newArrivals = [
  {
    id: 5,
    name: "Đầm hoa mùa hè",
    price: 69.99,
    image: "/placeholder.svg?height=400&width=400",
    isNew: true,
  },
  {
    id: 6,
    name: "Giày sneaker vải canvas",
    price: 45.99,
    image: "/placeholder.svg?height=400&width=400",
    isNew: true,
  },
  {
    id: 7,
    name: "Mũ cói đi biển",
    price: 24.99,
    image: "/placeholder.svg?height=400&width=400",
    isNew: true,
  },
  {
    id: 8,
    name: "Áo sơ mi linen",
    price: 39.99,
    image: "/placeholder.svg?height=400&width=400",
    isNew: true,
  },
]
