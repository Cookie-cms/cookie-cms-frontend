"use client";

import Navbar from "@/components/shared/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Book, AlertCircle } from "lucide-react";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cookie = Cookies.get("cookie");
    if (cookie) {
      router.push("/home");
    }
  }, [router]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const response = await fetch("https://mock.coffeedev.dev/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const responseData = await response.json();

      if (response.ok && !responseData.error) {
        const { jwt } = responseData.data;
        const { url } = responseData;

        if (jwt) {
          Cookies.set("cookie", jwt, { expires: 1 });

          setAlertMessage("Successfully signed in!");
          setIsError(false);
          setShowAlert(true);

          if (url) {
            setTimeout(() => {
              router.push(url);
            }, 1000);
          } else {
            setAlertMessage("Login successful, but no redirect URL provided.");
          }
        }
      } else {
        setAlertMessage(responseData.msg || "An error occurred");
        setIsError(true);
        setShowAlert(true);
      }
    } catch {
      setAlertMessage("An unexpected error occurred. Please try again.");
      setIsError(true);
      setShowAlert(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      {showAlert && (
        <div className="fixed top-0 right-0 m-4 w-full max-w-md z-50">
          <Alert onClose={() => setShowAlert(false)} variant={isError ? "destructive" : "default"}>
            <div className="flex items-center">
              {isError ? <AlertCircle className="h-5 w-5 mr-2" /> : <Book className="h-5 w-5 mr-2" />}
              <div>
                <AlertTitle>{alertMessage}</AlertTitle>
                <AlertDescription>
                  {isError && alertMessage !== "Successfully signed in!" ? "Please check your credentials or try again." : ""}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}
      <div className="flex items-center justify-center flex-1">
        <form onSubmit={handleSubmit} className="bg-background p-8 rounded-lg shadow-md w-full max-w-md border border-gray-300">
          <h2 className="text-2xl font-bold mb-6 text-center">Login an Account</h2>
          <div className="mb-4">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Button variant="default" className="w-full" type="submit">
              Sign In
            </Button>
            <div className="w-full h-px bg-gray-300 mb-4"></div>
            <Button variant="default" className="flex items-center justify-center p-2 w-12 h-12" type="button">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="http://localhost:3000/svg/discord.svg" alt="Discord" className="w-full h-full" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
