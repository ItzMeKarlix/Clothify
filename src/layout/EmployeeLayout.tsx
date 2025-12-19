import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmployeeSidebar } from "./EmployeeSidebar";
import { Bell, Search } from "lucide-react";

export default function EmployeeLayout() {
  return (
    <SidebarProvider>
      <EmployeeSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-black">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-red-500 text-white text-xs rounded-full">
                2
              </span>
            </button>
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
              <AvatarImage src="https://github.com/shadcn.png" alt="Employee" />
              <AvatarFallback>EM</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}