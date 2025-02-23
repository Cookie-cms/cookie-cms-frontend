"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Navbar from "@/components/shared/navbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
// import { Cog, Palette, ChevronRight, ChevronDown } from 'lucide-react';
import { Cog, ChevronRight, ChevronDown } from "lucide-react";

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState({
    username: "",
    username_ds: "",
    avatar: "",
    discord: "",
  });

  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [removeDiscordPassword, setRemoveDiscordPassword] = useState("");
  const [isSubmittingRemoveDiscord, setIsSubmittingRemoveDiscord] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [validationCode, setValidationCode] = useState("");
  const [validationPassword, setValidationPassword] = useState("");
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const isDemo = process.env.NEXT_PUBLIC_PRODUCTION === 'DEMO';
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSectionClick = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const menuItems = [
    {
      icon: <Cog className="w-5 h-5" />,
      title: "General Settings",
      description: "Account and security settings",
      id: "general",
    },
    // {
    //   icon: <Palette className="w-5 h-5" />,
    //   title: "Appearance",
    //   description: "Theme and interface settings",
    //   id: "appearance"
    // }
  ];

  useEffect(() => {
    const username = Cookies.get("cookiecms_username") || "";
    const username_ds = Cookies.get("cookiecms_username_ds") || "";
    const avatar = Cookies.get("cookiecms_avatar") || "";
    setUserInfo({ username, username_ds, avatar, discord: username_ds });
  }, []);

  const handleEditUsername = async () => {

    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
   }

    const usernameRegex = /^[A-Z][a-zA-Z0-9]*$/;

    if (!newUsername) {
      toast.error("Please fill in all fields");
      return;
    }

    if (/^\d+$/.test(newUsername)) {
      toast.error("Username cannot consist of only numbers");
      return;
    }

    if (!/[a-zA-Z]/.test(newUsername)) {
      toast.error("Username must contain at least one letter");
      return;
    }

    if (!usernameRegex.test(newUsername)) {
      toast.error(
        "Username must start with an uppercase letter and contain only English letters and numbers"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/home/edit/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
        body: JSON.stringify({ username: newUsername, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      const data = await response.json();
      Cookies.set("username", data.username);
      setUserInfo((prev) => ({ ...prev, username: data.username }));
      toast.success("Username updated successfully!");
      setNewUsername("");
      setPassword("");
    } catch {
      toast.error("Failed to update username");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPassword = async () => {

    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
   }

    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (/^\d+$/.test(newPassword)) {
      toast.error("Password cannot consist entirely of numbers.");
      return;
    }

    if (!/\D/.test(newPassword)) {
      toast.error("Password must contain at least one non-numeric character.");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const response = await fetch(`${API_URL}/home/edit/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
        body: JSON.stringify({
          password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleRemoveDiscordLink = async () => {

    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
   }

    if (!removeDiscordPassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsSubmittingRemoveDiscord(true);
    try {
      const response = await fetch(
        `${API_URL}/home/edit/removediscord`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
          },
          body: JSON.stringify({ password: removeDiscordPassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove Discord link");
      }

      setUserInfo((prev) => ({ ...prev, discord: "" }));
      toast.success("Discord account unlinked successfully!");
      setRemoveDiscordPassword("");
      Cookies.remove("username_ds");
    } catch {
      toast.error("Failed to remove Discord link");
    } finally {
      setIsSubmittingRemoveDiscord(false);
    }
  };

  const handleChangeEmail = async () => {

    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
   }

    if (!newEmail || !emailPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const response = await fetch(`${API_URL}/home/edit/mail/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
        body: JSON.stringify({
          mail: newEmail,
          password: emailPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request email change");
      }

      toast.success("Please check your email for the verification code");
      setShowValidationDialog(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (error) {
      console.error("Error changing email:", error);
      toast.error("Failed to request email change");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleValidateEmail = async () => {

    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
   }
    
    if (![validationCode, validationPassword].every(Boolean)) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmittingValidation(true);
    try {
      const response = await fetch(`${API_URL}/home/edit/mail/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
        body: JSON.stringify({
          code: validationCode,
          password: validationPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate email change");
      }

      toast.success("Email changed successfully!");
      setShowValidationDialog(false);
      setValidationCode("");
      setValidationPassword("");
    } catch {
      toast.error("Failed to validate email change");
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="container mx-auto py-10 space-y-6">
        <Card>
          <CardHeader className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={
                    Cookies.get("avatar") && Cookies.get("userid")
                      ? `https://cdn.discordapp.com/avatars/${Cookies.get("cookiecms_userid")}/${Cookies.get("cookiecms_avatar")}?size=256`
                      : ""
                  }
                />
                <AvatarFallback>{userInfo.username ? userInfo.username[0] : "?"}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{userInfo.username}</h2>
                <p className="text-sm text-muted-foreground">Discord: {userInfo.username_ds}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto hover:bg-accent"
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-primary">{item.icon}</div>
                      <div className="text-left">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    {item.id === "general" ? (
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          openSection === "general" ? "transform rotate-180" : ""
                        }`}
                      />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>

                  {item.id === "general" && openSection === "general" && (
                    <div className="ml-14 space-y-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            // disabled={isSubmitting || isDemo}
                            disabled={isSubmitting}
                            variant="ghost"
                            className="w-full justify-start text-left text-sm font-normal hover:bg-accent"
                          >
                            Edit Username
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-bold">
                              Change Your Username
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="New username"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                            />
                            <Input
                              type="password"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => {
                                setNewUsername("");
                                setPassword("");
                              }}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <Button disabled={isSubmitting} onClick={handleEditUsername}>
                              {isSubmitting ? "Updating..." : "Save Changes"}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            // disabled={isSubmitting || isDemo}
                            disabled={isSubmitting}
                            className="w-full justify-start text-left text-sm font-normal hover:bg-accent"
                          >
                            Edit Password
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-bold">
                              Change Your Password
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <Input
                              type="password"
                              placeholder="Current password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <Input
                              type="password"
                              placeholder="New password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => {
                                setCurrentPassword("");
                                setNewPassword("");
                              }}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <Button disabled={isSubmittingPassword} onClick={handleEditPassword}>
                              {isSubmittingPassword ? "Updating..." : "Save Changes"}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {userInfo.discord && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                // disabled={isSubmitting || isDemo}
                                disabled={isSubmitting}
                                variant="ghost"
                                className="w-full justify-start text-left text-sm font-normal hover:bg-accent"
                              >
                                Remove Discord Link
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg font-bold">
                                  Unlink Discord Account
                                </AlertDialogTitle>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <Input
                                  type="password"
                                  placeholder="Current Password"
                                  value={removeDiscordPassword}
                                  onChange={(e) => setRemoveDiscordPassword(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground">
                                  This will remove the connection between your account and Discord.
                                </p>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRemoveDiscordPassword("")}>
                                  Cancel
                                </AlertDialogCancel>
                                <Button
                                  disabled={isSubmittingRemoveDiscord}
                                  onClick={handleRemoveDiscordLink}
                                  variant="destructive"
                                >
                                  {isSubmittingRemoveDiscord ? "Processing..." : "Confirm Unlink"}
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                // disabled={isSubmitting || isDemo}
                                disabled={isSubmitting}
                                className="w-full justify-start text-left text-sm font-normal hover:bg-accent"
                              >
                                Change Email
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg font-bold">
                                  Change Your Email
                                </AlertDialogTitle>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <Input
                                  type="email"
                                  placeholder="New email"
                                  value={newEmail}
                                  onChange={(e) => setNewEmail(e.target.value)}
                                />
                                <Input
                                  type="password"
                                  placeholder="Current Password"
                                  value={emailPassword}
                                  onChange={(e) => setEmailPassword(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => {
                                    setNewEmail("");
                                    setEmailPassword("");
                                  }}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <Button disabled={isSubmittingEmail} onClick={handleChangeEmail}>
                                  {isSubmittingEmail ? "Submitting..." : "Submit"}
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog open={showValidationDialog}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-lg font-bold">
                                  Verify Email Change
                                </AlertDialogTitle>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Verification Code"
                                  value={validationCode}
                                  onChange={(e) => setValidationCode(e.target.value)}
                                />
                                <Input
                                  type="password"
                                  placeholder="Current Password"
                                  value={validationPassword}
                                  onChange={(e) => setValidationPassword(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => {
                                    setShowValidationDialog(false);
                                    setValidationCode("");
                                    setValidationPassword("");
                                  }}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <Button
                                  disabled={isSubmittingValidation}
                                  onClick={handleValidateEmail}
                                >
                                  {isSubmittingValidation ? "Verifying..." : "Verify"}
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
