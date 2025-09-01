import React from 'react'
import Logo from '../defaults/Logo'
import { MdAnalytics, MdOutlineSpaceDashboard } from "react-icons/md";
import { MdOutlineAttachMoney } from "react-icons/md";
import NavLink from './NavLink';
import { Settings } from 'lucide-react';

export const NAV_LINKS = [
    { 
        label: "Dashboard",
        link: "/",
        icon: <MdOutlineSpaceDashboard className='w-5 h-5' />,
    },
    { 
        label: "Subscriptions", 
        link: "/subscriptions" ,
        icon: <MdOutlineAttachMoney className='w-5 h-5' />,
    },
    {
        label: "Analytics",
        link: "/analytics",
        icon: <MdAnalytics className="w-5 h-5" />,
    }
]

function SideBar() {
  return (
    <div className='hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 border-r border-gray-800 bg-black text-green-100 overflow-y-auto'>
        <div className='p-6 h-16 flex items-center'>
            <Logo />
        </div>
        <nav className='flex-1 px-4 py-2'>
            {NAV_LINKS.map((navLink, i: number) => (
                <NavLink key={i} navLink={navLink} />
            ))}

        </nav>
    </div>
  )
}

export default SideBar