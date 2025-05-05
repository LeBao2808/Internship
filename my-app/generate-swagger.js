const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "src", "app", "api");
const swaggerPath = path.join(apiDir, "swagger.json");

function scanApiRoutes(dir, baseRoute = "/api") {
  const routes = {};
  const tagsSet = new Set();
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      if (item.name === "models" || item.name === "swagger-json") continue;
      const subRoutes = scanApiRoutes(path.join(dir, item.name), baseRoute + "/" + item.name);
      Object.assign(routes, subRoutes.routes);
      subRoutes.tags.forEach(tag => tagsSet.add(tag));
    } else if (item.name === "route.ts") {
      const fileContent = fs.readFileSync(path.join(dir, item.name), "utf-8");
      let doc = {};
      const docPath = path.join(dir, "swagger-doc.json");
      if (fs.existsSync(docPath)) {
        try {
          doc = JSON.parse(fs.readFileSync(docPath, "utf-8"));
        } catch (e) { doc = {}; }
      }
      const methods = {};
      if (/export\s+async\s+function\s+GET/.test(fileContent)) {
        methods["get"] = {
          summary: doc.get?.summary || "Lấy danh sách",
          description: doc.get?.description || undefined,
          tags: [baseRoute.replace(/^\/api\/?/, '').split('/')[0] || "api"],
          responses: doc.get?.responses || {
            "200": {
              description: "Thành công",
              content: {
                "application/json": {
                  schema: { type: "object", example: { success: true, data: [] } }
                }
              }
            }
          }
        };
      }
      if (/export\s+async\s+function\s+POST/.test(fileContent)) {
        methods["post"] = {
          summary: doc.post?.summary || "Tạo mới",
          description: doc.post?.description || undefined,
          tags: [baseRoute.replace(/^\/api\/?/, '').split('/')[0] || "api"],
          requestBody: doc.post?.requestBody || {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", example: {} }
              }
            }
          },
          responses: doc.post?.responses || {
            "201": {
              description: "Đã tạo",
              content: {
                "application/json": {
                  schema: { type: "object", example: { success: true, data: {} } }
                }
              }
            }
          }
        };
      }
      if (/export\s+async\s+function\s+PUT/.test(fileContent)) {
        methods["put"] = {
          summary: doc.put?.summary || "Cập nhật",
          description: doc.put?.description || undefined,
          tags: [baseRoute.replace(/^\/api\/?/, '').split('/')[0] || "api"],
          requestBody: doc.put?.requestBody || {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", example: {} }
              }
            }
          },
          responses: doc.put?.responses || {
            "200": {
              description: "Cập nhật thành công",
              content: {
                "application/json": {
                  schema: { type: "object", example: { success: true, data: {} } }
                }
              }
            }
          }
        };
      }
      if (/export\s+async\s+function\s+DELETE/.test(fileContent)) {
        methods["delete"] = {
          summary: doc.delete?.summary || "Xoá",
          description: doc.delete?.description || undefined,
          tags: [baseRoute.replace(/^\/api\/?/, '').split('/')[0] || "api"],
          requestBody: doc.delete?.requestBody || {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", example: {} }
              }
            }
          },
          responses: doc.delete?.responses || {
            "200": {
              description: "Xoá thành công",
              content: {
                "application/json": {
                  schema: { type: "object", example: { success: true } }
                }
              }
            }
          }
        };
      }
      if (Object.keys(methods).length > 0) {
        routes[baseRoute] = methods;
        tagsSet.add(baseRoute.split("/")[2] || "api");
      }
    }
  }
  return { routes, tags: Array.from(tagsSet) };
}

function generateSwagger() {
  const { routes: paths, tags } = scanApiRoutes(apiDir);
  const swagger = {
    openapi: "3.0.1",
    info: {
      title: "Auto-generated API",
      version: "1.0.0",
      description: "Tự động sinh swagger cho các route trong thư mục api"
    },
    tags: tags.map(tag => ({ name: tag, description: `Các API cho danh mục ${tag}` })),
    paths: {},
    components: { schemas: {} }
  };
  for (const [route, methods] of Object.entries(paths)) {
    swagger.paths[route] = methods;
  }
  fs.writeFileSync(swaggerPath, JSON.stringify(swagger, null, 2), "utf-8");
  console.log("Đã cập nhật swagger.json tự động!");
}

generateSwagger();