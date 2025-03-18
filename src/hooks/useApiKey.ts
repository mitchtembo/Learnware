import { useState, useEffect, useCallback } from 'react';
import { geminiService } from '@/services/GeminiService';
import { mongoDBService } from '@/services/MongoDBService';
import { useToast } from '@/components/ui/use-toast';
import { ErrorHandler } from '@/utils/errorHandler';

export function useApiKey() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const { toast } = useToast();

  const checkApiKey = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we have an API key in the database
      const storedApiKey = await geminiService.getApiKey();
      
      if (!storedApiKey) {
        setIsValid(false);
        return;
      }
      
      // Check if the Gemini service is initialized
      if (!geminiService.isInitialized()) {
        setIsValid(false);
        return;
      }
      
      // Try a simple API call to verify the key
      const response = await geminiService.getResearchAssistance('test connection');
      const valid = !response.error;
      setIsValid(valid);
      
      // Save the validation status to MongoDB
      await mongoDBService.setSetting('apiKeyValid', valid);
      
      if (valid) {
        toast({
          title: "API Key Valid",
          description: "Your Gemini API key is working correctly!",
          duration: 3000,
        });
      } else {
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
      
      // Save the API key to MongoDB
      const saved = await geminiService.saveApiKey(key.trim());
      
      if (!saved) {
        throw new Error("Failed to save API key to database");
      }
      
      // Record the timestamp of when the key was saved
      await mongoDBService.setSetting('apiKeyTimestamp', Date.now());
      
      // Clear the input field
      setApiKey("");
      
      // Verify the key
      await checkApiKey();
      
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      
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

  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      try {
        // Check if MongoDB is connected
        await mongoDBService.ensureConnected();
        
        // First check if the Gemini service is already initialized
        if (geminiService.isInitialized()) {
          setIsValid(true);
          return;
        }
        
        // Check if we have a valid key status saved
        const keyValid = await mongoDBService.getSetting('apiKeyValid');
        
        if (keyValid) {
          setIsValid(true);
        } else {
          // If not valid or not set, check the current key
          checkApiKey();
        }
      } catch (error) {
        // If MongoDB is not connected yet, try again later
        const appError = ErrorHandler.handle(error);
        ErrorHandler.logError(appError);
        setTimeout(init, 1000);
      }
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