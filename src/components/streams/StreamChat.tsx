import { getChatUrl } from '../../lib/streamUtils';

interface StreamChatProps {
  player: any;
  className?: string;
}

export default function StreamChat({ player, className = '' }: StreamChatProps) {
  const chatUrl = getChatUrl(player);

  if (!chatUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Чат недоступен</span>
      </div>
    );
  }

  return (
    <div className={`bg-[#282828] overflow-hidden ${className}`}>
      <div className="bg-[#1a1a1a] px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-medium text-white">Чат {player.username}</span>
      </div>
      <iframe
        src={chatUrl}
        className="w-full h-[calc(100%-40px)]"
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
      />
    </div>
  );
}
