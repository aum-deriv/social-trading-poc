import { RouteObject, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import Feed from "@pages/feed";
import Login from "@pages/login";
import Welcome from "@/pages/welcome";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/ProtectedRoute";
import Discover from "@/pages/discover/Discover";

export const routes: RouteObject[] = [
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/welcome",
            element: (
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        errorElement: <NotFound />,
        children: [
          {
            path: "/",
            element: <Feed />
          },
          {
            path: "/feed",
            element: <Feed />
          },
          {
            path: "/discover",
            element: <Discover />
          },
          {
            path: "/profile/:username",
            element: <Profile />,
          },
          {
            path: "*",
            element: <NotFound />
          }
        ]
      }
    ]
  }
];
