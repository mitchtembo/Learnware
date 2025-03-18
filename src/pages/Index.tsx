
import MainLayout from "@/layouts/MainLayout";
import GeminiTest from "@/components/GeminiTest";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <GeminiTest />
      </div>
    </MainLayout>
  );
};

export default Index;
