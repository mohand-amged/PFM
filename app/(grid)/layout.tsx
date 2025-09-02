import * as React from "react";
import NavBar from "../components/NavBar/NavBar";
import SideBar from "../components/NavBar/SideBar";
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getCurrentUserFromHeaders } from '@/lib/auth-service';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const user = await getCurrentUserFromHeaders(headersList);
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex">
      <SideBar />
      <div className="flex-1 flex flex-col md:ml-64">
        <NavBar />
        <main className="flex-1 p-6 overflow-auto mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
