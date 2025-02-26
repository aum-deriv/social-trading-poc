import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';
import TabNavigation from '@/components/navigation/TabNavigation/TabNavigation';
import FeedList from '@/modules/feed/components/FeedList/FeedList';
import AILoader from '@/components/AILoader';
import './Feed.css';

const Feed = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const { getUser, users, loadingUsers } = useUsers();

  useEffect(() => {
    if (authUser && !users[authUser.id]) {
      getUser(authUser.id);
    }
  }, [authUser, users, getUser]);

  const isLoading = authLoading || (authUser && loadingUsers[authUser.id]);
  const user = authUser && users[authUser.id];
  const [activeTab, setActiveTab] = useState('For you');
  const [shouldRefresh, setShouldRefresh] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="feed-page__container">
        <AILoader size={40} />
      </div>
    );
  }

  return (
    <div className="feed-page">
      <TabNavigation
        tabs={['For you', 'Following']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="feed-page__container">
        <main>
          <FeedList
            activeTab={activeTab}
            currentUserId={user.id}
            currentUser={user}
            shouldRefresh={shouldRefresh}
            onRefreshComplete={() => setShouldRefresh(false)}
          />
        </main>
      </div>
    </div>
  );
};

export default Feed;
