
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Book, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GeminiService } from "@/utils/geminiService";

const Research = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [researchResult, setResearchResult] = useState("");

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      GeminiService.saveApiKey(apiKey.trim());
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      setApiKey("");
    }
  };

  const handleResearch = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a research topic",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await GeminiService.getResearchAssistance(topic);
      setResearchResult(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get research assistance. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Research</h1>
        
        {!GeminiService.getApiKey() && (
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Setup Gemini API</h2>
              <div className="flex gap-4">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveApiKey}>Save API Key</Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Deep Research</h2>
            <div className="flex gap-4">
              <Input 
                placeholder="Enter your research topic..." 
                className="flex-1"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button onClick={handleResearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Researching..." : "Research"}
              </Button>
            </div>
          </div>
        </Card>

        {researchResult && (
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Research Results</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{researchResult}</p>
              </div>
            </div>
          </Card>
        )}

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
