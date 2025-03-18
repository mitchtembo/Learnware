import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, 
  Globe, 
  Search,
  ArrowRight
} from "lucide-react";
import { webContentService } from "@/services/WebContentService";
import { useToast } from "@/components/ui/use-toast";

interface WebContentProps {
  initialTopic: string;
}

export function WebContent({ initialTopic }: WebContentProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialTopic);
  const [results, setResults] = useState<any>(null);

  const searchWebContent = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const content = await webContentService.searchWebContent(searchTerm);
      setResults(content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search web content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Web Resources</h3>
        <p className="text-muted-foreground mb-4">
          Search the web for additional learning resources related to your course.
        </p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topic..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchWebContent()}
            />
          </div>
          <Button onClick={searchWebContent} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </Card>

      {isLoading && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p>Searching the web...</p>
          </div>
        </Card>
      )}

      {results && !isLoading && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Results for: {results.topic}</h4>
          
          {results.results.map((result: any, index: number) => (
            <Card key={index} className="p-4 hover:bg-accent/50 transition-colors">
              <a 
                href={result.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex gap-2 group"
              >
                <div className="flex-1">
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                    <div>
                      <h5 className="font-medium group-hover:text-primary group-hover:underline transition-colors">
                        {result.title}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1">{result.link}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2 ml-7">{result.snippet}</p>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </a>
            </Card>
          ))}
        </div>
      )}

      {!results && !isLoading && (
        <Card className="p-6 border-dashed">
          <div className="text-center space-y-2">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
            <h4 className="text-lg font-medium">Search for web resources</h4>
            <p className="text-muted-foreground">
              Enter a topic above to find relevant learning materials from the web.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
} 