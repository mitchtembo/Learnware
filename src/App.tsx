import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Notes from "./pages/Notes";
import Study from "./pages/Study";
import Research from "./pages/Research";
import Search from "./pages/Search";

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/new" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/study" element={<Study />} />
        <Route path="/research" element={<Research />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
);

export default App;
