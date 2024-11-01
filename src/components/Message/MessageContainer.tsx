import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Message, MessageType } from './Message';

interface MessageInstance {
  id: string;
  type: MessageType;
  content: string;
  duration?: number;
}

let messageInstance: {
  messages: MessageInstance[];
  setMessages: (messages: MessageInstance[]) => void;
} | null = null;

const MessageContainer = () => {
  const [messages, setMessages] = useState<MessageInstance[]>([]);

  // 保存实例引用
  messageInstance = { messages, setMessages };

  const remove = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {messages.map(msg => (
        <Message key={msg.id} {...msg} onClose={remove} />
      ))}
    </div>
  );
};

// 创建容器
let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

export const getContainer = () => {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    root.render(<MessageContainer />);
  }
  return root;
};

// 消息管理器
export const message = {
  _add: (type: MessageType, content: string, duration?: number) => {
    const id = `message-${Date.now()}-${Math.random()}`;
    const instance = { id, type, content, duration };

    if (messageInstance) {
      messageInstance.setMessages(prev => [...prev, instance]);
    }

    return id;
  },

  info: (content: string, duration?: number) =>
    message._add('info', content, duration),

  success: (content: string, duration?: number) =>
    message._add('success', content, duration),

  warning: (content: string, duration?: number) =>
    message._add('warning', content, duration),

  error: (content: string, duration?: number) =>
    message._add('error', content, duration),
}; 
