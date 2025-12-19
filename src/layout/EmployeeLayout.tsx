import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmployeeSidebar } from "./EmployeeSidebar";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { supabase } from "@/api/api";
import { useNavigate } from "react-router-dom";
import AccountSettingsModal from "@/components/AccountSettingsModal";

export default function EmployeeLayout() {
  const [user, setUser] = useState<any>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleAccountSettings = () => {
    setIsPopoverOpen(false);
    setIsAccountSettingsOpen(true);
  };

  const handleLogout = async () => {
    setIsPopoverOpen(false);
    await supabase.auth.signOut();
    navigate('/login');
  };

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
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Employee" />
                  <AvatarFallback>
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'E'}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Employee" />
                      <AvatarFallback>
                        {user?.email ? user.email.charAt(0).toUpperCase() : 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.email || 'Loading...'}
                      </p>
                      <p className="text-xs text-muted-foreground">Employee</p>
                    </div>
                  </div>
                  <Separator className="mb-2" />
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8 px-2"
                      onClick={handleAccountSettings}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>

      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        userRole="employee"
      />
    </SidebarProvider>
  );
}