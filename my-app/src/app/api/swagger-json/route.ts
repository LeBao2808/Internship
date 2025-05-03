// src/app/api/swagger-json/route.ts
import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

export const GET = async (_req: NextRequest) => {
  const filePath = join(process.cwd(), "src", "app", "api", "swagger.json");
  try {
    const json = await fs.readFile(filePath, "utf-8");
    return new Response(json, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Không tìm thấy swagger.json" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
};
