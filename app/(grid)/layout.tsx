import * as React from "react";
import NavBar from "../components/NavBar/NavBar";
import SideBar from "../components/NavBar/SideBar";
import AuthProvider from "../components/auth/auth-provider";
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex">
        <SideBar />
        <div className="flex-1 flex flex-col md:ml-64">
          <NavBar />
          <main className="flex-1 p-6 overflow-auto mt-16">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
