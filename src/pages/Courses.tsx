
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Courses = () => {
  const courses = [
    { id: 1, name: "Introduction to Computer Science", code: "CS101", progress: 60 },
    { id: 2, name: "Calculus I", code: "MATH201", progress: 45 },
    { id: 3, name: "Physics Fundamentals", code: "PHY101", progress: 30 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{course.code}</p>
              <div className="bg-secondary h-2 rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <p className="text-sm mt-2 text-muted-foreground">
                {course.progress}% Complete
              </p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Courses;
