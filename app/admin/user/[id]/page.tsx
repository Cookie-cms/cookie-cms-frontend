/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Search, 
  User, 
  Mail, 
  Shield, 
  Image, 
  Check, 
  X, 
  Edit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Images from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
    username?: string;
    avatar?: string;
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
  const [userSkins, setUserSkins] = useState<User["Skins"]>([]);
  const [userOwnedCapeIds, setUserOwnedCapeIds] = useState<string[]>([]);
  const [allCapes, setAllCapes] = useState<Cape[]>([]);
  const [isSkinModalOpen, setIsSkinModalOpen] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<User["Skins"][0] | null>(null);
  const [skinFormData, setSkinFormData] = useState<Partial<User["Skins"][0]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const cookie = Cookies.get("cookiecms_cookie");
    if (!cookie) {
        window.location.href = "/";
        return;
    }
    const fetchData = async () => {
      const token = Cookies.get("cookiecms_cookie");

      if (!token) {
        router.push("/signin");
        return;
      }

      try {
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
        setUserSkins(userResult.data.Skins);
        setUserOwnedCapeIds(userResult.data.Capes.map((cape: { Id: string }) => cape.Id));

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
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

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

  const handleCapeToggle = (capeId: string) => {
    setUserOwnedCapeIds((prev) =>
      prev.includes(capeId)
        ? prev.filter((id) => id !== capeId)
        : [...prev, capeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      toast.loading("Updating user data...");
      
      const response = await fetch(`${API_URL}/admin/user/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          Capes: userOwnedCapeIds.map((id) => ({ Id: id })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const result = await response.json();
      setUser(result.data);
      setIsEditing(false);
      toast.dismiss();
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.dismiss();
      toast.error("Failed to update user data");
    }
  };

  const openSkinEditModal = (skin: User["Skins"][0]) => {
    setSelectedSkin(skin);
    setSkinFormData(skin);
    setIsSkinModalOpen(true);
  };

  const closeSkinEditModal = () => {
    setIsSkinModalOpen(false);
    setSelectedSkin(null);
    setSkinFormData({});
  };

  const handleSkinFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSkinFormData({
      ...skinFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveSkinChanges = async () => {
    if (!selectedSkin) return;

    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      toast.loading("Updating skin...");
      
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
      toast.dismiss();
      toast.success("Skin updated successfully");
    } catch (error) {
      console.error("Error updating skin:", error);
      toast.dismiss();
      toast.error("Failed to update skin");
    }
  };

  const handleDeleteSkin = async () => {
    if (!selectedSkin) return;

    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      toast.loading("Deleting skin...");
      
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
      toast.dismiss();
      toast.success("Skin deleted successfully");
    } catch (error) {
      console.error("Error deleting skin:", error);
      toast.dismiss();
      toast.error("Failed to delete skin");
    }
  };

  const renderPermissionBadge = (permLevel: number) => {
    switch(permLevel) {
      case 1:
        return <Badge variant="secondary">User</Badge>;
      case 2:
        return <Badge variant="destructive">HD Skins</Badge>;
      case 3:
        return <Badge variant="destructive">Admins</Badge>;
      default:
        return <Badge variant="outline">{permLevel}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-[200px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center p-8 h-[80vh]">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-6">The user you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push("/admin/users")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const filteredCapes = allCapes.filter(cape => 
    cape.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{user.Username}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/users")}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            
            {/* <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div> */}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage
              src={
                user.Discord?.userid && user.Discord?.avatar
                  ? `https://cdn.discordapp.com/avatars/${user.Discord.userid}/${user.Discord.avatar}?size=256`
                  : undefined
              }
              alt={user.Username}
            />
            <AvatarFallback className="text-lg">
              {user.Username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{user.Username}</h1>
              {renderPermissionBadge(user.PermLvl)}
              {user.Mail_verify ? (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  <Check className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                  <X className="h-3 w-3 mr-1" /> Unverified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">UUID: {user.Uuid}</p>
          </div>
        </div>
        
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="details" className="flex items-center">
              <User className="mr-2 h-4 w-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="skins" className="flex items-center">
              <Image className="mr-2 h-4 w-4" /> Skins
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Information</CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="username">
                          Username
                        </label>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            name="Username"
                            value={formData.Username || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="uuid">
                          UUID
                        </label>
                        <Input
                          id="uuid"
                          value={formData.Uuid || ""}
                          disabled
                          className="bg-muted/40 font-mono text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                          Email
                        </label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="Mail"
                            value={formData.Mail || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="permissions">
                          Permissions
                        </label>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <Select
                            value={formData.PermLvl?.toString() || "0"}
                            onValueChange={(value) =>
                              setFormData({ ...formData, PermLvl: parseInt(value, 10) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select permission level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">User (1)</SelectItem>
                              <SelectItem value="2">HD Skins (2)</SelectItem>
                              <SelectItem value="3">Admin (3)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {formData.Discord && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="discord-id">
                            Discord ID
                          </label>
                          <div className="flex items-center space-x-2">
                            {/* <Images
                              src="/svg/discord.svg"
                              alt="Discord Icon"
                              width={24}
                              height={24}
                              className="h-4 w-4 text-muted-foreground"
                            /> */}
                            <Input
                              id="discord-id"
                              type="number"
                              value={formData.Discord.userid || ""}
                              onChange={handleDiscordIdChange}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email-verified">
                          Email Verified
                        </label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="email-verified"
                            checked={!!formData.Mail_verify}
                            onCheckedChange={(checked) =>
                              setFormData({ 
                                ...formData, 
                                Mail_verify: checked ? 1 : 0,
                                Mail_verification: !!checked
                              })
                            }
                          />
                          <label htmlFor="email-verified" className="text-sm">
                            Mark as verified
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-6">                    
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          User&apos;s Capes
                        </label>
                        <div className="border rounded-md p-4 max-h-56 overflow-y-auto">
                          <Input 
                            placeholder="Search capes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-4"
                          />
                          <div className="space-y-2">
                            {filteredCapes.length > 0 ? (
                              filteredCapes.map((cape) => (
                                <div key={cape.uuid} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                                  <Checkbox
                                    id={`cape-${cape.uuid}`}
                                    checked={userOwnedCapeIds.includes(cape.uuid)}
                                    onCheckedChange={() => handleCapeToggle(cape.uuid)}
                                  />
                                  <label htmlFor={`cape-${cape.uuid}`} className="flex-1 text-sm cursor-pointer">
                                    {cape.name}
                                  </label>
                                  <span className="text-xs text-muted-foreground font-mono">{cape.uuid.substring(0, 8)}...</span>
                                </div>
                              ))
                            ) : (
                              <div className="py-2 text-center text-sm text-muted-foreground">
                                No capes match your search
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Selected Skin
                        </label>
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
                            {user.Skins.length > 0 ? (
                              user.Skins.map((skin) => (
                                <SelectItem key={skin.uuid} value={skin.uuid}>
                                  {skin.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                                No skins available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Username</h3>
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.Username}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">UUID</h3>
                        <p className="text-sm font-mono">{user.Uuid}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.Mail}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Verified</h3>
                        <p>
                          {user.Mail_verify ? (
                            <span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                              <Check className="h-3 w-3 mr-1" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs">
                              <X className="h-3 w-3 mr-1" /> Not Verified
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Permissions</h3>
                        <p className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          {renderPermissionBadge(user.PermLvl)}
                        </p>
                      </div>
                      {user.Discord && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Discord</h3>
                          <div className="flex items-center space-x-2">
                            {/* <Images
                              src="/svg/discord.svg"
                              alt="Discord Icon"
                              width={16}
                              height={16}
                              className="h-4 w-4 text-muted-foreground"
                            /> */}
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={
                                  user.Discord?.userid && user.Discord?.avatar
                                    ? `https://cdn.discordapp.com/avatars/${user.Discord.userid}/${user.Discord.avatar}?size=256`
                                    : undefined
                                }
                                alt="Discord Avatar"
                              />
                              <AvatarFallback className="text-xs">
                                {user.Username?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {user.Discord.username} 
                              <span className="text-xs text-muted-foreground ml-1">
                                ({user.Discord.userid})
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Selected Skin</h3>
                        <p>
                          {user.Skins.find((skin) => skin.uuid === user.Selected_Skin)?.name || "None"}
                          {user.Selected_Skin && (
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                              ({user.Selected_Skin.substring(0, 8)}...)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Selected Cape</h3>
                        <p>
                          {user.Capes.find((cape) => cape.Id === user.Selected_Cape)?.Name || "None"}
                          {user.Selected_Cape && (
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                              ({user.Selected_Cape.substring(0, 8)}...)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skins">
            <div className="grid grid-cols-2 gap-4">
              {userSkins.map((skin) => (
                <div key={skin.uuid} className="flex flex-col items-center p-4 border rounded-lg">
                  <img
                    src={`${API_URL}/skin/body/${skin.uuid}?size=100`}
                    alt="Skin Preview"
                    className="border"
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
                  setSkinFormData({ ...skinFormData, slim: checked === "indeterminate" ? false : checked })
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