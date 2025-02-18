import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '@/modules/feed/services/postService';
import { createStrategy } from '@/modules/strategy/services/strategyService';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/layouts/Header';
import AppContent from '@/layouts/AppContent';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import CreateContentSheet from '@/components/content/CreateContentSheet';
import type { StrategyFormData } from '@/modules/strategy/components/StrategyForm/StrategyForm';
import './MainLayout.css';

const MainLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleCreatePost = async (content: { text: string; images: string[] }) => {
    if (!user) return;
    const newPost = await createPost({
      userId: user.id,
      content,
    });
    return newPost;
  };

  const handleCreateStrategy = async (data: StrategyFormData) => {
    if (!user) return;
    try {
      const newStrategy = await createStrategy(user.id, data);
      setShowActionSheet(false);
      navigate(`/strategies/${newStrategy.id}`);
      return newStrategy;
    } catch (error) {
      console.error('Failed to create strategy:', error);
      throw error;
    }
  };

  return (
    <div className="main-layout">
      <Header />
      <AppContent>
        <Outlet />
      </AppContent>
      <BottomNavigation onCreateContent={() => setShowActionSheet(true)} />

      {user && (
        <CreateContentSheet
          isOpen={showActionSheet}
          onClose={() => setShowActionSheet(false)}
          onCreatePost={handleCreatePost}
          onCreateStrategy={handleCreateStrategy}
          userType={user.userType}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default MainLayout;
