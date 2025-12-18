import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, ShoppingCart, Package, Users, CreditCard, LogOut } from "lucide-react";
import Logo from "@/assets/logo.svg";

const adminLinks = [
  { name: "Dashboard", path: "/admin/dashboard", icon: Home },
  { name: "Products", path: "/admin/products", icon: ShoppingCart },
  { name: "Inventory", path: "/admin/inventory", icon: Package },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/admin/dashboard" className="flex items-center justify-center gap-2">
          <img src={Logo} alt="Clothify" className="h-8 w-8" />
          {state === "expanded" && (
            <span className="text-lg font-bold transition-opacity duration-300 opacity-100">
              Clothify
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);

                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.name}
                    >
                      <Link to={link.path}>
                        <Icon className="h-5 w-5" />
                        <span>{link.name}</span>
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
            <SidebarMenuButton asChild tooltip="Logout">
              <Link to="/">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
