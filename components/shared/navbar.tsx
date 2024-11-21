"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isCookieValid, setIsCookieValid] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cookie = Cookies.get("cookie");
    setIsCookieValid(!!cookie);
    setLogoutError(false);
  }, []);

  const handleLogout = async () => {
    const cookie = Cookies.get("cookie");
    if (cookie) {
        try {
            const response = await fetch("https://mock.coffeedev.dev/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`,
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
    setIsCookieValid(false);
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
            <>
              <Link className={buttonVariants({ variant: "default" })} href="/home">
                Home
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className={buttonVariants({ variant: "outline" })}>
                    Logout
                  </button>
                </AlertDialogTrigger>
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

      {logoutError && (
        <div className="text-red-500 text-center mt-4">
          An error occurred while logging out. Please try again.
        </div>
      )}
    </>
  );
}
