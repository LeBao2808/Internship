"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";
import UserButton from "../../../admin/UserButton";

interface BlogLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<BlogLayoutProps> = ({ children }) => {
  const router = useRouter();
  return (
    <div>
      <style>{`
      .nav-logout-btn {
          margin-left: auto;
          background: #d32f2f;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s, box-shadow 0.25s;
        }
        .nav-logout-btn:hover {
          background: #b71c1c;
          box-shadow: 0 2px 12px 0 rgba(211,47,47,0.18);
        }
           .nav-logout-btn {
          margin-left: auto;
          background: #d32f2f;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s, box-shadow 0.25s;
        }
        .nav-logout-btn:hover {
          background: #b71c1c;
          box-shadow: 0 2px 12px 0 rgba(211,47,47,0.18);
        }


       .nav-home-btn {
          margin-left: auto;
          background:#fff;
          color: #1976d2;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 600;
          cursor: pointer;
       }
          .nav-home-btn:hover {
          background:rgb(214, 214, 214);
          box-shadow: 0 2px 12px 0 rgba(211,47,47,0.18);
          }

               .nav-view-btn {
          margin-left: auto;
          background:#rgb(168, 155, 137);
          color: #1976d2;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-weight: 600;
          cursor: pointer;
       }
          .nav-view-btn:hover {
          background:rgb(230, 231, 220);
          box-shadow: 0 2px 12px 0 rgba(211,47,47,0.18);
          }

          .text-nav-btn-user{
            color: black; 
          }

     `}</style>
      <div className="flex justify-end ">
        <div className="flex items-center bg-white rounded-lg shadow-sm mr-2 mt-2 p-1">
          <UserButton />
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex items-center gap-4 mb-6 px-4 ">
        <button
          onClick={() => router.push("/UI/blog")}
          className="p-2 rounded-full hover:bg-blue-100 transition bg-white cursor-pointer "
          title="Về trang chủ blog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </button>
      </div>
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
