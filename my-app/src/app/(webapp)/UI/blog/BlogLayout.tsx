import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";

interface BlogLayoutProps {
  children: React.ReactNode;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ children }) => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // router.push(`/UI/blog?search=${encodeURIComponent(search)}`) ;
      localStorage.setItem("blog_search", search);
      router.push("/UI/blog");
    }
  };

  return (
    <div>
      {/* Thanh điều hướng */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 mt-8 mb-6 px-4 ">
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
        {/* <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm blog..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 transition"
            title="Tìm kiếm"
          >
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>


          </button>
        </form> */}
      </div>
      {/* Nội dung trang */}
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default BlogLayout;
