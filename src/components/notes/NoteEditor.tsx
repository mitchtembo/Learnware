import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link,
  Save,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NoteEditorProps {
  onSave: (note: {
    title: string;
    content: string;
    courseId?: string;
    tags: string[];
  }) => void;
  initialData?: {
    title: string;
    content: string;
    courseId?: string;
    tags: string[];
  };
  courses: Array<{ id: string; name: string }>;
}

export function NoteEditor({ onSave, initialData, courses }: NoteEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [courseId, setCourseId] = useState(initialData?.courseId || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleSave = () => {
    onSave({
      title,
      content,
      courseId,
      tags,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Add tags (comma separated)"
            value={tags.join(", ")}
            onChange={(e) =>
              setTags(
                e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)
              )
            }
          />
        </div>

        <div className="flex items-center gap-1 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormat("bold")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormat("italic")}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormat("underline")}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormat("insertUnorderedList")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormat("insertOrderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const url = window.prompt("Enter image URL:");
              if (url) handleFormat("insertImage", url);
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const url = window.prompt("Enter link URL:");
              if (url) handleFormat("createLink", url);
            }}
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="min-h-[300px] w-full border rounded-md p-4 focus:outline-none prose prose-sm max-w-none"
          contentEditable
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="ml-auto">
          <Save className="h-4 w-4 mr-2" />
          Save Note
        </Button>
      </CardFooter>
    </Card>
  );
}
