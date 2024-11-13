interface Props {
  isLoading: boolean;
  text?: string;
}

export const LoadingOverlay = ({ isLoading, text = '加载中...' }: Props) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-base-100/50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}; 
