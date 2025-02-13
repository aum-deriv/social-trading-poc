import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import AiGif from "../../assets/icons/ai.gif";
import SkeletonCard from "./components/SkeletonCard";
import LeaderCard from "./components/LeaderCard";
import "./Discover.css";

type Leader = {
  id: string;
  username: string;
  avatar?: string;
  copiers: number;
  totalProfit: number;
  winRate: number;
  isFollowing: boolean;
};

type User = {
  id: string;
  username: string;
  profilePicture?: string;
  userType: string;
};

export default function Discover() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const handleFollowToggle = useCallback(
    async (leaderId: string) => {
      if (!user) return;

      try {
        // Get current leader and user data
        const [leaderRes, currentUserRes] = await Promise.all([
          fetch(`http://localhost:3001/users/${leaderId}`),
          fetch(`http://localhost:3001/users/${user.id}`),
        ]);

        const leader = await leaderRes.json();
        const currentUser = await currentUserRes.json();

        // Update following/followers lists
        const isFollowing = currentUser.following.includes(leaderId);
        if (isFollowing) {
          // Unfollow: Remove from lists
          leader.followers = leader.followers.filter(
            (id: string) => id !== user.id
          );
          currentUser.following = currentUser.following.filter(
            (id: string) => id !== leaderId
          );
        } else {
          // Follow: Add to lists
          leader.followers.push(user.id);
          currentUser.following.push(leaderId);
        }

        // Update both users in database
        await Promise.all([
          fetch(`http://localhost:3001/users/${leaderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leader),
          }),
          fetch(`http://localhost:3001/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser),
          }),
        ]);

        // Update local state
        setLeaders((prevLeaders: Leader[]) =>
          prevLeaders.map((leader: Leader) =>
            leader.id === leaderId
              ? { ...leader, isFollowing: !leader.isFollowing }
              : leader
          )
        );
      } catch (error) {
        console.error("Error updating follow status:", error);
      }
    },
    [user]
  );

  // Top 3 leaders sorted by profit
  const topLeaders = useMemo(() => {
    return [...leaders]
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 3);
  }, [leaders]);

  // AI Suggested Leaders (random selection)
  const aiSuggestedLeaders = useMemo(() => {
    return [...leaders].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [leaders]);

  // Top Earners (random selection)
  const topEarners = useMemo(() => {
    return [...leaders].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [leaders]);

  // Most Popular (random selection)
  const mostPopular = useMemo(() => {
    return [...leaders].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [leaders]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch("http://localhost:3001/users");
        const users: User[] = await res.json();
        console.log(users);

        // Get leaders with random stats
        // Get current user data to check following status
        const currentUserRes = user
          ? await fetch(`http://localhost:3001/users/${user.id}`)
          : null;
        const currentUserData = currentUserRes
          ? await currentUserRes.json()
          : null;

        const leaders = users
          .filter((u) => u.userType === "leader")
          .map((leader) => ({
            id: leader.id,
            username: leader.username,
            avatar: leader.profilePicture,
            copiers: Math.floor(Math.random() * 2000) + 500, // Random copiers between 500-2500
            totalProfit: Math.floor(Math.random() * 900000) + 100000, // Random profit between 100k-1M
            winRate: Math.floor(Math.random() * 20) + 70, // Random win rate between 70-90%
            isFollowing: currentUserData
              ? currentUserData.following.includes(leader.id)
              : false,
          }))
          .sort((a, b) => b.totalProfit - a.totalProfit);

        setLeaders(leaders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaders:", error);
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  return (
    <div className="discover">
      <h1 className="discover__title">Top Leaders</h1>
      <div className="discover__search">
        <input
          type="search"
          className="discover__search-input"
          placeholder="AI powered search..."
        />
        <button className="discover__search-ai">
          <img src={AiGif} alt="AI Search" />
        </button>
      </div>
      {loading ? (
        <>
          {/* Top 3 Leaders */}
          <h2 className="discover__section-title">Top 3 Leaders</h2>
          <div className="discover__top-leaders">
            {[...Array(3)].map((_, index) => (
              <SkeletonCard key={index} large showRank />
            ))}
          </div>

          {/* AI Suggested Leaders */}
          <h2 className="discover__section-title">AI Suggested Leaders</h2>
          <div className="discover__leaders-grid">
            {[...Array(5)].map((_, index) => (
              <SkeletonCard key={`ai-${index}`} />
            ))}
          </div>

          {/* Top Earners */}
          <h2 className="discover__section-title">Top Earners</h2>
          <div className="discover__leaders-grid">
            {[...Array(5)].map((_, index) => (
              <SkeletonCard key={`earners-${index}`} />
            ))}
          </div>

          {/* Most Popular */}
          <h2 className="discover__section-title">Most Popular</h2>
          <div className="discover__leaders-grid">
            {[...Array(5)].map((_, index) => (
              <SkeletonCard key={`popular-${index}`} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Top 3 Leaders */}
          <h2 className="discover__section-title">Top 3 Leaders</h2>
          <div className="discover__top-leaders">
            {topLeaders.map((leader, index) => (
              <LeaderCard
                key={leader.id}
                leader={leader}
                rank={index + 1}
                onFollow={handleFollowToggle}
                large
              />
            ))}
          </div>

          {/* AI Suggested Leaders */}
          <h2 className="discover__section-title">AI Suggested Leaders</h2>
          <div className="discover__leaders-grid">
            {aiSuggestedLeaders.map((leader) => (
              <LeaderCard
                key={leader.id}
                leader={leader}
                onFollow={handleFollowToggle}
              />
            ))}
          </div>

          {/* Top Earners */}
          <h2 className="discover__section-title">Top Earners</h2>
          <div className="discover__leaders-grid">
            {topEarners.map((leader) => (
              <LeaderCard
                key={leader.id}
                leader={leader}
                onFollow={handleFollowToggle}
              />
            ))}
          </div>

          {/* Most Popular */}
          <h2 className="discover__section-title">Most Popular</h2>
          <div className="discover__leaders-grid">
            {mostPopular.map((leader) => (
              <LeaderCard
                key={leader.id}
                leader={leader}
                onFollow={handleFollowToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
