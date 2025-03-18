
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

const Notes = () => {
  const notes = [
    { id: 1, title: "CS101 - Data Structures", date: "2024-02-20", course: "Computer Science" },
    { id: 2, title: "Calculus - Integration", date: "2024-02-19", course: "Mathematics" },
    { id: 3, title: "Physics Lab Notes", date: "2024-02-18", course: "Physics" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notes</h1>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search notes..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
              <p className="text-sm text-muted-foreground">{note.course}</p>
              <p className="text-xs text-muted-foreground mt-4">{note.date}</p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notes;
