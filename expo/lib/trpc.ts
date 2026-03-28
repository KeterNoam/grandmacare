import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!baseUrl) {
    console.error("EXPO_PUBLIC_RORK_API_BASE_URL is not set");
    throw new Error("Backend URL is not configured");
  }

  console.log("Backend URL:", baseUrl);
  return baseUrl;
};

export const createTRPCClient = () => {
  return trpc.createClient({
    links: [
      httpLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await AsyncStorage.getItem("auth_token");
          return token ? { authorization: `Bearer ${token}` } : {};
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000),
          }).catch((error) => {
            console.error("tRPC fetch error:", error.message);
            throw new Error("לא ניתן להתחבר לשרת. אנא בדוק את החיבור שלך.");
          });
        },
      }),
    ],
  });
};

export const trpcClient = createTRPCClient();
