import { useState } from "react";
import { geminiService } from "@/services/GeminiService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { ApiKeyStatus } from "./ApiKeyStatus";

const GeminiTest = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const testGemini = async () => {
    setIsLoading(true);
    setTestResponse(null);
    try {
      const result = await geminiService.getResearchAssistance("Explain how AI works briefly");
      setTestResponse(result);
      toast({
        title: "Success",
        description: "Gemini API request completed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test Gemini API. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ApiKeyStatus />
      
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Test Gemini API</h3>
        <p className="text-muted-foreground mb-4">
          Test the pre-configured Gemini API integration by requesting a brief explanation of AI.
        </p>
        <Button onClick={testGemini} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Gemini API"}
        </Button>

        {testResponse && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-medium mb-2">Response:</h4>
            <p className="text-sm whitespace-pre-wrap">{testResponse}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GeminiTest;
