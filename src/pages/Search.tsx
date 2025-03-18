
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Search</h1>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search across your courses, notes, and the web..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Courses</Button>
              <Button variant="outline" size="sm">Notes</Button>
              <Button variant="outline" size="sm">Web</Button>
            </div>
          </div>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>Enter a search term to get started</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Search;
