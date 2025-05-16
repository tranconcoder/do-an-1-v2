"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Minus, Plus, ShoppingCart, Star, ChevronRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Mock data based on the provided schema
const mockProduct = {
  _id: "product123",
  product_name: "Premium Cotton T-Shirt",
  product_quantity: 100,
  product_description: `
    <p>Our Premium Cotton T-Shirt is crafted from the finest 100% organic cotton, providing exceptional comfort and durability. The breathable fabric ensures you stay cool and comfortable all day long.</p>
    <p>Features:</p>
    <ul>
      <li>100% organic cotton</li>
      <li>Reinforced stitching for durability</li>
      <li>Pre-shrunk fabric</li>
      <li>Eco-friendly dyes</li>
      <li>Tagless design for maximum comfort</li>
    </ul>
    <p>This versatile t-shirt is perfect for casual everyday wear or can be dressed up for a more polished look. Available in multiple colors and sizes to suit your style.</p>
  `,
  product_category: { _id: "cat123", name: "Clothing" },
  product_shop: { _id: "shop123", name: "Fashion Outlet" },
  product_rating_avg: 4.7,
  product_slug: "premium-cotton-t-shirt",
  product_thumb: { _id: "thumb123", url: "/placeholder.svg?height=600&width=600" },
  product_images: [
    { _id: "img1", url: "/placeholder.svg?height=600&width=600" },
    { _id: "img2", url: "/placeholder.svg?height=600&width=600&text=Image+2" },
    { _id: "img3", url: "/placeholder.svg?height=600&width=600&text=Image+3" },
    { _id: "img4", url: "/placeholder.svg?height=600&width=600&text=Image+4" },
  ],
  product_attributes: [
    { attr_id: "attr1", attr_name: "Material", attr_value: "100% Cotton" },
    { attr_id: "attr2", attr_name: "Weight", attr_value: "180g" },
    { attr_id: "attr3", attr_name: "Care", attr_value: "Machine wash cold" },
  ],
  product_variations: [
    {
      variation_id: "var1",
      variation_name: "Size",
      variation_values: ["S", "M", "L", "XL", "XXL"],
      variation_images: [], // Size doesn't have specific images
    },
    {
      variation_id: "var2",
      variation_name: "Color",
      variation_values: ["White", "Black", "Blue", "Red", "Green"],
      variation_images: [
        { _id: "varimg1", url: "/placeholder.svg?height=600&width=600&text=White" },
        { _id: "varimg2", url: "/placeholder.svg?height=600&width=600&text=Black" },
        { _id: "varimg3", url: "/placeholder.svg?height=600&width=600&text=Blue" },
        { _id: "varimg4", url: "/placeholder.svg?height=600&width=600&text=Red" },
        { _id: "varimg5", url: "/placeholder.svg?height=600&width=600&text=Green" },
      ],
    },
  ],
  is_draft: false,
  is_publish: true,
}

// Mock SKUs based on the provided schema
const mockSkus = [
  {
    _id: "sku1",
    sku_product: "product123",
    sku_price: 29.99,
    sku_stock: 50,
    sku_thumb: { _id: "skuthumb1", url: "/placeholder.svg?height=600&width=600&text=White+S" },
    sku_images: [],
    sku_tier_idx: [0, 0], // Size S, Color White
  },
  {
    _id: "sku2",
    sku_product: "product123",
    sku_price: 29.99,
    sku_stock: 45,
    sku_thumb: { _id: "skuthumb2", url: "/placeholder.svg?height=600&width=600&text=White+M" },
    sku_images: [],
    sku_tier_idx: [1, 0], // Size M, Color White
  },
  {
    _id: "sku3",
    sku_product: "product123",
    sku_price: 29.99,
    sku_stock: 30,
    sku_thumb: { _id: "skuthumb3", url: "/placeholder.svg?height=600&width=600&text=White+L" },
    sku_images: [],
    sku_tier_idx: [2, 0], // Size L, Color White
  },
  {
    _id: "sku4",
    sku_product: "product123",
    sku_price: 32.99,
    sku_stock: 25,
    sku_thumb: { _id: "skuthumb4", url: "/placeholder.svg?height=600&width=600&text=Black+S" },
    sku_images: [],
    sku_tier_idx: [0, 1], // Size S, Color Black
  },
  {
    _id: "sku5",
    sku_product: "product123",
    sku_price: 32.99,
    sku_stock: 40,
    sku_thumb: { _id: "skuthumb5", url: "/placeholder.svg?height=600&width=600&text=Black+M" },
    sku_images: [],
    sku_tier_idx: [1, 1], // Size M, Color Black
  },
  {
    _id: "sku6",
    sku_product: "product123",
    sku_price: 32.99,
    sku_stock: 35,
    sku_thumb: { _id: "skuthumb6", url: "/placeholder.svg?height=600&width=600&text=Black+L" },
    sku_images: [],
    sku_tier_idx: [2, 1], // Size L, Color Black
  },
  {
    _id: "sku7",
    sku_product: "product123",
    sku_price: 34.99,
    sku_stock: 20,
    sku_thumb: { _id: "skuthumb7", url: "/placeholder.svg?height=600&width=600&text=Blue+M" },
    sku_images: [],
    sku_tier_idx: [1, 2], // Size M, Color Blue
  },
  {
    _id: "sku8",
    sku_product: "product123",
    sku_price: 34.99,
    sku_stock: 15,
    sku_thumb: { _id: "skuthumb8", url: "/placeholder.svg?height=600&width=600&text=Blue+L" },
    sku_images: [],
    sku_tier_idx: [2, 2], // Size L, Color Blue
  },
  {
    _id: "sku9",
    sku_product: "product123",
    sku_price: 34.99,
    sku_stock: 0, // Out of stock
    sku_thumb: { _id: "skuthumb9", url: "/placeholder.svg?height=600&width=600&text=Red+XL" },
    sku_images: [],
    sku_tier_idx: [3, 3], // Size XL, Color Red
  },
]

