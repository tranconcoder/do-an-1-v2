"use client"

import Link from "next/link"
import { Search, ShoppingCart, Heart, Menu } from "lucide-react" // ChevronRight might not be used here directly

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/lib/store/store"
import ProfileBox from "@/components/common/ProfileBox"
import { logout } from "@/lib/store/slices/userSlice"
import CartHoverCard from "@/components/common/CartHoverCard"

const cartItemCount = 3;

export default function Header() {
  const dispatch = useDispatch()
  const { accessToken, user, shop } = useSelector((state: RootState) => state.user)
  const isLoggedIn = !!accessToken

  const handleLogout = () => {
    dispatch(logout())
    // Optionally, redirect to home or login page after logout
    // router.push('/'); 
  }

  return (
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
              Trang chủ
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Cửa hàng
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Danh mục
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Ưu đãi
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 w-[200px] lg:w-[300px] bg-white/90 border-blue-100 focus-visible:ring-blue-500"
            />
          </div>
          {isLoggedIn && (
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Danh sách yêu thích</span>
            {/* Optional: Add a badge for wishlist items count */}
            {/* <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-pink-600">5</Badge> */}
          </Button>
          )}
          {isLoggedIn && <CartHoverCard cartItemCount={cartItemCount} />}

          {isLoggedIn && user ? (
            <ProfileBox user={user} shop={shop} handleLogout={handleLogout} />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Đăng Nhập</Link>
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                asChild
              >
                <Link href="/auth/register">Đăng Ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/">Trang chủ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products">Cửa hàng</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Danh mục</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Ưu đãi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Về chúng tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="relative flex md:hidden items-center p-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    type="search"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="pl-10 w-full bg-white/90 border-blue-100 focus-visible:ring-blue-500"
                />
              </div>
              {!isLoggedIn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">Đăng Nhập</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register">Đăng Ký</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 