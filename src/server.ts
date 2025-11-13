import express, { Express } from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { initializeDatabasePools, closeDatabasePools, DatabasePool } from "./config/database";

const startServer = async () => {
  const app: Express = express();
  const PORT = process.env.PORT || 4000;

  // Konfigurasi CORS
  const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:4000", "https://studio.apollographql.com", "https://sandbox.apollographql.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  // Aktifkan CORS middleware
  app.use(cors(corsOptions));
  app.use(express.json());

  const db: DatabasePool = initializeDatabasePools();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      db,
    }),
    introspection: true, // Aktifkan introspection untuk development
    plugins: [
      {
        // Plugin untuk logging setiap request
        async requestDidStart(requestContext) {
          const startTime = Date.now();

          console.log("\n-----------------------------------");
          console.log(`[${new Date().toISOString()}] GraphQL Request Started`);

          return {
            // Log ketika query parsing dimulai
            async parsingDidStart() {
              console.log("⚙️  Parsing query...");
            },

            // Log ketika validation dimulai
            async validationDidStart() {
              console.log("✓  Validating query...");
            },

            // Log ketika execution dimulai
            async executionDidStart() {
              const query = requestContext.request.query;
              const operationName = requestContext.request.operationName;
              const variables = requestContext.request.variables;

              console.log("🚀 Executing query:");
              console.log(`   Operation: ${operationName || "Anonymous"}`);
              if (variables && Object.keys(variables).length > 0) {
                console.log(`   Variables:`, JSON.stringify(variables, null, 2));
              }
              console.log(`   Query:\n${query?.substring(0, 200)}${(query?.length || 0) > 200 ? "..." : ""}`);
            },

            // Log ketika request selesai
            async willSendResponse(requestContext) {
              const duration = Date.now() - startTime;
              const hasErrors = requestContext.errors && requestContext.errors.length > 0;

              if (hasErrors) {
                console.log("❌ Request completed with errors:");
                requestContext.errors?.forEach((error, index) => {
                  console.log(`   Error ${index + 1}: ${error.message}`);
                });
              } else {
                console.log("✅ Request completed successfully");
              }

              console.log(`⏱️  Duration: ${duration}ms`);
              console.log("-----------------------------------\n");
            },

            // Log ketika terjadi error
            async didEncounterErrors(requestContext) {
              console.log("🔴 Errors encountered:");
              requestContext.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.message}`);
                if (error.extensions) {
                  console.log(`      Code: ${error.extensions.code}`);
                }
              });
            },
          };
        },
      },
    ],
    // Format error untuk response
    formatError: error => {
      console.error("❌ Error Details:", {
        message: error.message,
        code: error.extensions?.code,
        path: error.path,
      });
      return error;
    },
  });

  await server.start();
  server.applyMiddleware({ app: app as any, path: "/graphql" });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  const httpServer = app.listen(PORT, () => {
    console.log("\n🚀 Server Information:");
    console.log(`   GraphQL Server: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`   GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`   Health Check: http://localhost:${PORT}/health`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Started at: ${new Date().toISOString()}`);
    console.log("\n📊 CORS Configuration:");
    console.log(`   ✓ http://localhost:3000`);
    console.log(`   ✓ http://localhost:4000`);
    console.log(`   ✓ https://studio.apollographql.com`);
    console.log(`   ✓ https://sandbox.apollographql.com`);
    console.log("\n📊 Waiting for requests...\n");
  });

  const gracefulShutdown = async () => {
    console.log("\n🛑 Shutting down gracefully...");
    console.log("   Stopping Apollo Server...");
    await server.stop();
    console.log("   Closing HTTP Server...");
    httpServer.close();
    console.log("   Closing Database Connections...");
    await closeDatabasePools(db);
    console.log("✅ Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
};

startServer().catch(error => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
