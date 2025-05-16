"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, ChevronRight, Heart, Menu } from "lucide-react" // ChevronRight might not be used here directly

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This would be replaced with actual auth state in a real application
const isLoggedIn = false // TODO: Replace with actual auth state
const user = { name: "John Doe", email: "john@example.com" } // TODO: Replace with actual user data
const cartItemCount = 3 // TODO: Replace with actual cart item count

export default function Header() {
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
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-[200px] lg:w-[300px] bg-white/90 border-blue-100 focus-visible:ring-blue-500"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Wishlist</span>
            {/* Optional: Add a badge for wishlist items count */}
            {/* <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-pink-600">5</Badge> */}
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600">
                {cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Cart</span>
          </Button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                  <Image
                    // TODO: Replace with actual user avatar
                    src="/placeholder.svg?height=40&width=40" 
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Orders</DropdownMenuItem>
                <DropdownMenuItem>Wishlist</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem> {/* TODO: Implement logout */}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                asChild
              >
                <Link href="/auth/register">Sign Up</Link>
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
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/products">Shop</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Categories</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Deals</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">About</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="relative flex md:hidden items-center p-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-10 w-full bg-white/90 border-blue-100 focus-visible:ring-blue-500"
                />
              </div>
              {!isLoggedIn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register">Sign Up</Link>
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