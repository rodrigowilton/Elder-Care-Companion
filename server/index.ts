import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import 'dotenv/config'; // Garante o carregamento das variáveis de ambiente

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Registra as rotas da API (incluindo a conexão com o banco)
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // --- LÓGICA DE PORTA ADAPTATIVA (WINDOWS VS DEBIAN) ---
  const isWindows = process.platform === "win32";
  
  // No Windows usamos 5001 para evitar conflito. No Debian usamos a porta do sistema ou 5000.
  const port = parseInt(process.env.PORT || (isWindows ? "5001" : "5000"), 10);
  
  // No Windows usamos '127.0.0.1' por segurança/permissão. No Debian usamos '0.0.0.0' para deploy.
  const host = isWindows ? "127.0.0.1" : "0.0.0.0";

  httpServer.listen(
    {
      port,
      host,
      // Desativamos reusePort no Windows (causa o erro ENOTSUP)
      ...(isWindows ? {} : { reusePort: true }),
    },
    () => {
      log(`servidor rodando em http://${host}:${port}`);
    },
  );
})();