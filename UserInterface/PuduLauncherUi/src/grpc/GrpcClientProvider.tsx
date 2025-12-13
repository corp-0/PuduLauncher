import { createContext, useContext, useMemo } from "react";
import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { Launcher } from "./launcher_connect";

const GrpcClientContext = createContext<ReturnType<typeof createClient<typeof Launcher>> | null>(
  null
);

type GrpcClientProviderProps = {
  children: React.ReactNode;
  baseUrl?: string;
};

export const GrpcClientProvider = ({ children, baseUrl }: GrpcClientProviderProps) => {
  const client = useMemo(() => {
    const transport = createGrpcWebTransport({
      baseUrl: baseUrl ?? "http://localhost:5100"
    });
    return createClient(Launcher, transport);
  }, [baseUrl]);

  return <GrpcClientContext.Provider value={client}>{children}</GrpcClientContext.Provider>;
};

export const useGrpcClient = () => {
  const client = useContext(GrpcClientContext);
  if (!client) {
    throw new Error("useGrpcClient must be used within a GrpcClientProvider");
  }
  return client;
};
