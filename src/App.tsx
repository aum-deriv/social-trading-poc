import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "@/routes/routes";
import "./App.css";

function App() {
    const router = createBrowserRouter(routes);
    return <RouterProvider router={router} />;
}

export default App;
