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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


interface AuditEntry {
  id: number;
  iss: string;
  action: string;
  target_id: string | number;
  old_value: string | null;
  new_value: string | null;
  field_changed: string | null;
  time: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminAuditTable() {
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAuditData, setFilteredAuditData] = useState<AuditEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // Fetch audit data on component mount
  useEffect(() => {
    const fetchAuditData = async () => {
      const token = Cookies.get("cookiecms_cookie");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/admin/audit`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch audit data");
        }

        const result = await response.json();

        if (result.error) {
          throw new Error("API returned error");
        }

        setAuditData(result.data);
        setFilteredAuditData(result.data); // Initialize filtered data with all data
      } catch (error) {
        console.error("Error fetching audit data:", error);
        toast.error("Failed to load audit data");
        setAuditData([]);
        setFilteredAuditData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
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

  // Filter audit data based on parsed search term
  const filterAuditData = (data: AuditEntry[], filters: { [key: string]: string }) => {
    return data.filter((audit) => {
      return Object.entries(filters).every(([key, value]) => {
        switch (key) {
          case "date":
            // Filter by date (assuming `time` is a Unix timestamp)
            const auditDate = new Date(audit.time * 1000).toISOString().split("T")[0];
            return auditDate === value;
          case "datefrom":
            // Filter by date range (from)
            const fromDate = new Date(value).getTime() / 1000;
            return audit.time >= fromDate;
          case "dateto":
            // Filter by date range (to)
            const toDate = new Date(value).getTime() / 1000;
            return audit.time <= toDate;
          case "iss":
            // Filter by issuer ID
            return audit.iss.toString() === value;
          case "target":
            // Filter by target ID
            return audit.target_id.toString() === value;
          case "action":
            // Filter by action
            return audit.action.toLowerCase().includes(value.toLowerCase());
          default:
            // Fallback: search across all fields
            return Object.values(audit).some(
              (val) =>
                val && val.toString().toLowerCase().includes(value.toLowerCase())
            );
        }
      });
    });
  };
 // Pagination calculations
 const totalPages = Math.ceil(filteredAuditData.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const endIndex = startIndex + itemsPerPage;
 const currentItems = filteredAuditData.slice(startIndex, endIndex);

 const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
   <div className="flex items-center justify-between px-4 py-3 border-t">
     <div>
       <p className="text-sm text-gray-700">
         Showing {startIndex + 1} to {Math.min(endIndex, filteredAuditData.length)} of{" "}
         {filteredAuditData.length} entries
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
  // Update filtered data when search term changes
  useEffect(() => {
    const filters = parseSearchTerm(searchTerm);
    const filteredData = filterAuditData(auditData, filters);
    setFilteredAuditData(filteredData);
  }, [searchTerm, auditData]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (auditData.length === 0) {
    return (
      <div className="min-h-screen text-foreground flex flex-col p-8">
        <Navbar />
        <div className="text-center mt-8">No audit data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
    <div className="flex justify-end mb-4 p-2.5">
        <div className="flex items-center w-full max-w-sm space-x-2 rounded-lg border px-3.5 py-2">
          <Search className="text-gray-400" /> {/* Search icon */}
          <Input
            type="search"
            placeholder="Search logs (e.g., date:2023-10-01, iss:34, target:123)..."
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
            <th className="py-2 px-4 border-b">Issuer ID (iss:)</th>
            <th className="py-2 px-4 border-b">Action (action:)</th>
            <th className="py-2 px-4 border-b">Target ID (target:)</th>
            <th className="py-2 px-4 border-b">Old Value</th>
            <th className="py-2 px-4 border-b">New Value</th>
            <th className="py-2 px-4 border-b">Field Changed</th>
            <th className="py-2 px-4 border-b">Time (date:, datefrom:, dateto:)</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((audit) => (
            <tr key={audit.id} className="hover:bg-gray-50 hover:text-blue-600">
              <td className="py-2 px-4 border-b">{audit.id}</td>
              <td className="py-2 px-4 border-b">{audit.iss}</td>
              <td className="py-2 px-4 border-b">{audit.action}</td>
              <td className="py-2 px-4 border-b">{audit.target_id}</td>
              <td className="py-2 px-4 border-b">{audit.old_value || "N/A"}</td>
              <td className="py-2 px-4 border-b">{audit.new_value || "N/A"}</td>
              <td className="py-2 px-4 border-b">{audit.field_changed || "N/A"}</td>
              <td className="py-2 px-4 border-b">
                {new Date(audit.time * 1000).toLocaleString()}
              </td>
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