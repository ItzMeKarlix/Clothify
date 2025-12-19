import React, { ReactNode, useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ScrollArea } from "../components/ui/scroll-area";
import { Toaster } from "react-hot-toast";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header isVisible={isHeaderVisible} />
      <ScrollArea className="grow pt-16 w-full">
        <main className="px-4 relative">
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            containerStyle={{
              top: isHeaderVisible ? '80px' : '16px',
              right: '16px',
              position: 'fixed',
              zIndex: 50
            }}
          />
          {children}
        </main>
        <Footer />
      </ScrollArea>
    </div>
  );
};

export default Layout;
