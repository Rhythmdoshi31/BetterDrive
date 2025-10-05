import React, { useState } from "react";
import Toggle from "./toggleDarkMode";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "./ui/resizable-navbar"; // adjust path where you saved it

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Smooth scroll function
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(link.slice(1));
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const handleConnectDrive = (): void => {
    // window.location.href = "http://localhost:3000/auth/google";
    window.location.href = "https://betterdrive.rhythmdoshi.site/vip-list"
  };

  const items = [
    { name: "Home", link: "#home" },
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "Contact", link: "#contact" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems 
            items={items.map(item => ({
              ...item,
              onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, item.link)
            }))} 
          />
          <div className="flex items-center justify-center gap-4 z-[60]">
            <NavbarButton variant="gradient" onClick={handleConnectDrive}>
              Join VIP List {/* Connect Drive */}
            </NavbarButton>
            <Toggle />
          </div>
        </NavBody>
      </Navbar>

      {/* Mobile Navbar */}
      <Navbar>
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center justify-center gap-2 z-[60]">
              <MobileNavToggle
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
              />
              <Toggle />
            </div>
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                className="block w-full px-4 py-2 text-gray-700 dark:text-gray-300"
                onClick={(e) => {
                  handleSmoothScroll(e, item.link);
                  setIsOpen(false); // Close mobile menu after clicking
                }}
              >
                {item.name}
              </a>
            ))}
            <NavbarButton 
              variant="dark" 
              className="mt-4"
              onClick={handleConnectDrive}
            >
              Join VIP List {/* Connect Drive */}
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>    
    </>
  )
}

export default NavBar;
