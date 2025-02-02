"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
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
            toast.error(data.msg || "Authentication failed.");
            router.push("/");
            return;
          }

          if (data.data.jwt) {
            Cookies.set("jwt", data.data.jwt, { expires: 7 });
          }

          router.push(data.url || "/home");
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

  return null;
}
