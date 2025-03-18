import { useNavigate } from 'react-router-dom';
import { Course } from '../services/DataService';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { getCourseBackground } from '../utils/courseBackgrounds';
import { Book, BookOpen, Calendar, Layers, User, BookOpenCheck, 
  Code, Coffee, Brain, Shield, Terminal, BarChart, Cpu,
  Briefcase, TrendingUp, Megaphone, Landmark, Atom, 
  FlaskConical, Calculator, Clock, BookOpen as BookOpenIcon, Palette, Music, 
  Languages, Dna, LucideIcon } from 'lucide-react';

// Map of icon names to actual Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  "book": Book,
  "book-open": BookOpenIcon,
  "code": Code,
  "code-json": Code,
  "code-2": Code,
  "coffee": Coffee,
  "terminal": Terminal,
  "bar-chart": BarChart,
  "brain": Brain,
  "cpu": Cpu,
  "shield": Shield,
  "briefcase": Briefcase,
  "trending-up": TrendingUp,
  "megaphone": Megaphone,
  "landmark": Landmark,
  "atom": Atom,
  "flask-conical": FlaskConical,
  "dna": Dna,
  "calculator": Calculator,
  "clock": Clock,
  "palette": Palette,
  "music": Music,
  "languages": Languages
};

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

const CourseCard = ({ course, compact = false }: CourseCardProps) => {
  const navigate = useNavigate();
  const background = getCourseBackground(course.topic || course.name);
  const IconComponent = iconMap[background.icon] || Book;

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
        onClick={handleClick}
      >
        <div className={`h-3 ${background.bgColor}`}></div>
        <div className="p-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium text-base line-clamp-1">{course.name}</h3>
            <Badge variant="outline" className="shrink-0">{course.difficulty}</Badge>
          </div>
          <div className="mt-3">
            <Progress value={course.progress} className="h-1.5" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      onClick={handleClick}
    >
      <div className={`${background.bgColor} ${background.textColor} p-6`}>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xl mb-1">{course.name}</h3>
          <div className="rounded-full bg-white/20 p-2">
            <IconComponent className="h-5 w-5" />
          </div>
        </div>
        {course.topic && (
          <p className="text-sm opacity-90">{course.topic}</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{course.difficulty}</Badge>
          {course.estimated_hours && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.estimated_hours} hours
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(course.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>{course.studyMaterials?.length || 0} materials</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpenCheck className="h-3 w-3" />
            <span>{course.quizzes?.length || 0} quizzes</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard; 