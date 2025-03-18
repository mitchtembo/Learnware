
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

const Index = () => {
  const recentActivities = [
    { title: "Physics Notes", type: "Note", date: "2024-02-20" },
    { title: "Math Assignment", type: "Study", date: "2024-02-19" },
    { title: "Chemistry Research", type: "Research", date: "2024-02-18" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
            <div className="space-y-2">
              <p>Total Notes: 15</p>
              <p>Active Courses: 4</p>
              <p>Study Hours: 12h</p>
            </div>
          </Card>

          <Card className="p-6 col-span-2">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-accent rounded-lg"
                >
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
