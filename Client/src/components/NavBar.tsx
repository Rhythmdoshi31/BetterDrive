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


const NavBar : React.FC = () => {

    const [isOpen, setIsOpen] = useState(false);

  const items = [
    { name: "Home", link: "#" },
    { name: "Features", link: "#" },
    { name: "Pricing", link: "#" },
    { name: "Contact", link: "#" },
  ];
    
  return (
    <>
        <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={items} />
          <div className="flex items-center justify-center gap-4 z-[60]">
            <NavbarButton variant="gradient">Connect Drive</NavbarButton>
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
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <NavbarButton variant="dark" className="mt-4">
              Connect Drive
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>    
    </>
  )
}

export default NavBar;