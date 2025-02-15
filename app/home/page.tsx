/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
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
} from "@/components/ui/alert-dialog";
import Cookies from "js-cookie";
import ReactSkinview3d from "react-skinview3d";

interface Skin {
  uuid: string;
  name: string;
  cloak_id: string;
}

interface Cape {
  Id: string;
  Name: string;
}

const Home = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [requiresUsername, setRequiresUsername] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [skinUrl, setSkinUrl] = useState("");
  const [capeUrl, setCapeUrl] = useState<string | undefined>(undefined);
  const [showSlimModal, setShowSlimModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSkinsModal, setShowSkinsModal] = useState(false);
  const [showCapesModal, setShowCapesModal] = useState(false);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [capes, setCapes] = useState<Cape[]>([]);
  const [userData, setUserData] = useState<{ Uuid?: string; Selected_Skin?: string }>({});
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleTokenExpiration = () => {
      Cookies.remove('avatar');
      Cookies.remove('cookie');
      Cookies.remove('userid');
      Cookies.remove('username');
      Cookies.remove('username_ds');

      window.location.href = '/';
  };

  const fetchData = async () => {
      try {
          const cookie = Cookies.get("cookie");
          const response = await fetch(`${API_URL}/home`, {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${cookie}`,
                  "Content-Type": "application/json",
              },
          });
          const result = await response.json();

          if (result.error && result.msg === "Token has expired" && result.code === 401) {
              handleTokenExpiration();
              return;
          }

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

          const uuid = result?.data?.Uuid;
          const selectedSkin = result?.data?.Selected_Skin

          setUserData({ Uuid: uuid, Selected_Skin: selectedSkin });

          if (uuid) {
              try {
                  const skinResponse = await fetch(`${API_URL}/skin/standart/${uuid}`);
                  if (!skinResponse.ok) {
                      throw new Error('Failed to fetch skin');
                  }
                  const skinUrl = `${API_URL}/skin/standart/${uuid}`;

                  const capeResponse = await fetch(`${API_URL}skin/standart/cape/${uuid}`);
                  const capeUrl = capeResponse.ok
                      ? `${API_URL}/skin/standart/cape/${uuid}`
                      : undefined;

                  setSkinUrl(skinUrl);
                  setCapeUrl(capeUrl);
              } catch (error) {
                  setSkinUrl(`/skin/default.png`);
                  setCapeUrl(undefined);
              }
          }

          if (result?.data?.Skins) {
              setSkins(result.data.Skins);
          }

          if (result?.data?.Capes) {
              setCapes(result.data.Capes);
          }
      } catch (error) {
          setShowAlert(false);
      }
  };

  useEffect(() => {
      const cookie = Cookies.get("cookie");
      if (!cookie) {
          window.location.href = "/";
          return;
      }
      fetchData();
  }, []);

  const handleRegister = async () => {
      const cookie = Cookies.get("cookie");
      try {
          const response = await fetch(`${API_URL}/auth/registerfinish`, {
              method: "POST",
              headers: {
                  Authorization: `Bearer ${cookie}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ username, password }),
          });
          const result = await response.json();

          if (response.ok) {
              toast.success("Registration successful");
              setShowAlert(false);
          } else if (result.error === false && result.msg === "Invalid token or session expired") {
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

  const handleSkinUpload = async (slim: boolean) => {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("slim", slim.toString());

      try {
          const cookie = Cookies.get("cookie");
          const response = await fetch(`${API_URL}/home/upload`, {
              method: "POST",
              headers: {
                  Authorization: `Bearer ${cookie}`,
              },
              body: formData,
          });

          if (response.ok) {
              toast.success("Skin uploaded successfully");
              fetchData();
              window.location.reload();
          } else {
              toast.error("Failed to upload skin");
          }
      } catch {
          toast.error("Failed to upload skin");
      }
      setShowSlimModal(false);
  };

  const handleSelectSkin = async (skinId: string, setShowSkinsModal: (value: boolean) => void) => {
      try {
          const response = await fetch(`${API_URL}/home/edit/skin/select`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Cookies.get("cookie")}`,
              },
              body: JSON.stringify({ skinid: skinId }),
          });

          if (!response.ok) throw new Error("Failed to select skin");

          toast.success("Skin selected");
          setShowSkinsModal(false);
          window.location.reload();
      } catch {
      }
  };


  const handleDeleteSkin = async (uuid: string) => {
      try {
          const cookie = Cookies.get("cookie");
          const response = await fetch(`${API_URL}/home/edit/skin`, {
              method: "DELETE",
              headers: {
                  Authorization: `Bearer ${cookie}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ skinid: uuid }),
          });

          if (response.ok) {
              toast.success("Skin deleted successfully");
              fetchData();
          } else {
              toast.error("Failed to delete skin");
          }
      } catch {
          toast.error("Failed to delete skin");
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          setSelectedFile(file);
          setShowSlimModal(true);
      }
  };


  const handleSelectCape = async (cloakId: string) => {
      try {
          const cookie = Cookies.get("cookie");

          const response = await fetch(`${API_URL}/home/edit/skin`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${cookie}`,
              },
              body: JSON.stringify({
                  skinid: userData.Selected_Skin,
                  cloakid: cloakId
              }),
          });

          if (!response.ok) {
              const errorData = await response.json();

              throw new Error(errorData.msg || "Failed to select cape");
          }

          toast.success("Cape selected successfully");
          setShowCapesModal(false);
          fetchData();
          window.location.reload();
          
      } catch (error) {
          toast.error("Failed to select cape");
      }
  };

  const handleDeleteCape = async (cloakId: string) => {
      try {
          const cookie = Cookies.get("cookie");
          const response = await fetch(`${API_URL}/home/edit/cape`, {
              method: "DELETE",
              headers: {
                  Authorization: `Bearer ${cookie}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ cloakid: cloakId }),
          });

          if (response.ok) {
              toast.success("Cape deleted successfully");
              fetchData();
          } else {
              throw new Error("Failed to delete cape");
          }
      } catch (error) {
          toast.error("Failed to delete cape");
      }
  };

  return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
          <Navbar />
          <div className="w-full h-[1px] bg-white mt-0 mb-6"></div>

          <div className="w-full max-w-4xl px-4 mt-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-background backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center">
                      <div className="w-full text-center">
                          <h2 className="text-2xl font-bold text-white">Your Skin</h2>
                          <div className="w-full h-[2px] bg-white/20 mt-2 mb-6"></div>
                      </div>
                      <div className="flex items-center justify-center">
                          <ReactSkinview3d
                              skinUrl={skinUrl}
                              capeUrl={capeUrl}
                              height={400}
                              width={400}
                          />
                      </div>
                  </div>

                  <div className="bg-background backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 shadow-xl">
                      <div className="w-full text-center">
                          <h2 className="text-2xl font-bold text-white">Customize</h2>
                          <div className="w-full h-[2px] bg-white/20 mt-2 mb-6"></div>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                          <input
                              type="file"
                              accept="image/png"
                              onChange={handleFileChange}
                              className="hidden"
                              id="file-upload"
                          />
                          <label
                              htmlFor="file-upload"
                              className="w-full py-4 px-6 text-lg font-medium text-center cursor-pointer
                         bg-white text-black rounded-lg hover:bg-gray-100
                         transition-colors duration-200 ease-in-out
                         border-2 border-transparent hover:border-white"
                          >
                              Upload New Skin
                          </label>
                          {/* <p className="text-sm text-gray-300 text-center">
                Supported format: PNG only
              </p> */}
                          <button
                              onClick={() => setShowSkinsModal(true)}
                              className="w-full py-4 px-6 text-lg font-medium text-center cursor-pointer
                         bg-white text-black rounded-lg hover:bg-gray-100
                         transition-colors duration-200 ease-in-out
                         border-2 border-transparent hover:border-white"
                          >
                              Select Skin
                          </button>
                          <button
                              onClick={() => setShowCapesModal(true)}
                              className="w-full py-4 px-6 text-lg font-medium text-center cursor-pointer
                         bg-white text-black rounded-lg hover:bg-gray-100
                         transition-colors duration-200 ease-in-out
                         border-2 border-transparent hover:border-white"
                          >
                              Select Cape
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          <AlertDialog open={showSlimModal} onOpenChange={setShowSlimModal}>
              <AlertDialogContent>
                  <AlertDialogTitle>Select Skin Type</AlertDialogTitle>
                  <AlertDialogDescription>
                      Do you want to apply the skin in slim mode?
                  </AlertDialogDescription>
                  <div className="flex space-x-4">
                      <AlertDialogAction onClick={() => handleSkinUpload(true)}>Yes (Slim)</AlertDialogAction>
                      <AlertDialogAction onClick={() => handleSkinUpload(false)}>No (Regular)</AlertDialogAction>
                  </div>
              </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showSkinsModal} onOpenChange={setShowSkinsModal}>
              <AlertDialogContent className="max-w-4xl">
                  <AlertDialogTitle>Select a Skin</AlertDialogTitle>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {skins.map((skin) => (
                          <div
                              key={skin.uuid}
                              className="bg-background rounded-lg overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-colors"
                          >
                              <div className="relative">
                                  <img
                                      src={`${API_URL}/skin/body/${skin.uuid}?size=100`}
                                      alt={skin.name}
                                      className="w-full h-auto"
                                  />
                              </div>
                              <div className="p-3 text-center bg-background">
                                  <p className="text-sm text-gray-300 truncate">{skin.name}</p>
                                  <div className="mt-2 flex gap-2 justify-center p-2 border-2 border-gray-700 rounded-lg mx-2 mb-2">
                                      <Button
                                          size="sm"
                                          className="default"
                                          onClick={() => handleSelectSkin(skin.uuid, setShowSkinsModal)}
                                      >
                                          Select
                                      </Button>
                                      <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeleteSkin(skin.uuid)}
                                      >
                                          Delete
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showCapesModal} onOpenChange={setShowCapesModal}>
              <AlertDialogContent className="max-w-4xl">
                  <AlertDialogTitle>Select a Cape</AlertDialogTitle>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {capes.map((cape) => (
                          <div
                              key={cape.Id}
                              className="bg-background rounded-lg overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-colors"
                          >
                              <div className="relative">
                                  <img
                                      src={`${API_URL}/skin/cloak/${cape.Id}?size=100`}
                                      alt={cape.Name}
                                      className="w-full h-auto"
                                  />
                              </div>
                              <div className="p-3 text-center bg-background">
                                  <p className="text-sm text-gray-300 truncate">{cape.Name}</p>
                                  <div className="mt-2 flex gap-2 justify-center p-2 border-2 border-gray-700 rounded-lg mx-2 mb-2">
                                      <Button
                                          size="sm"
                                          className="default"
                                          onClick={() => handleSelectCape(cape.Id)}
                                      >
                                          Select
                                      </Button>
                                      <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                              setShowCapesModal(false);
                                              toast.success("Cape deletion functionality coming soon");
                                          }}
                                      >
                                          Delete
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
              <AlertDialogContent>
                  <AlertDialogTitle>Finish Registration</AlertDialogTitle>
                  <AlertDialogDescription>
                      Please create an account.
                  </AlertDialogDescription>
                  <div className="space-y-4">
                      {requiresUsername && (
                          <Input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                      )}
                      {requiresPassword && (
                          <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      )}
                  </div>
                  <AlertDialogAction onClick={handleRegister}>Register</AlertDialogAction>
              </AlertDialogContent>
          </AlertDialog>
      </div>
  );
};

export default Home;
