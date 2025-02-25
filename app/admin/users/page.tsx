"use client";

import Navbar from "@/components/shared/navbar";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: number;
  username: string;
  dsid: string;
  mail: string;
  mail_verify: number;
  uuid: string;
  password: string;
  perms: number;
  accessToken: string | null;
  serverID: string | null;
  hwidId: string | null;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminUserTable() {
  const [userData, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUserData, setFilteredUserData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("cookiecms_cookie");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/admin/users/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const result = await response.json();

        if (result.error) {
          throw new Error("API returned error");
        }

        setUserData(result.data);
        setFilteredUserData(result.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
        setUserData([]);
        setFilteredUserData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [API_URL, router]);

  // Parse search term into key-value pairs
  const parseSearchTerm = (term: string) => {
    const filters: { [key: string]: string } = {};
    const parts = term.split(",");

    parts.forEach((part) => {
      const [key, value] = part.split(":").map((s) => s.trim());
      if (key && value) {
        filters[key] = value;
      }
    });

    return filters;
  };

  // Filter user data based on parsed search term
  const filterUserData = (data: User[], filters: { [key: string]: string }) => {
    return data.filter((user) => {
      return Object.entries(filters).every(([key, value]) => {
        switch (key) {
          case "username":
            return user.username.toLowerCase().includes(value.toLowerCase());
          case "dsid":
            return user.dsid.toString() === value;
          case "mail":
            return user.mail.toLowerCase().includes(value.toLowerCase());
          case "uuid":
            return user.uuid.toLowerCase().includes(value.toLowerCase());
          case "perms":
            return user.perms.toString() === value;
          default:
            return Object.values(user).some(
              (val) =>
                val && val.toString().toLowerCase().includes(value.toLowerCase())
            );
        }
      });
    });
  };

  // Update filtered data when search term changes
  useEffect(() => {
    const filters = parseSearchTerm(searchTerm);
    const filteredData = filterUserData(userData, filters);
    setFilteredUserData(filteredData);
    setCurrentPage(1);
  }, [searchTerm, userData]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUserData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredUserData.slice(startIndex, endIndex);

  // Handle row click to redirect to user details page
  const handleRowClick = (user: User) => {
    router.push(`/admin/user/${user.id}`);
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div>
        <p className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredUserData.length)} of{" "}
          {filteredUserData.length} entries
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (userData.length === 0) {
    return (
      <div className="min-h-screen text-foreground flex flex-col p-8">
        <Navbar />
        <div className="text-center mt-8">No user data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Navbar />
  
      <div className="flex justify-end mb-4 p-2.5">
        <div className="flex items-center w-full max-w-sm space-x-2 rounded-lg border px-3.5 py-2">
          <Search className="text-gray-400" />
          <Input
            type="search"
            placeholder="Search users (e.g., username:admin, dsid:123456789)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:outline-none focus:ring-0 border-none w-full"
          />
        </div>
      </div>
  
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">DSID</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Email Verified</th>
              <th className="py-2 px-4 border-b">UUID</th>
              <th className="py-2 px-4 border-b">Permissions</th>
              <th className="py-2 px-4 border-b">HWID</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                onClick={() => handleRowClick(user)}
              >
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.dsid}</td>
                <td className="py-2 px-4 border-b">{user.mail}</td>
                <td className="py-2 px-4 border-b">{user.mail_verify ? "Yes" : "No"}</td>
                <td className="py-2 px-4 border-b">{user.uuid}</td>
                <td className="py-2 px-4 border-b">{user.perms}</td>
                <td className="py-2 px-4 border-b">{user.hwidId || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}