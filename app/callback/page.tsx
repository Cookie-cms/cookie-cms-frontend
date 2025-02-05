"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Callback() {
  const router = useRouter();
  const isCalled = useRef(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userData, setUserData] = useState<{ id: string; conn_id: number } | null>(null);

  useEffect(() => {
    if (isCalled.current) return;
    isCalled.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      toast.error("Missing authorization code.");
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/auth/discord/callback?code=${code}`);

        if (response.ok) {
          const data = await response.json();

          if (data.error) {
            if (data.msg === "User not found, do you want create or link?") {
              setUserData(data.data.user);
              setIsDialogOpen(true);
            } else {
              toast.error(data.msg || "Authentication failed.");
              router.push("/");
            }
            return;
          }

          if (data.data.jwt) {
            Cookies.set("cookie", data.data.jwt, { expires: 1 });
          }

          router.push(data.url || "/home");
        } else if (response.status === 404) {
          const data = await response.json();
          if (data.msg === "User not found, do you want create or link?") {
            setUserData(data.data.user);
            setIsDialogOpen(true);
          } else {
            toast.error("User not found.");
            router.push("/");
          }
        } else {
          toast.error("Failed to authenticate.");
          router.push("/");
        }
      } catch {
        toast.error("An error occurred. Please try again.");
        router.push("/");
      }
    };

    fetchData();
  }, [router]);

  const handleRegister = async () => {
    if (!userData) {
      toast.error("User data is missing.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/register/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta: {
            id: userData.id,
            conn_id: userData.conn_id,
          },
        }),
      });

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const data = await response.json();
        toast.success("Registration successful.");
        setIsDialogOpen(false);
        router.push("/home");
      } else {
        toast.error("Registration failed.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleLink = () => {
    toast.success("Account linked successfully.");
    setIsDialogOpen(false);
    router.push("/home");
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>User Not Found</AlertDialogTitle>
          <AlertDialogDescription>
            User not found, do you want to register or link an account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleRegister}>Register</AlertDialogAction>
          <AlertDialogAction onClick={handleLink}>Link</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}