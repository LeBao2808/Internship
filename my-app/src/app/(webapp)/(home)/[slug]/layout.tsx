"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../../components/Footer";
import UserButton from "../../../../components/UserButton";
import Navbar from "@/components/Navbar";

interface BlogLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<BlogLayoutProps> = ({ children }) => {
  const router = useRouter();
  return (
    <div className="bg-gray-100 dark:bg-[#121618] min-h-screen">
      <Navbar />
      
      <div>{children}</div>
    </div>
  );
};

export default Layout;
