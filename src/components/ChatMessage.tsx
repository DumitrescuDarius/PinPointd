import React, { useState } from 'react';
import { Box, Typography, Checkbox, Modal } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';

interface ChatMessageProps {
  message: any;
  isCurrentUser: boolean;
  isSelected: boolean;
  onSelect: (messageId: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, messageId: string) => void;
  isSelectionMode: boolean;
  currentUser: any;
  formatMessageTime: (timestamp: any) => string;
  getMessageStatus: (message: any) => 'sent' | 'delivered' | 'read' | 'none';
  lastSentMessageId: string | null;
  showTail?: boolean;
}

const MessageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '2px',
});

const MessageWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser'
})<{ isCurrentUser: boolean }>(({ isCurrentUser }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
  alignItems: 'center',
  position: 'relative',
  gap: '4px',
  '&:hover .message-options-button': {
    opacity: 1,
    visibility: 'visible'
  }
}));

const MessageOptionsButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser' && prop !== 'isSelectionMode'
})<{ isCurrentUser: boolean; isSelectionMode: boolean }>(({ isCurrentUser, isSelectionMode }) => ({
  display: isSelectionMode ? 'none' : 'block',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.2s ease, visibility 0.2s ease',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '50%',
  position: 'absolute',
  [isCurrentUser ? 'left' : 'right']: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  }
}));

const MessageContent = styled(Typography)({
  fontSize: '0.95rem',
  lineHeight: '1.4',
  whiteSpace: 'pre-wrap',
  '& a': {
    color: 'inherit',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8
    }
  }
});

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'isCurrentUser' && 
    prop !== 'isBot' && 
    prop !== 'hasAttachment' && 
    prop !== 'isAudio' &&
    prop !== 'isTyping' &&
    prop !== 'showTail'
})<{
  isCurrentUser: boolean;
  isBot?: boolean;
  hasAttachment?: boolean;
  isAudio?: boolean;
  isTyping?: boolean;
  showTail?: boolean;
}>(({ theme, isCurrentUser, isTyping, showTail }) => ({
  maxWidth: '70%',
  padding: '8px 12px',
  borderRadius: isCurrentUser ? '15px 15px 3px 15px' : '15px 15px 15px 3px',
  backgroundColor: isCurrentUser ? 
    (theme.palette.mode === 'dark' ? '#0055C8' : '#0055C8') : 
    (theme.palette.mode === 'dark' ? '#1F2C34' : '#FFFFFF'),
  color: isCurrentUser ? '#FFFFFF' : (theme.palette.mode === 'dark' ? '#E9EDF0' : '#111B21'),
  boxShadow: theme.palette.mode === 'dark' ? 
    '0 1px 2px rgba(0, 0, 0, 0.2)' : 
    '0 1px 2px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  margin: '4px 0',
  wordBreak: 'break-word',
  border: 'none',
  transition: 'all 0.2s ease',
  opacity: isTyping ? 0.7 : 1,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.palette.mode === 'dark' ? 
      '0 4px 12px rgba(0, 0, 0, 0.2)' : 
      '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  '&::after': showTail ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    [isCurrentUser ? 'right' : 'left']: -8,
    width: 12,
    height: 12,
    backgroundColor: 'inherit',
    clipPath: isCurrentUser ? 
      'polygon(0 0, 0 100%, 100% 100%)' : 
      'polygon(0 100%, 100% 100%, 100% 0)',
  } : {}
}));

const MessageMetaWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser'
})<{ isCurrentUser: boolean }>(({ theme, isCurrentUser }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '4px',
  fontSize: '0.75rem',
  marginTop: '2px',
  opacity: 0.85,
  color: isCurrentUser ? 'rgba(255, 255, 255, 0.95)' : (theme.palette.mode === 'dark' ? '#8696A0' : '#667781'),
  '& .read': {
    color: isCurrentUser ? '#FFFFFF' : (theme.palette.mode === 'dark' ? '#00A884' : '#34B7F1')
  }
}));

// Add loading dots animation
const LoadingDots = styled('span')({
  '&::after': {
    content: '"..."',
    animation: 'loading 1.5s infinite',
    display: 'inline-block',
    width: '1em',
    textAlign: 'left',
  },
  '@keyframes loading': {
    '0%': { content: '"."' },
    '33%': { content: '".."' },
    '66%': { content: '"..."' },
  }
});

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
});

