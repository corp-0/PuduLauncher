import { GrpcClientProvider } from "./grpc/GrpcClientProvider";
import { DemoPage } from "./pages/DemoPage";

function App() {
  return (
    <GrpcClientProvider>
      <DemoPage />
    </GrpcClientProvider>
  );
}

export default App;
