"use client";

// import { useSearchParams } from "next/navigation";
// import { useState } from "react";
import { useSession } from "next-auth/react";
export default function ViewDetailUser() {
  // const searchParams = useSearchParams();
  // const userId = searchParams.get("userId");
  // const [user, setUser] = useState<any>(null);
  const session = useSession();

  //   useEffect(() => {
  //     if (userId) {
  //       fetch(`/api/user/${userId}`)
  //         .then(res => res.json())
  //         .then(data => setUser(data));
  //     }
  //   }, [userId]);

  //   if (!userId) return <div>Không tìm thấy userId!</div>;
  //   if (!user) return <div>Đang tải thông tin...</div>;

  return (
    <div className="flex justify-center  min-h-screen bg-gray-100 pt-12">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md h-64">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Thông tin chi tiết User
        </h2>
        {/* <p className="mb-2"><b>ID:</b> {user._id}</p> */}
        <div className="mb-4">
          <span className="font-semibold text-gray-700">Tên:</span>
          <span className="ml-2 text-gray-900">{session.data?.user?.name}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-700">Email:</span>
          <span className="ml-2 text-gray-900">
            {session.data?.user?.email}
          </span>
        </div>
        {/* Thêm các thông tin khác nếu cần */}
      </div>
    </div>
  );
}
