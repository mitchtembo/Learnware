import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { geminiService } from "../services/GeminiService";

export function ApiKeyStatus() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      setIsLoading(true);
      // Make a simple request to the Gemini API to check if the key works
      const response = await geminiService.getResearchAssistance('test connection');
      setIsValid(!response.error);
      if (!response.error) {
        toast({
          title: "API Key Check",
          description: "Pre-configured API key is working correctly!",
          duration: 3000,
        });
      } else {
        toast({
          title: "API Key Check",
          description: "There's an issue with the pre-configured API key. Contact support if this persists.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking API key:', error);
      setIsValid(false);
      toast({
        title: "API Key Check",
        description: "Failed to validate the pre-configured API key. Contact support if this persists.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-3">
          {isValid === true ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : isValid === false ? (
            <Info className="h-5 w-5 text-red-500" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-primary animate-spin" />
          )}

          <div className="flex-1">
            <p className="font-medium">
              {isValid === true
                ? "API Key Pre-configured"
                : isValid === false
                ? "API Key Issue Detected"
                : "Checking API Key..."}
            </p>
            <p className="text-sm text-muted-foreground">
              {isValid === true
                ? "The Gemini API key is pre-configured and working correctly."
                : isValid === false
                ? "There's an issue with the pre-configured API key. Please contact support."
                : "Verifying the pre-configured Gemini API key..."}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={checkApiKey}
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Recheck"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800">
              <span className="font-medium">Note:</span> This application uses a pre-configured Gemini API key for demonstration purposes. No additional configuration is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 