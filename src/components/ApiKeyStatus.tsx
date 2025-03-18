import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { geminiService } from "../services/GeminiService";

export function ApiKeyStatus() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(!geminiService.isInitialized());
  const { toast } = useToast();

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      setIsLoading(true);
      
      if (!geminiService.isInitialized()) {
        setIsValid(false);
        setShowInput(true);
        return;
      }
      
      // Make a simple request to the Gemini API to check if the key works
      const response = await geminiService.getResearchAssistance('test connection');
      setIsValid(!response.error);
      
      if (!response.error) {
        toast({
          title: "API Key Valid",
          description: "Gemini API key is working correctly!",
          duration: 3000,
        });
      } else {
        toast({
          title: "API Key Issue",
          description: "There's an issue with the Gemini API key. Please verify it's correct.",
          variant: "destructive",
          duration: 5000,
        });
        setShowInput(true);
      }
    } catch (error) {
      console.error('Error checking API key:', error);
      setIsValid(false);
      setShowInput(true);
      toast({
        title: "API Key Error",
        description: "Failed to validate the Gemini API key.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    try {
      geminiService.initialize(apiKey.trim());
      setApiKey("");
      checkApiKey();
      setShowInput(false);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set API key",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-3">
          {isValid === true ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : isValid === false ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-primary animate-spin" />
          )}

          <div className="flex-1">
            <p className="font-medium">
              {isValid === true
                ? "Gemini API Key Available"
                : isValid === false
                ? "Gemini API Key Required"
                : "Checking API Key..."}
            </p>
            <p className="text-sm text-muted-foreground">
              {isValid === true
                ? "The Gemini API key is configured and working correctly."
                : isValid === false
                ? "You need to provide a valid Gemini API key to use AI features."
                : "Verifying the Gemini API key..."}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(!showInput)}
            disabled={isLoading}
          >
            {showInput ? "Hide" : "Change Key"}
          </Button>
        </div>
      </div>

      {showInput && (
        <Card className="p-4">
          <div className="flex gap-3">
            <Input
              type="password"
              placeholder="Enter Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveApiKey} disabled={isLoading || !apiKey.trim()}>
              Save Key
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            You can get an API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
          </p>
        </Card>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800">
              <span className="font-medium">Note:</span> Your API key is required to use the AI features in this application. The key is stored in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 