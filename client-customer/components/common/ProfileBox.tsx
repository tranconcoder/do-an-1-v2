"use client"

import Link from "next/link"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  User as UserIcon,
  UserCircle2,
  Package,
  Heart,
  Settings,
  LayoutPanelLeft,
  LogOut,
} from "lucide-react"
import type { User, Shop } from "@/lib/store/slices/userSlice"

interface ProfileBoxProps {
  user: User | null;
  shop: Shop | null; 
  handleLogout: () => void;
}

export default function ProfileBox({ user, shop, handleLogout }: ProfileBoxProps) {
  if (!user) {
    return null; // Should not happen if ProfileBox is rendered only when logged in
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          {user.user_avatar ? (
            <Image
              src={user.user_avatar}
              alt={user.user_fullName || "User Avatar"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-500" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-2 space-y-1">
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/50" />
        <DropdownMenuItem className="focus:bg-transparent cursor-default px-2 py-1.5">
          <div className="flex flex-col">
            <span className="text-base font-semibold">{user.user_fullName || "N/A"}</span>
            <span className="text-sm text-muted-foreground">{user.user_email || user.phoneNumber}</span>
            {shop && <span className="mt-1 text-sm text-blue-500 dark:text-blue-400 font-semibold">Shop: {shop.shop_name}</span>}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/50" />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-white/10 dark:hover:bg-slate-800/60 transition-colors">
            <UserCircle2 className="h-5 w-5" />
            <span className="text-sm">Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-white/10 dark:hover:bg-slate-800/60 transition-colors">
            <Package className="h-5 w-5" />
            <span className="text-sm">Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-white/10 dark:hover:bg-slate-800/60 transition-colors">
            <Heart className="h-5 w-5" />
            <span className="text-sm">Wishlist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-white/10 dark:hover:bg-slate-800/60 transition-colors">
            <Settings className="h-5 w-5" />
            <span className="text-sm">Settings</span>
          </Link>
        </DropdownMenuItem>
        {shop && (
          <>
            <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/50" />
            <DropdownMenuItem asChild>
              <Link href="/shop/dashboard" className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-white/10 dark:hover:bg-slate-800/60 transition-colors">
                <LayoutPanelLeft className="h-5 w-5" />
                <span className="text-sm">Shop Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-white/20 dark:bg-slate-700/50"/>
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 hover:!text-red-600 dark:hover:!text-red-300 hover:!bg-red-500/10 dark:hover:!bg-red-400/10 cursor-pointer flex items-center gap-3 px-2 py-2.5 rounded-md transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 