"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isCookieValid, setIsCookieValid] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const cookie = Cookies.get("cookie");
    const storedUsername = Cookies.get("username");

    setIsCookieValid(!!cookie);
    setUsername(storedUsername || null);
  }, []);

  const handleLogout = async () => {
    const cookie = Cookies.get("cookie");
    if (cookie) {
      try {
        const response = await fetch("http://localhost:8000/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookie}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to log out");
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    Cookies.remove("cookie");
    Cookies.remove("username");
    setIsCookieValid(false);
    setUsername(null);
    setShowLogoutAlert(false);
    router.push("/");
  };

  return (
    <>
      <nav className="w-full bg-background text-foreground shadow-lg p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          CookieCMS
        </Link>

        <div className="flex space-x-4">
          {isCookieValid ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>{username ? username[0].toUpperCase() : "?"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{username || "Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/home");
                    }}
                  >
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLogoutAlert(true)}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link className={buttonVariants({ variant: "default" })} href="/signup">
                Sign Up
              </Link>
              <Link className={buttonVariants({ variant: "outline" })} href="/signin">
                Sign In
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="h-px bg-gray-200" />

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
