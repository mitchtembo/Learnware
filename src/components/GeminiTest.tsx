
import { GeminiService } from "@/utils/geminiService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const GeminiTest = () => {
  const { toast } = useToast();

  const testGemini = async () => {
    try {
      GeminiService.saveApiKey("AIzaSyCSh5DsoISV_tvFuvlepljOl1A1AviyN3c");
      const result = await GeminiService.getResearchAssistance("Explain how AI works briefly");
      toast({
        title: "Gemini API Test Result",
        description: result.substring(0, 200) + "...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test Gemini API",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={testGemini} className="mt-4">
      Test Gemini API
    </Button>
  );
};

export default GeminiTest;
