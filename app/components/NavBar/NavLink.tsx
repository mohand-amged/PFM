"use client";

import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactElement } from "react";

const NavLink = ({ navLink }: { navLink: {link: string; label: string[]; icon: ReactElement} | { link: string; label: string; icon: ReactElement } }) => {
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
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      {label}
    </Link>
  );
};

export default NavLink;