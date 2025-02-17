import { Outlet } from "react-router-dom";
import Header from "@/layouts/Header";
import AppContent from "@/layouts/AppContent";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import "./MainLayout.css";

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Header />
            <AppContent>
                <Outlet />
            </AppContent>
            <BottomNavigation />
        </div>
    );
};

export default MainLayout;
