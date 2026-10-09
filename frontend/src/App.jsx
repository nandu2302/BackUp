import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Experience from "./pages/Experience";
import Hindsight from "./pages/Hindsight";
import Memory from "./pages/Memory";
import CreateProject from "./pages/CreateProject";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Idea from "./pages/stages/Idea";
import Requirements from "./pages/stages/Requirements";
import Architecture from "./pages/stages/Architecture";
import Development from "./pages/stages/Development";
import Testing from "./pages/stages/Testing";
import Deployment from "./pages/stages/Deployment";
import Projects from "./pages/Projects";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route element={<DashboardLayout />}>

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/projects"
                        element={<Projects />}
                    />

                    <Route
                        path="/experience"
                        element={<Experience />}
                    />

                    <Route
                        path="/hindsight"
                        element={<Hindsight />}
                    />

                    <Route
                        path="/memory"
                        element={<Memory />}
                    />

                    <Route
                        path="/projects/create"
                        element={<CreateProject />}
                    />

                    <Route
                        path="/projects/:projectId"
                        element={<ProjectWorkspace />}
                    />

                    <Route path="/projects/:projectId/idea" element={<Idea />}/>

                    <Route
                        path="/projects/:projectId/requirements"
                        element={<Requirements />}
                    />

                    <Route
                        path="/projects/:projectId/architecture"
                        element={<Architecture />}
                    />

                    <Route
                        path="/projects/:projectId/development"
                        element={<Development />}
                    />

                    <Route
                        path="/projects/:projectId/testing"
                        element={<Testing />}
                    />

                    <Route
                        path="/projects/:projectId/deployment"
                        element={<Deployment />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;
