import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading";
import { useApiKey } from "@/hooks/useApiKey";

export function ApiKeyStatus() {
  const [showInput, setShowInput] = useState<boolean>(false);
  const { isValid, isLoading, apiKey, setApiKey, checkApiKey, saveApiKey } = useApiKey();

  const handleSaveClick = async () => {
    const success = await saveApiKey(apiKey);
    if (success) {
      setShowInput(false);
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
            {isValid ? (showInput ? "Hide" : "Change Key") : "Add Key"}
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
              disabled={isLoading}
            />
            <Button 
              onClick={handleSaveClick} 
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? <LoadingButton className="mr-2" /> : null}
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
              <span className="font-medium">Note:</span> Your API key is required to use the AI features in this application. The key is stored securely in the database and not exposed to external services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 