export const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
};

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} menit lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  } else if (diffDays === 1) {
    return 'kemarin';
  } else {
    return `${diffDays} hari lalu`;
  }
}