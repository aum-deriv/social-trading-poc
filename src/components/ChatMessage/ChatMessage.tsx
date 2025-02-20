import { forwardRef, useEffect } from 'react';
import { GlobalAIResponse } from '@/types/ai.types';
import Chip from '@/components/Chip';
import './ChatMessage.css';

export interface ChatMessageProps {
  className?: string;
  from?: string;
  message?: string;
  attachments?: React.ReactNode;
  navigation?: GlobalAIResponse['navigation'];
  scrollIntoView?: boolean;
}

const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, from, message, attachments, navigation, scrollIntoView }, ref) => {
    useEffect(() => {
      if (scrollIntoView && ref && 'current' in ref) {
        setTimeout(() => {
          (ref as React.RefObject<HTMLDivElement>).current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    }, [scrollIntoView]);

    return (
      <div ref={ref} className={`chat-message ${className || ''}`}>
        <div className="chat-message__content">
          <div className="chat-message__from">{from}</div>
          <div className="chat-message__text">{message}</div>
          {attachments && <div className="chat-message__attachments">{attachments}</div>}
          {navigation && (
            <div className="chat-message__navigation">
              {navigation.steps.length > 0 && (
                <div className="chat-message__steps">
                  {navigation.steps.map((step, i) => (
                    <Chip key={i}>{`${i + 1}. ${step}`}</Chip>
                  ))}
                </div>
              )}
              {navigation.features.length > 0 && (
                <div className="chat-message__features">
                  {navigation.features.map((feature, i) => (
                    <Chip key={i}>{feature}</Chip>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ChatMessage;
