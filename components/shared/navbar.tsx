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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [username, setUsername] = useState<string | null>(null);
  const [delayedUsername, setDelayedUsername] = useState<string | null>(null);
  const router = useRouter();
  const permlvl = Cookies.get("cookiecms_permlvl");
  const ADMIN_LEVEL = Number(process.env.NEXT_PUBLIC_ADMIN_LEVEL || 5);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;


  useEffect(() => {
    console.log('Permission Level:', permlvl);
    console.log('Admin Level:', ADMIN_LEVEL);
    console.log('Comparison Result:', Number(permlvl ?? 0) >= Number(ADMIN_LEVEL));
    
    setTimeout(() => {
      const cookie = Cookies.get("cookiecms_cookie");
      const storedUsername = Cookies.get("cookiecms_username");

      setIsCookieValid(!!cookie);
      setUsername(storedUsername || null);

      if (storedUsername) {
        setTimeout(() => {
          setDelayedUsername(storedUsername);
        }, 1000);
      }
    }, 1000);
  }, [permlvl, ADMIN_LEVEL]);

  const handleLogout = async () => {
    const cookie = Cookies.get("cookiecms_cookie");
    if (cookie) {
      try {
        const response = await fetch(`${API_URL}/api/auth/logout`, {
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

    Cookies.remove("cookiecms_cookie");
    Cookies.remove("cookiecms_username");
    Cookies.remove("cookiecms_avatar");
    Cookies.remove("cookiecms_userid");
    Cookies.remove("cookiecms_permlvl");
    setIsCookieValid(false);
    setUsername(null);
    setDelayedUsername(null);
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
                <AvatarImage 
                  src={Cookies.get("avatar") && Cookies.get("userid") 
                    ? `https://cdn.discordapp.com/avatars/${Cookies.get("cookiecms_userid")}/${Cookies.get("cookiecms_avatar")}?size=256`
                    : ""
                  } 
                />
                <AvatarFallback>
                  {delayedUsername ? delayedUsername[0].toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{delayedUsername || "Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {Number(permlvl ?? 0) >= Number(ADMIN_LEVEL) && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/home");
                    }}
                  >
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/settings");
                    }}
                  >
                    Settings
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
