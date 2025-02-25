"use client";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/navbar";

export default function AdminDashboard() {
  const router = useRouter();

  const pages = [
    {
      title: "User management",
      description: "Viewing and editing users",
      path: "/admin/users",
    },
    {
      title: "Skin management",
      description: "Viewing and editing skins",
      path: "/admin/skins",
    },
    {
      title: "Cloak management",
      description: "Viewing and editing capes",
      path: "/admin/capes",
    },
    {
      title: "Statistics",
      description: "Viewing system statistics",
      path: "/admin/stats",
    },
    {
      title: "Settings",
      description: "System settings",
      path: "/admin/settings",
    },
    {
        title: "Audit",
        description: "Audit",
        path: "/admin/audit",
    },
  ];

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(page.path)} className="w-full">
                  Go to
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}