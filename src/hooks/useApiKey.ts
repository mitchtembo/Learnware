import { useState, useEffect, useCallback } from 'react';
import { geminiService } from '@/services/GeminiService';
import { useToast } from '@/components/ui/use-toast';
import { ErrorHandler } from '@/utils/errorHandler';

export function useApiKey() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>("");
  const { toast } = useToast();

  const checkApiKey = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const storedApiKey = await geminiService.getApiKey();
      
      if (!storedApiKey || !geminiService.isInitialized()) {
        setIsValid(false);
        localStorage.setItem('apiKeyValid', 'false');
        return;
      }
      
      // Try a simple API call to verify the key
      const response = await geminiService.getResearchAssistance('test connection');
      const valid = !response.error;
      setIsValid(valid);
      localStorage.setItem('apiKeyValid', JSON.stringify(valid));
      
      if (!valid) {
        toast({
          title: "API Key Issue",
          description: "There's an issue with your Gemini API key. Please verify it's correct.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      setIsValid(false);
      localStorage.setItem('apiKeyValid', 'false');
      toast({
        title: "API Key Error",
        description: "Failed to validate the Gemini API key.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveApiKey = useCallback(async (key: string) => {
    if (!key.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const saved = await geminiService.saveApiKey(key.trim());
      
      if (!saved) {
        throw new Error("Failed to save API key");
      }
      
      setApiKey("");
      await checkApiKey();
      
      // Re-check validity after saving
      const valid = await geminiService.isInitialized();
      if(valid){
        toast({
            title: "Success",
            description: "API key saved and validated successfully",
        });
      }
      
      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      
      toast({
        title: "Error",
        description: "Failed to set API key: " + appError.message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, checkApiKey]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      // The GeminiService constructor already tries to initialize from storage.
      // We just need to check the result.
      const initialized = geminiService.isInitialized();
      setIsValid(initialized);
      
      // If it's initialized, we can do a background check to ensure it's still valid
      if (initialized) {
        await checkApiKey();
      }
      
      setIsLoading(false);
    };
    
    init();
  }, [checkApiKey]);

  return {
    isValid,
    isLoading,
    apiKey,
    setApiKey,
    checkApiKey,
    saveApiKey
  };
}
