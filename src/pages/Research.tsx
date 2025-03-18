import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Book, Brain, FileText, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { geminiService } from "@/services/GeminiService";
import { webContentService } from "@/services/WebContentService";
import { ApiKeyStatus } from "@/components/ApiKeyStatus";
import { Loading, LoadingButton } from "@/components/ui/loading";
import { ErrorHandler } from "@/utils/errorHandler";

interface ResearchResult {
  query: string;
  overview: string;
  keyFindings: string[];
  relevantConcepts: string[];
  suggestedResources: {
    title: string;
    url: string;
    description: string;
  }[];
  furtherExploration: string[];
  error?: string;
}

interface WebResult {
  results: {
    title: string;
    link: string;
    snippet: string;
  }[];
  topic: string;
}

const Research = () => {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWebLoading, setIsWebLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("research");
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [webResults, setWebResults] = useState<WebResult | null>(null);
  const [literatureQuery, setLiteratureQuery] = useState("");
  const [isLiteratureSearching, setIsLiteratureSearching] = useState(false);

  useEffect(() => {
    // Check for API key on initial load
    const checkApiKey = async () => {
      if (!geminiService.isInitialized()) {
        toast({
          title: "API Key Required",
          description: "Please add your Gemini API key to use the research features.",
          variant: "destructive",
        });
      }
    };
    
    checkApiKey();
  }, [toast]);

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
    setResearchResult(null);
    
    try {
      const result = await geminiService.getResearchAssistance(topic);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.message || "Failed to get research assistance.",
          variant: "destructive",
        });
      } else {
        setResearchResult(result);
      }
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      
      toast({
        title: "Error",
        description: "Failed to get research assistance. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebSearch = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a research topic",
        variant: "destructive",
      });
      return;
    }

    setIsWebLoading(true);
    setWebResults(null);
    
    try {
      const results = await webContentService.searchWebContent(topic);
      setWebResults(results);
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      
      toast({
        title: "Error",
        description: "Failed to search the web. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWebLoading(false);
    }
  };

  const handleLiteratureSearch = async () => {
    if (!literatureQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsLiteratureSearching(true);
    
    try {
      toast({
        title: "Literature Review",
        description: "This feature will be available in the next update.",
      });
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError);
      
      toast({
        title: "Error",
        description: "Feature not yet implemented.",
        variant: "destructive",
      });
    } finally {
      setIsLiteratureSearching(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Research</h1>
        
        <ApiKeyStatus />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="research">
              <Brain className="h-4 w-4 mr-2" />
              AI Research
            </TabsTrigger>
            <TabsTrigger value="web">
              <Globe className="h-4 w-4 mr-2" />
              Web Search
            </TabsTrigger>
            <TabsTrigger value="literature">
              <Book className="h-4 w-4 mr-2" />
              Literature Review
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Research Notes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="research" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">AI Research Assistant</h2>
                <div className="flex gap-4">
                  <Input 
                    placeholder="Enter your research topic..." 
                    className="flex-1"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading || !geminiService.isInitialized()}
                  />
                  <Button 
                    onClick={handleResearch} 
                    disabled={isLoading || !topic.trim() || !geminiService.isInitialized()}
                  >
                    {isLoading ? (
                      <>
                        <LoadingButton className="mr-2" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Research
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {isLoading && (
              <Loading fullHeight text="Researching your topic... This may take a moment." />
            )}

            {researchResult && !isLoading && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">{researchResult.query}</h2>
                    <p className="text-muted-foreground mt-1">Research results</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Overview</h3>
                    <p>{researchResult.overview}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Key Findings</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {researchResult.keyFindings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Relevant Concepts</h3>
                    <div className="flex flex-wrap gap-2">
                      {researchResult.relevantConcepts.map((concept, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Suggested Resources</h3>
                    <div className="grid gap-4">
                      {researchResult.suggestedResources.map((resource, index) => (
                        <Card key={index} className="p-4">
                          <h4 className="font-medium">
                            {resource.url ? (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {resource.title}
                              </a>
                            ) : (
                              resource.title
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Further Exploration</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {researchResult.furtherExploration.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="web" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Web Search</h2>
                <div className="flex gap-4">
                  <Input 
                    placeholder="Enter your search topic..." 
                    className="flex-1"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isWebLoading}
                  />
                  <Button 
                    onClick={handleWebSearch} 
                    disabled={isWebLoading || !topic.trim()}
                  >
                    {isWebLoading ? (
                      <>
                        <LoadingButton className="mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {isWebLoading && (
              <Loading fullHeight text="Searching the web... This may take a moment." />
            )}

            {webResults && !isWebLoading && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Web results for: {webResults.topic}</h2>
                    <p className="text-muted-foreground mt-1">{webResults.results.length} results found</p>
                  </div>
                  
                  <div className="space-y-4">
                    {webResults.results.map((result, index) => (
                      <div key={index} className="space-y-1">
                        <h3 className="font-medium">
                          <a 
                            href={result.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {result.title}
                          </a>
                        </h3>
                        <p className="text-sm text-muted-foreground">{result.link}</p>
                        <p>{result.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="literature" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Literature Review</h2>
                <div className="flex gap-4">
                  <Input 
                    placeholder="Search for academic papers and research..." 
                    className="flex-1"
                    value={literatureQuery}
                    onChange={(e) => setLiteratureQuery(e.target.value)}
                    disabled={isLiteratureSearching || !geminiService.isInitialized()}
                  />
                  <Button 
                    onClick={handleLiteratureSearch} 
                    disabled={isLiteratureSearching || !literatureQuery.trim() || !geminiService.isInitialized()}
                  >
                    {isLiteratureSearching ? (
                      <>
                        <LoadingButton className="mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Book className="h-4 w-4 mr-2" />
                        Search Literature
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search academic papers, journals, and research publications to find relevant literature for your studies.
                </p>
              </div>
            </Card>
            
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <Brain className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Coming Soon:</span> Advanced literature review features including citation analysis, paper summaries, and recommendation algorithms will be available in the next update.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Research Notes</h2>
                <p className="text-muted-foreground">
                  Organize your research findings, insights, and references in one place.
                </p>
                <Button disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Research Note
                </Button>
              </div>
            </Card>
            
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <Brain className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Coming Soon:</span> Research notes feature will be available in the next update. This will allow you to organize and annotate your research findings.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Research;
