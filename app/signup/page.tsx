"use client";

import Navbar from "@/components/shared/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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

export default function SignUp() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isError, setIsError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setIsError(true);
      setAlertMessage("Passwords do not match");
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

        setRedirectUrl(url);
        setShowModal(true);
      } else {
        const errorData = await response.json();
        setIsError(true);
        setAlertMessage(errorData.error || "An error occurred during signup");
      }
    } catch {
      setIsError(true);
      setAlertMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      {isError && (
        <div className="fixed top-0 right-0 m-4 w-full max-w-md z-50">
          <div className="p-4 bg-red-500 text-white rounded-md">{alertMessage}</div>
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
