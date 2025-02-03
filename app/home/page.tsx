"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/shared/navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Cookies from "js-cookie";

const Home = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [requiresUsername, setRequiresUsername] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);

  const fetchData = async () => {
    try {
      const cookie = Cookies.get("cookie");

      const response = await fetch("http://localhost:8000/api/home", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result?.data?.Username) {
        Cookies.set("username", result.data.Username, { path: "/", expires: 1 });
      }

      if (result.error && result.msg === "Your account is not finished") {
        setShowAlert(true);
        setRequiresUsername(result.data?.username_create || false);
        setRequiresPassword(result.data?.password_create || false);
      } else {
        setShowAlert(false);
      }
    } catch {
      setShowAlert(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async () => {
    const cookie = Cookies.get("cookie");
    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/registerfinish",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cookie}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Registration successful");
        setShowAlert(false);
      } else if (
        result.error === false &&
        result.msg === "Invalid token or session expired"
      ) {
        toast.error("Invalid token or session expired");
        window.location.href = "/";
      } else {
        toast.error("Registration failed");
        setShowAlert(true);
      }
    } catch {
      toast.error("Registration failed");
      setShowAlert(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogTrigger asChild>
          <Button style={{ display: "none" }}>Trigger</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Finish Registration</AlertDialogTitle>
          <AlertDialogDescription>
            Please create an account.
          </AlertDialogDescription>
          <div className="space-y-4">
            {requiresUsername && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium">
                  Username:
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            {requiresPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password:
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>
          <AlertDialogAction onClick={handleRegister}>Register</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;