import { BrowserRouter, Routes, Route } from "react-router-dom"
import { TooltipProvider } from "./components/ui/tooltip"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/auth/Login"
import SignUp from "./pages/auth/SignUp"
import SignUpSuccess from "./pages/auth/SignUpSuccess"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Courses from "./pages/Courses"
import CourseDetails from "./pages/CourseDetails"
import Notes from "./pages/Notes"
import Study from "./pages/Study"
import Research from "./pages/Research"
import Search from "./pages/Search"

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/signup-success" element={<SignUpSuccess />} />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study"
            element={
              <ProtectedRoute>
                <Study />
              </ProtectedRoute>
            }
          />
          <Route
            path="/research"
            element={
              <ProtectedRoute>
                <Research />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
