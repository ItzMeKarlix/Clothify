import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, ShoppingCart, Package, Users, CreditCard, LogOut, Settings, Info, Users2 } from "lucide-react";
import { authService } from "../api/api";
import toast from "react-hot-toast";
import Logo from "@/assets/logo.svg";

const mainLinks = [
  { name: "Dashboard", path: "/admin/dashboard", icon: Home },
  { name: "Products", path: "/admin/products", icon: ShoppingCart },
  { name: "Inventory", path: "/admin/inventory", icon: Package },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
];

const otherLinks = [
  { name: "Members", path: "/admin/members", icon: Users2 },
  { name: "Settings", path: "/admin/settings", icon: Settings },
  { name: "Information", path: "/admin/information", icon: Info },
];

export function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/admin/dashboard" className="flex items-center justify-center gap-2">
          <img src={Logo} alt="Clothify" className="h-10 w-10" />
          {state === "expanded" && (
            <span className="text-xl font-bold transition-opacity duration-300 opacity-100">
              Clothify
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);

                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500 rounded-none" : ""}
                      tooltip={link.name}
                    >
                      <Link to={link.path}>
                        <Icon className="h-8 w-8" />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Others</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);

                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500 rounded-none" : ""}
                      tooltip={link.name}
                    >
                      <Link to={link.path}>
                        <Icon className="h-8 w-8" />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="h-8 w-8" />
              <span className="text-sm">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
