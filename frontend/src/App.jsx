import { Route, Routes, useLocation, Router } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import NavBar from "./components/NavBar"
import Home from "./pages/Home";
import ResearchPostView from "./pages/Research/ResearchPostView";
import PostByTags from "./pages/Research/PostByTags";
import SearchPost from "./pages/Research/SearchPost";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/Admin/Dashboard";
import ResearchPost from "./pages/Admin/ResearchPost";
import ResearchPostEditor from "./pages/Admin/ResearchPostEditor";
import Comments from "./pages/Admin/Comments";
import AdminLogin from "./pages/Admin/AdminLogin";
import ResearchLandingPage from "./pages/Research/ResearchLandingPage";
import UserProvider from "./context/userContext";
import ResearchPostEditorQuill from "./pages/Admin/ResearchPostEditorQuill";
import Students from "./pages/Admin/Students";

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  return (
    <UserProvider>
    <div>
      {!isOwnerPath && <NavBar />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<ResearchLandingPage />} />
          <Route path="/:slug" element={<ResearchPostView />} />
          <Route path="/tag/:tagName" element={<PostByTags />} />
          <Route path="/search" element={<SearchPost />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin", "superadmin"]} />} >
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/posts" element={<ResearchPost />} />
              <Route path="/admin/create" element={<ResearchPostEditor />} />
              {/* <Route path="/admin/create" element={<ResearchPostEditorQuill />} /> */}
              <Route path="/admin/edit/:postSlug" element={<ResearchPostEditor isEdit={true} />} />
              <Route path="/admin/comments" element={<Comments />} />
              {/* <Route path="/admin/students" element={<Students />} /> */}
          </Route>

          <Route element={<PrivateRoute allowedRoles={["superadmin"]} />} >
              <Route path="/admin/students" element={<Students />} />
          </Route>

              {/* <Route path="/admin-login" element={<AdminLogin />} /> */}
          
        </Routes>

        {/* <Toaster position="top-right" reverseOrder={false} /> */}
        <Toaster toastOptions={{className: "", style: {fontSize: "13px",},}} position="top-right" reverseOrder={false} />
      </div>
    </div>
    </UserProvider>
  )
}
export default App