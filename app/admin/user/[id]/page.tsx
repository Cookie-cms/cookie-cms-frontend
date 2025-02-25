"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


interface User {
  Username: string;
  Uuid: string;
  Mail: string;
  Mail_verify: number;
  Selected_Cape: string;
  Selected_Skin: string;
  PermLvl: number;
  Capes: { Id: string; Name: string }[];
  Skins: { uuid: string; name: string; cloak_id: string; slim: boolean }[];
  Discord_integration: boolean;
  Discord: {
    userid: number;
    username: string;
    avatar: string;
  };
  Mail_verification: boolean;
}

interface Cape {
  uuid: string;
  name: string;
}

export default function UserDetails({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [userSkins, setUserSkins] = useState<User["Skins"]>([]); // Store user skins
  const [userOwnedCapeIds, setUserOwnedCapeIds] = useState<string[]>([]); // Store capes owned by the user
  const [allCapes, setAllCapes] = useState<Cape[]>([]); // Store all available capes
  const [isSkinModalOpen, setIsSkinModalOpen] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<User["Skins"][0] | null>(null); // Store the selected skin for editing
  const [skinFormData, setSkinFormData] = useState<Partial<User["Skins"][0]>>({}); // Store form data for the selected skin
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch user data and all capes on component mount
  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("cookiecms_cookie");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch user data
        const userResponse = await fetch(`${API_URL}/admin/user/${params.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userResult = await userResponse.json();
        setUser(userResult.data);
        setFormData(userResult.data);
        setUserSkins(userResult.data.Skins); // Store user skins
        setUserOwnedCapeIds(userResult.data.Capes.map((cape) => cape.Id)); // Store cape IDs

        // Fetch all capes
        const capesResponse = await fetch(`${API_URL}/admin/allcapes`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!capesResponse.ok) {
          throw new Error("Failed to fetch capes");
        }

        const capesResult = await capesResponse.json();
        setAllCapes(capesResult.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, params.id, router]);

  // Handle input changes for user details
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle Discord ID changes
  const handleDiscordIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      Discord: {
        ...formData.Discord,
        userid: parseInt(value, 10),
      },
    });
  };

  // Handle cape toggling
  const handleCapeToggle = (capeId: string) => {
    setUserOwnedCapeIds((prev) =>
      prev.includes(capeId)
        ? prev.filter((id) => id !== capeId) // Remove cape
        : [...prev, capeId] // Add cape
    );
  };

  // Handle form submission for user details
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/user/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          Capes: userOwnedCapeIds.map((id) => ({ Id: id })), // Update user's capes
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const result = await response.json();
      setUser(result.data); // Update the displayed user data
      setIsEditing(false); // Exit edit mode
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update user data");
    }
  };

  // Open skin edit modal
  const openSkinEditModal = (skin: User["Skins"][0]) => {
    setSelectedSkin(skin);
    setSkinFormData(skin); // Initialize form data with the selected skin
    setIsSkinModalOpen(true);
  };

  // Close skin edit modal
  const closeSkinEditModal = () => {
    setIsSkinModalOpen(false);
    setSelectedSkin(null);
    setSkinFormData({});
  };

  // Handle input changes for skin form
  const handleSkinFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSkinFormData({
      ...skinFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle save changes for skin
  const handleSaveSkinChanges = async () => {
    if (!selectedSkin) return;

    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/skin/${selectedSkin.uuid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(skinFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update skin");
      }

      const result = await response.json();
      setUserSkins((prev) =>
        prev.map((skin) => (skin.uuid === selectedSkin.uuid ? result.data : skin))
      );
      closeSkinEditModal();
      toast.success("Skin updated successfully");
    } catch (error) {
      console.error("Error updating skin:", error);
      toast.error("Failed to update skin");
    }
  };

  // Handle delete skin
  const handleDeleteSkin = async () => {
    if (!selectedSkin) return;

    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/skin/${selectedSkin.uuid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete skin");
      }

      setUserSkins((prev) => prev.filter((skin) => skin.uuid !== selectedSkin.uuid));
      closeSkinEditModal();
      toast.success("Skin deleted successfully");
    } catch (error) {
      console.error("Error deleting skin:", error);
      toast.error("Failed to delete skin");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen text-foreground flex flex-col p-8">
        <div className="text-center mt-8">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Navbar />
      <Breadcrumb class="p-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink >User </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/users")}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="justify-end">
          <div className="flex max-w-sm space-x-2 rounded-lg border px-3.5 py-2">
            <Search className="text-gray-400" />
            <Input
              type="search"
              placeholder="Search users (e.g., username:admin, dsid:123456789)..."
              className="focus:outline-none focus:ring-0 border-none w-full"
            />
          </div>
        </div>
        <div /> {/* Spacer */}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <Tabs defaultValue="details">

          <TabsList>
            <TabsTrigger value="details">User Details</TabsTrigger>
            <TabsTrigger value="skins">Skins Users</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">Username</label>
                    <Input
                      name="Username"
                      value={formData.Username || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">UUID</label>
                    <Input
                      value={formData.Uuid || ""}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">Email</label>
                    <Input
                      name="Mail"
                      value={formData.Mail || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">Email Verified</label>
                    <Checkbox
                      name="Mail_verify"
                      checked={!!formData.Mail_verify}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, Mail_verify: checked ? 1 : 0 })
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">Permissions</label>
                    <Input
                      name="PermLvl"
                      type="number"
                      value={formData.PermLvl || ""}
                      onChange={handleChange}
                    />
                  </div>

                  {formData.Discord && (
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm text-gray-500">Discord ID</label>
                      <Input
                        type="number"
                        value={formData.Discord.userid || ""}
                        onChange={handleDiscordIdChange}
                      />
                    </div>
                  )}

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">Selected Cape</label>
                    <Select
                      value={formData.Selected_Cape || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, Selected_Cape: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cape" />
                      </SelectTrigger>
                      <SelectContent>
                        {userOwnedCapeIds.map((capeId) => {
                          const cape = allCapes.find((c) => c.uuid === capeId);
                          return (
                            <SelectItem key={capeId} value={capeId}>
                              {cape?.name || "Unknown Cape"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-500 mt-1">
                      Note: Can only select from capes the user owns
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">User's Capes</label>
                    <div className="border p-4 rounded-md max-h-48 overflow-y-auto">
                      {allCapes.map((cape) => (
                        <div key={cape.uuid} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`cape-${cape.uuid}`}
                            checked={userOwnedCapeIds.includes(cape.uuid)}
                            onCheckedChange={() => handleCapeToggle(cape.uuid)}
                          />
                          <label htmlFor={`cape-${cape.uuid}`} className="text-sm cursor-pointer">
                            {cape.name} <span className="text-xs text-gray-500">({cape.uuid})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm text-gray-500">Selected Skin</label>
                    <Select
                      value={formData.Selected_Skin || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, Selected_Skin: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skin" />
                      </SelectTrigger>
                      <SelectContent>
                        {user.Skins.map((skin) => (
                          <SelectItem key={skin.uuid} value={skin.uuid}>
                            {skin.name} <span className="text-xs text-gray-500">({skin.uuid})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <strong>Username: </strong>
                      {user.Username}
                    </div>
                    <div>
                      <strong>UUID: </strong>
                      <span className="text-sm font-mono">{user.Uuid}</span>
                    </div>
                    <div>
                      <strong>Email: </strong>
                      {user.Mail}
                    </div>
                    <div>
                      <strong>Mail Verified: </strong>
                      {user.Mail_verify ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Permissions: </strong>
                      {user.PermLvl}
                    </div>
                    {user.Discord && (
                      <div>
                        <strong>Discord ID: </strong>
                                                <Avatar>
                          <AvatarImage 
                            src={user.Discord?.userid && user.Discord?.avatar 
                              ? `https://cdn.discordapp.com/avatars/${user.Discord.userid}/${user.Discord.avatar}?size=256`
                              : undefined
                            }
                            alt="User avatar"
                          />
                          <AvatarFallback>
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {user.Discord.userid} ({user.Discord.username})
                      </div>
                    )}
                    <div>
                      <strong>Selected Skin: </strong>
                      {user.Skins.find((skin) => skin.uuid === user.Selected_Skin)?.name || "None"}
                      {user.Selected_Cape && (
                        <span className="text-sm text-gray-500">(UUID: {user.Selected_Cape})</span>
                      )}
                    </div>
                    <div>
                      <strong>Selected Cape: </strong>
                      {user.Capes.find((cape) => cape.Id === user.Selected_Cape)?.Name || "None"}
                      {user.Selected_Cape && (
                        <span className="text-sm text-gray-500">(UUID: {user.Selected_Cape})</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit User
                      </Button>
                    </div>
                  </div>
                </>
              )}

          </TabsContent>

          <TabsContent value="skins">
            <div className="grid grid-cols-2 gap-4">
              {userSkins.map((skin) => (
                <div key={skin.uuid} className="flex flex-col items-center p-4 border rounded-lg">
                  <img
                    src={`${API_URL}/skin/body/${skin.uuid}?size=100`}
                    alt="Skin Preview"
                    className=" border"
                  />
                  <p className="text-sm mt-2">{skin.name}</p>
                  <Button
                    variant="outline"
                    onClick={() => openSkinEditModal(skin)}
                    className="mt-2"
                  >
                    Edit Skin
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Skin Edit Modal */}
      <AlertDialog open={isSkinModalOpen} onOpenChange={setIsSkinModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Skin</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Skin Name</label>
              <Input
                name="name"
                value={skinFormData.name || ""}
                onChange={handleSkinFormChange}
              />
            </div>
      
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Slim Model</label>
              <Checkbox
                name="slim"
                checked={!!skinFormData.slim}
                onCheckedChange={(checked) =>
                  setSkinFormData({ ...skinFormData, slim: checked })
                }
              />
            </div>
      
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Cape</label>
              <Select
                value={skinFormData.cloak_id || ""}
                onValueChange={(value) =>
                  setSkinFormData({ ...skinFormData, cloak_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a cape" />
                </SelectTrigger>
                <SelectContent>
                  {allCapes.map((cape) => (
                    <SelectItem key={cape.uuid} value={cape.uuid}>
                      {cape.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <Button onClick={handleSaveSkinChanges}>Save Changes</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Skin</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the skin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSkin}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}