import * as React from "react";
import NavBar from "../components/NavBar/NavBar";
import SideBar from "../components/NavBar/SideBar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