const FullScreenImage = styled('img')({
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'contain',
});

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  isSelected,
  onSelect,
  onMenuOpen,
  isSelectionMode,
  currentUser,
  formatMessageTime,
  getMessageStatus,
  lastSentMessageId,
  showTail
}) => {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const handleImageClick = () => {
    setImagePreviewOpen(true);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);
  };

  const handleLongPress = (e: React.PointerEvent) => {
    if (!isCurrentUser) return;
    
    const longPressTimer = setTimeout(() => {
      onSelect(message.id);
    }, 500);
    
    const element = e.currentTarget as HTMLElement;
    element.dataset.longPressTimer = String(longPressTimer);
    
    const handlePointerUp = () => {
      if (element.dataset.longPressTimer) {
        clearTimeout(Number(element.dataset.longPressTimer));
        delete element.dataset.longPressTimer;
      }
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (Math.abs(moveEvent.clientX - e.clientX) > 5 || 
          Math.abs(moveEvent.clientY - e.clientY) > 5) {
        if (element.dataset.longPressTimer) {
          clearTimeout(Number(element.dataset.longPressTimer));
          delete element.dataset.longPressTimer;
        }
      }
    };
    
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
  };
  
  // Function to convert URLs to clickable links
  const formatMessageText = (text: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split the text by URLs and map through the parts
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      // If the part matches a URL, wrap it in an anchor tag
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <MessageContainer>
      <MessageWrapper
        isCurrentUser={isCurrentUser}
        id={message.id}
        className={`message-wrapper ${message.id === lastSentMessageId ? 'message-sending-animation' : ''}`}
        sx={{
          cursor: isSelectionMode && isCurrentUser ? 'pointer' : 'default',
          pl: isSelectionMode && isCurrentUser ? 4 : 0,
        }}
        onClick={(e) => {
          if (isSelectionMode && isCurrentUser) {
            e.stopPropagation();
            onSelect(message.id);
          }
        }}
        onPointerDown={handleLongPress}
      >
        {isSelectionMode && isCurrentUser && (
          <Checkbox
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(message.id);
            }}
            onClick={(e) => e.stopPropagation()}
            sx={{ 
              p: 0.5,
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
        )}
        
        <MessageBubble
          isCurrentUser={isCurrentUser}
          isBot={message.isBot}
          hasAttachment={!!message.imageUrl || !!message.audioUrl}
          isAudio={!!message.audioUrl}
          isTyping={message.isTyping}
          showTail={showTail}
          sx={{
            position: 'relative',
            zIndex: 1,
            marginRight: isCurrentUser ? '8px' : 0,
            marginLeft: isCurrentUser ? 0 : '8px'
          }}
        >
          {message.type === 'image' ? (
            <Box sx={{ position: 'relative' }}>
              <ImagePreview 
                src={message.imageUrl} 
                alt="Shared image"
                onClick={handleImageClick}
                loading="lazy"
              />
            </Box>
          ) : (
            <MessageContent>
              {message.isTyping ? (
                <>
                  {typeof message.text === 'string' ? message.text : ''}<LoadingDots />
                </>
              ) : (
                typeof message.text === 'string' ? formatMessageText(message.text) : ''
              )}
            </MessageContent>
          )}
          
          <MessageMetaWrapper isCurrentUser={isCurrentUser}>
            {formatMessageTime(message.timestamp)}
            {isCurrentUser && (
              <Box component="span" className="message-status">
                {getMessageStatus(message) === 'read' ? (
                  <DoneAllIcon className="read" fontSize="inherit" />
                ) : getMessageStatus(message) === 'delivered' ? (
                  <DoneAllIcon fontSize="inherit" />
                ) : (
                  <DoneIcon fontSize="inherit" />
                )}
              </Box>
            )}
          </MessageMetaWrapper>
        </MessageBubble>
        
        <MessageOptionsButton 
          isCurrentUser={isCurrentUser}
          isSelectionMode={isSelectionMode}
          className="message-options-button"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e, message.id);
          }}
        >
          <MoreVertIcon fontSize="small" sx={{ color: '#aebac1' }} />
        </MessageOptionsButton>
      </MessageWrapper>

      <Modal
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        aria-labelledby="image-preview"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <Box
          sx={{
            outline: 'none',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleCloseImagePreview}
        >
          <FullScreenImage
            src={message.imageUrl}
            alt="Full size image"
            loading="lazy"
          />
        </Box>
      </Modal>
    </MessageContainer>
  );
};

export default ChatMessage; 