"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactElement } from "react";

interface NavLinkProps {
  navLink: {
    link: string;
    label: string | string[];
    icon: ReactElement<{ className?: string }>;
  };
}

const NavLink = ({ navLink }: NavLinkProps) => {
  const { label, icon } = navLink;
  const pathName = usePathname();
  const isActive = pathName === navLink.link;

  return (
    <Link
      href={navLink.link}
      className={`flex ${
        isActive ? "text-emerald-500" : "text-gray-50"
      } hover:text-emerald-500 my-2 duration-200 gap-2 items-center p-2 rounded-md`}
    >
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      {label}
    </Link>
  );
};

export default NavLink;