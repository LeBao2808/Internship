// src/app/(webapp)/authen/signin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const data = useSession();
  const session = data?.data || null;
  const router = useRouter();
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    if (session) {
      router.push("/");
    } else {
      getProviders().then((prov) => setProviders(prov));
    }
  }, [session]);

  if (!providers) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {Object.values(providers).map((provider: any) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </>
  );
}
