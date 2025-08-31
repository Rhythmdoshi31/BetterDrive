export interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

export interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}