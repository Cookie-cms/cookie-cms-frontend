"use client";

import Navbar from "@/components/shared/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Book } from "lucide-react";

export default function SignUp() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isError, setIsError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("/signin");
  const router = useRouter();

  useEffect(() => {
    const cookie = Cookies.get("cookie");
    if (cookie) {
      router.push("/home");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setIsError(true);
      setAlertMessage("Password must be at least 8 characters long.");
      setShowAlert(true);
      return;
    }

    if (/^\d+$/.test(password)) {
      setIsError(true);
      setAlertMessage("Password cannot consist entirely of numbers.");
      setShowAlert(true);
      return;
    }
  
    if (password !== repeatPassword) {
      setIsError(true);
      setAlertMessage("Passwords do not match");
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch("https://mock.coffeedev.dev/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mail, password }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const { url } = responseData;

        setRedirectUrl(url || "/signin");
        setShowModal(true);
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
          <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
          <div className="mb-4">
            <Label htmlFor="mail">Mail</Label>
            <Input
              type="email"
              id="mail"
              placeholder="Mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
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
          <div className="mb-4">
            <Label htmlFor="repeat-password">Confirm Password</Label>
            <Input
              type="password"
              id="repeat-password"
              placeholder="Confirm Password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-center">
            <Button variant="default" className="w-full" type="submit">
              Sign Up
            </Button>
          </div>
          <div className="w-full h-px bg-gray-300 my-4"></div>
          <div className="flex justify-center">
            <Button variant="default" className="flex items-center justify-center p-2 w-12 h-12" type="button">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="http://localhost:3000/svg/discord.svg" alt="Discord" className="w-full h-full" />
            </Button>
          </div>
        </form>
      </div>
      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful</AlertDialogTitle>
            <AlertDialogDescription>
              A confirmation email has been sent to {mail}. Please check your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowModal(false);
                router.push(redirectUrl);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}