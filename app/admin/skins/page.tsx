"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/shared/navbar";
import { Search, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


interface Skin {
  uuid: string;
  name: string;
  ownerid: number;
  slim: number; // 0 or 1
  hd: number; // 0 or 1
  cloak_id: string | null;
}

export default function AdminSkins() {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [skinFormData, setSkinFormData] = useState<Partial<Skin>>({});
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch all skins on component mount
  useEffect(() => {
    const fetchSkins = async () => {
      const token = Cookies.get("cookiecms_cookie");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/admin/skins`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch skins");
        }

        const result = await response.json();
        setSkins(result.data);
      } catch (error) {
        console.error("Error fetching skins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkins();
  }, [API_URL, router]);

  // Handle search
  const filteredSkins = skins.filter((skin) =>
    skin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open edit modal
  const openEditModal = (skin: Skin) => {
    setSelectedSkin(skin);
    setSkinFormData(skin); // Initialize form data with the selected skin
    setIsEditModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSkin(null);
    setSkinFormData({});
  };

  // Handle input changes for skin form
  const handleSkinFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSkinFormData({
      ...skinFormData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
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
      setSkins((prev) =>
        prev.map((skin) => (skin.uuid === selectedSkin.uuid ? result.data : skin))
      );
      closeEditModal();
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

      setSkins((prev) => prev.filter((skin) => skin.uuid !== selectedSkin.uuid));
      closeEditModal();
      toast.success("Skin deleted successfully");
    } catch (error) {
      console.error("Error deleting skin:", error);
      toast.error("Failed to delete skin");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
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
            <BreadcrumbLink href="/skins">Skins list</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Skins list</h1>

        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" />
            <Input
              type="search"
              placeholder="Поиск скинов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
          </div>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSkins.map((skin) => (
            <Card key={skin.uuid} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{skin.name}</CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    <img src={`${API_URL}/skin/body/${skin.uuid}?size=100`} alt={skin.name} />
                    <p className="text-sm">UUID: {skin.uuid}</p>
                    <p className="text-sm">Owner: {skin.ownerid}</p>
                    <p className="text-sm">Type: {skin.slim === 1 ? "Slim" : "Classic"}</p>
                    <p className="text-sm">HD: {skin.hd === 1 ? "Yes" : "No"}</p>
                    <p className="text-sm">Cape: {skin.cloak_id || "None"}</p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(skin)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedSkin(skin);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Skin Modal */}
      <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Редактировать скин</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Имя скина</label>
              <Input
                name="name"
                value={skinFormData.name || ""}
                onChange={handleSkinFormChange}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Тип скина</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="slim"
                  checked={skinFormData.slim === 1}
                  onCheckedChange={(checked) =>
                    setSkinFormData({ ...skinFormData, slim: checked ? 1 : 0 })
                  }
                />
                <span>Slim</span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">HD</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="hd"
                  checked={skinFormData.hd === 1}
                  onCheckedChange={(checked) =>
                    setSkinFormData({ ...skinFormData, hd: checked ? 1 : 0 })
                  }
                />
                <span>HD</span>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Отмена</Button>
            </AlertDialogCancel>
            <Button onClick={handleSaveSkinChanges}>Сохранить</Button>
            <Button variant="destructive" onClick={handleDeleteSkin}>
              Удалить
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}