// Mock related products
const relatedProducts = [
  {
    id: 1,
    name: "Slim Fit Jeans",
    price: 59.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 2,
    name: "Casual Hoodie",
    price: 49.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 3,
    name: "Denim Jacket",
    price: 79.99,
    salePrice: 69.99,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 4,
    name: "Graphic Print T-Shirt",
    price: 24.99,
    image: "/placeholder.svg?height=400&width=400",
  },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [selectedVariations, setSelectedVariations] = useState<number[]>([])
  const [selectedSku, setSelectedSku] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState("")
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Initialize selected variations with first option of each variation
  useEffect(() => {
    if (mockProduct.product_variations.length > 0) {
      const initialSelections = mockProduct.product_variations.map(() => 0)
      setSelectedVariations(initialSelections)
    }
  }, [])

  // Update selected SKU when variations change
  useEffect(() => {
    if (selectedVariations.length === 0) return

    const matchingSku = mockSkus.find((sku) => {
      return sku.sku_tier_idx.every((tierIdx, index) => tierIdx === selectedVariations[index])
    })

    setSelectedSku(matchingSku || null)

    // Update main image based on selected variations
    // First check if the selected SKU has its own thumbnail
    if (matchingSku && matchingSku.sku_thumb && matchingSku.sku_thumb.url) {
      setMainImage(matchingSku.sku_thumb.url)
      return
    }

    // If no SKU-specific image, check for variation-specific images
    // Look through all variations to find one with images
    for (let i = 0; i < mockProduct.product_variations.length; i++) {
      const variation = mockProduct.product_variations[i]
      const selectedValueIndex = selectedVariations[i]

      // If this variation has images and we have a selected value for it
      if (variation.variation_images && variation.variation_images.length > 0 && selectedValueIndex !== undefined) {
        // If there's an image specifically for this variation value
        if (selectedValueIndex < variation.variation_images.length) {
          setMainImage(variation.variation_images[selectedValueIndex].url)
          return
        }
      }
    }

    // Default to the product thumbnail if no variation-specific image is found
    setMainImage(mockProduct.product_thumb.url)
  }, [selectedVariations])

  const handleVariationChange = (variationIndex: number, valueIndex: number) => {
    const newSelections = [...selectedVariations]
    newSelections[variationIndex] = valueIndex
    setSelectedVariations(newSelections)
  }

  const increaseQuantity = () => {
    if (selectedSku && quantity < selectedSku.sku_stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  const isVariationAvailable = (variationIndex: number, valueIndex: number) => {
    // Check if there's any SKU with this variation value that has stock
    const testSelections = [...selectedVariations]
    testSelections[variationIndex] = valueIndex

    return mockSkus.some((sku) => {
      const matchesAllSelected = sku.sku_tier_idx.every((tierIdx, idx) => {
        // Skip checking variations that haven't been selected yet
        if (idx !== variationIndex && testSelections[idx] === undefined) return true
        return tierIdx === testSelections[idx]
      })
      return matchesAllSelected && sku.sku_stock > 0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header - Reusing the same header structure from the homepage */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-blue-100">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Aliconcon
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Shop
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Categories
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Deals
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600">
                3
              </Badge>
              <span className="sr-only">Cart</span>
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                asChild
              >
                <Link href="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/products/category/${mockProduct.product_category._id}`}>
                {mockProduct.product_category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-medium text-gray-900">{mockProduct.product_name}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={mainImage || mockProduct.product_thumb.url}
                alt={mockProduct.product_name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer border-2",
                  mainImage === mockProduct.product_thumb.url
                    ? "border-blue-500"
                    : "border-transparent hover:border-blue-300",
                )}
                onClick={() => setMainImage(mockProduct.product_thumb.url)}
              >
                <Image
                  src={mockProduct.product_thumb.url || "/placeholder.svg"}
                  alt={`${mockProduct.product_name} - Thumbnail`}
                  fill
                  className="object-cover"
                />
              </div>
              {mockProduct.product_images.map((image, index) => (
                <div
                  key={image._id}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer border-2",
                    mainImage === image.url ? "border-blue-500" : "border-transparent hover:border-blue-300",
                  )}
                  onClick={() => setMainImage(image.url)}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`${mockProduct.product_name} - View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{mockProduct.product_name}</h1>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    isWishlisted && "text-red-500 hover:text-red-600 hover:bg-red-50",
                  )}
                  onClick={toggleWishlist}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                  <span className="sr-only">{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(mockProduct.product_rating_avg)
                          ? "text-yellow-400 fill-yellow-400"
                          : star <= mockProduct.product_rating_avg
                            ? "text-yellow-400 fill-yellow-400 opacity-50"
                            : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {mockProduct.product_rating_avg} ({Math.floor(Math.random() * 100) + 10} reviews)
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {selectedSku ? `${selectedSku.sku_stock} in stock` : "Select options to check availability"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedSku ? (
                <>
                  <span className="text-2xl font-bold">${selectedSku.sku_price.toFixed(2)}</span>
                  {selectedSku.sku_stock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
                </>
              ) : (
                <span className="text-2xl font-bold">
                  ${Math.min(...mockSkus.map((sku) => sku.sku_price)).toFixed(2)} - $
                  {Math.max(...mockSkus.map((sku) => sku.sku_price)).toFixed(2)}
                </span>
              )}
            </div>

            <Separator />

            {/* Product Variations */}
            <div className="space-y-6">
              {mockProduct.product_variations.map((variation, variationIndex) => (
                <div key={variation.variation_id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{variation.variation_name}</h3>
                    {selectedVariations[variationIndex] !== undefined && (
                      <span className="text-sm text-gray-500">
                        Selected: {variation.variation_values[selectedVariations[variationIndex]]}
                      </span>
                    )}
                  </div>

                  {variation.variation_name === "Color" ? (
                    <div className="flex flex-wrap gap-3">
                      {variation.variation_values.map((value, valueIndex) => {
                        const isAvailable = isVariationAvailable(variationIndex, valueIndex)
                        const isSelected = selectedVariations[variationIndex] === valueIndex

                        // Map color names to hex values
                        const colorMap: Record<string, string> = {
                          White: "#FFFFFF",
                          Black: "#000000",
                          Blue: "#0000FF",
                          Red: "#FF0000",
                          Green: "#008000",
                        }

                        return (
                          <div
                            key={`${variation.variation_id}-${valueIndex}`}
                            className={cn(
                              "relative h-10 w-10 rounded-full border-2 cursor-pointer",
                              isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200",
                              !isAvailable && "opacity-50 cursor-not-allowed",
                            )}
                            style={{ backgroundColor: colorMap[value] || "#CCCCCC" }}
                            onClick={() => {
                              if (isAvailable) {
                                handleVariationChange(variationIndex, valueIndex)
                              }
                            }}
                            title={`${value}${!isAvailable ? " (Not available)" : ""}`}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className={`h-5 w-5 ${value === "White" ? "text-black" : "text-white"}`} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedVariations[variationIndex]?.toString()}
                      onValueChange={(value) => handleVariationChange(variationIndex, Number.parseInt(value))}
                      className="flex flex-wrap gap-2"
                    >
                      {variation.variation_values.map((value, valueIndex) => {
                        const isAvailable = isVariationAvailable(variationIndex, valueIndex)

                        return (
                          <div key={`${variation.variation_id}-${valueIndex}`} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={valueIndex.toString()}
                              id={`${variation.variation_id}-${valueIndex}`}
                              disabled={!isAvailable}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`${variation.variation_id}-${valueIndex}`}
                              className={cn(
                                "flex h-10 min-w-[3rem] cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium ring-offset-white transition-all hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-600",
                                !isAvailable && "opacity-50 cursor-not-allowed hover:bg-white hover:text-inherit",
                              )}
                            >
                              {value}
                              {!isAvailable && " (Out of stock)"}
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  )}
                </div>
              ))}

              {/* Quantity Selector */}
              <div className="space-y-3">
                <h3 className="font-medium">Quantity</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || !selectedSku || selectedSku.sku_stock === 0}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <div className="h-10 px-6 flex items-center justify-center border-y border-input">{quantity}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={increaseQuantity}
                    disabled={!selectedSku || quantity >= selectedSku.sku_stock || selectedSku.sku_stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                disabled={!selectedSku || selectedSku.sku_stock === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {selectedSku && selectedSku.sku_stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "flex-1",
                  isWishlisted && "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600",
                )}
                onClick={toggleWishlist}
              >
                <Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-current")} />
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </div>

            <Separator />

            {/* Product Attributes */}
            <div className="space-y-4">
              <h3 className="font-medium">Product Specifications</h3>
              <div className="grid grid-cols-1 gap-2">
                {mockProduct.product_attributes.map((attr) => (
                  <div key={attr.attr_id.toString()} className="flex py-2 border-b border-gray-100 last:border-0">
                    <span className="w-1/3 text-gray-500">{attr.attr_name}</span>
                    <span className="w-2/3 font-medium">{attr.attr_value}</span>
                  </div>
                ))}
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-1/3 text-gray-500">SKU</span>
                  <span className="w-2/3 font-medium">{selectedSku ? selectedSku._id : "Select options"}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-1/3 text-gray-500">Availability</span>
                  <span className="w-2/3 font-medium">
                    {selectedSku
                      ? selectedSku.sku_stock > 0
                        ? `In Stock (${selectedSku.sku_stock} available)`
                        : "Out of Stock"
                      : "Select options to check availability"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mockProduct.product_description }} />
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(mockProduct.product_rating_avg)
                                ? "text-yellow-400 fill-yellow-400"
                                : star <= mockProduct.product_rating_avg
                                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                                  : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm">Based on {Math.floor(Math.random() * 100) + 10} reviews</span>
                    </div>
                  </div>
                  <Button>Write a Review</Button>
                </div>

                <Separator />

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {[
                    {
                      name: "Sarah T.",
                      rating: 5,
                      date: "2 weeks ago",
                      title: "Excellent quality and fit!",
                      comment:
                        "I absolutely love this t-shirt! The material is so soft and comfortable, and it fits perfectly. The color is exactly as shown in the pictures. Will definitely buy more in different colors.",
                    },
                    {
                      name: "Michael R.",
                      rating: 4,
                      date: "1 month ago",
                      title: "Great shirt, slightly large",
                      comment:
                        "The quality of this shirt is excellent and the material feels premium. My only issue is that it runs slightly large. I'd recommend sizing down if you're between sizes. Otherwise, very happy with my purchase.",
                    },
                    {
                      name: "Jessica L.",
                      rating: 5,
                      date: "2 months ago",
                      title: "Perfect everyday shirt",
                      comment:
                        "This has become my go-to shirt for everyday wear. It's comfortable, washes well, and the color hasn't faded after multiple washes. The fabric is breathable and perfect for warmer weather. Highly recommend!",
                    },
                  ].map((review, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{review.title}</h4>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{review.name}</span>
                        <span className="text-xs text-gray-500">Verified Buyer</span>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium">Shipping Information</h3>
                <p>We offer the following shipping options:</p>
                <ul>
                  <li>Standard Shipping (3-5 business days): $4.99</li>
                  <li>Express Shipping (1-2 business days): $9.99</li>
                  <li>Free Standard Shipping on orders over $50</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Return Policy</h3>
                <p>
                  We want you to be completely satisfied with your purchase. If you're not happy with your order, we
                  accept returns within 30 days of delivery.
                </p>
                <p>To be eligible for a return, your item must be:</p>
                <ul>
                  <li>Unworn and unwashed</li>
                  <li>In the original packaging</li>
                  <li>With all tags attached</li>
                </ul>

                <p>
                  Please note that the customer is responsible for return shipping costs unless the item is defective or
                  we made an error.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">You May Also Like</h2>
            <Button variant="ghost" className="text-blue-600 gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <Button
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Add to wishlist</span>
                  </Button>
                </div>
                <div>
                  <Link href={`/products/${product.id}`} className="block">
                    <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center">
                        {product.salePrice ? (
                          <>
                            <span className="font-semibold">${product.salePrice.toFixed(2)}</span>
                            <span className="text-gray-500 line-through text-xs ml-2">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-semibold">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Add to cart</span>
                      </Button>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer - Reusing the same footer structure from the homepage */}
      <footer className="bg-gradient-to-b from-white to-blue-50 border-t border-blue-100 pt-16 pb-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="inline-block mb-4">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Aliconcon
                </span>
              </Link>
              <p className="text-gray-600 mb-4 max-w-xs">
                Your one-stop destination for trendy fashion and accessories at affordable prices.
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
              <h3 className="font-semibold text-lg mb-4">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Trending Now
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Sale
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    All Collections
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">About</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-100 pt-8 text-center text-gray-500 text-sm">
            <p>© 2023 Aliconcon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
