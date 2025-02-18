import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type User from '@/types/user.types';
import { UserType } from '@/types/user.types';
import ActionSheet from '@/components/modal/ActionSheet';
import type { ActionSheetAction } from '@/components/modal/ActionSheet';
import FullscreenModal from '@/components/modal/FullscreenModal/FullscreenModal';
import PostForm from '@/modules/feed/components/PostForm';
import StrategyForm from '@/modules/strategy/components/StrategyForm/StrategyForm';
import CreatePostIcon from '@/assets/icons/CreatePostIcon';
import CreateStrategyIcon from '@/assets/icons/CreateStrategyIcon';

import type { StrategyFormData } from '@/modules/strategy/components/StrategyForm/StrategyForm';

interface CreateContentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: { text: string; images: string[] }) => Promise<any>;
  onCreateStrategy: (strategy: StrategyFormData) => Promise<any>;
  userType: UserType;
  currentUser: User;
}

const CreateContentSheet: React.FC<CreateContentSheetProps> = ({
  isOpen,
  onClose,
  onCreatePost,
  onCreateStrategy,
  userType,
  currentUser,
}) => {
  type PendingAction = 'createPost' | 'createStrategy' | null;

  const [showPostForm, setShowPostForm] = useState(false);
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const navigate = useNavigate();

  const handleCreatePost = () => {
    setPendingAction('createPost');
    onClose();
  };

  const handleActionSheetExited = () => {
    if (pendingAction === 'createPost') {
      setShowPostForm(true);
      setPendingAction(null);
    } else if (pendingAction === 'createStrategy') {
      setShowStrategyForm(true);
      setPendingAction(null);
    }
  };

  const handlePostFormClose = () => {
    setShowPostForm(false);
    setPendingAction(null);
  };

  const handleStrategyFormClose = () => {
    setShowStrategyForm(false);
    setPendingAction(null);
  };

  const handlePostSubmit = async (content: { text: string; images: string[] }) => {
    try {
      const newPost = await onCreatePost(content);
      if (newPost?.id) {
        handlePostFormClose();
        navigate(`/posts/${newPost.id}`);
      } else {
        console.error('Failed to create post: No post ID returned');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      // TODO: Show error message to user
    }
  };

  const actions: ActionSheetAction[] = [
    {
      icon: <CreatePostIcon />,
      label: 'Create Post',
      onClick: handleCreatePost,
    },
    ...(userType === UserType.LEADER
      ? [
          {
            icon: <CreateStrategyIcon />,
            label: 'Create Strategy',
            onClick: () => {
              setPendingAction('createStrategy');
              onClose();
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <ActionSheet
        isOpen={isOpen}
        onClose={onClose}
        onExited={handleActionSheetExited}
        actions={actions}
        title="Create Content"
      />
      <FullscreenModal isOpen={showPostForm} onClose={handlePostFormClose} title="Create Post">
        <PostForm
          currentUser={currentUser}
          onSubmit={handlePostSubmit}
          onClose={handlePostFormClose}
        />
      </FullscreenModal>
      <FullscreenModal
        isOpen={showStrategyForm}
        onClose={handleStrategyFormClose}
        title="Create Strategy"
      >
        <StrategyForm
          currentUser={currentUser}
          onSubmit={onCreateStrategy}
          onClose={handleStrategyFormClose}
        />
      </FullscreenModal>
    </>
  );
};

export default CreateContentSheet;
