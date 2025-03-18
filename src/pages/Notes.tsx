import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Tag, Calendar, Book } from "lucide-react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock data - would typically come from your API/database
const MOCK_NOTES = [
  {
    id: "1",
    title: "CS101 - Data Structures",
    content: "<p>Key concepts of data structures and algorithms...</p>",
    courseId: "1",
    tags: ["computer science", "algorithms"],
    date: "2024-02-20",
    course: "Computer Science",
  },
  {
    id: "2",
    title: "Calculus - Integration",
    content: "<p>Integration techniques and applications...</p>",
    courseId: "2",
    tags: ["mathematics", "calculus"],
    date: "2024-02-19",
    course: "Mathematics",
  },
  {
    id: "3",
    title: "Physics Lab Notes",
    content: "<p>Experimental observations and results...</p>",
    courseId: "3",
    tags: ["physics", "lab"],
    date: "2024-02-18",
    course: "Physics",
  },
];

const MOCK_COURSES = [
  { id: "1", name: "Computer Science" },
  { id: "2", name: "Mathematics" },
  { id: "3", name: "Physics" },
];

const Notes = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateNote = (noteData: {
    title: string;
    content: string;
    courseId?: string;
    tags: string[];
  }) => {
    const newNote = {
      id: (notes.length + 1).toString(),
      ...noteData,
      date: new Date().toISOString().split("T")[0],
      course: MOCK_COURSES.find((c) => c.id === noteData.courseId)?.name || "",
    };

    setNotes([newNote, ...notes]);
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Note created successfully",
    });
  };

  // Get all unique tags from notes
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => note.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <NoteEditor onSave={handleCreateNote} courses={MOCK_COURSES} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <Book className="h-4 w-4" />
                <span>{note.course}</span>
              </div>
              <div
                className="text-sm text-muted-foreground mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {note.date}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notes;
