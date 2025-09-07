import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Brain, BookOpen } from "lucide-react";

const Study = () => {
  const studyModes = [
    {
      id: 1,
      title: "Flashcards",
      description: "Review concepts with interactive flashcards",
      icon: Brain,
    },
    {
      id: 2,
      title: "Practice Tests",
      description: "Test your knowledge with practice questions",
      icon: BookOpen,
    },
    {
      id: 3,
      title: "Pomodoro Timer",
      description: "Study with focused time intervals",
      icon: Clock,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Study</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card key={mode.id} className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                  <Button className="w-full">Start</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Study;
