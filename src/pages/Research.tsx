
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Book, Brain } from "lucide-react";

const Research = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Research</h1>
        
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Deep Research</h2>
            <div className="flex gap-4">
              <Input placeholder="Enter your research topic..." className="flex-1" />
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Research
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Literature Review</h3>
                <p className="text-sm text-muted-foreground">Find and analyze academic papers</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">Start Review</Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">AI Research Assistant</h3>
                <p className="text-sm text-muted-foreground">Get AI-powered research help</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">Start Session</Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Research;
