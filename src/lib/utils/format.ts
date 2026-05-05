export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPrice = (price: number, currency = "XOF"): string => {
  return new Intl.NumberFormat("fr-FR").format(price) + " " + currency;
};

export const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Passé";
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  if (days < 7) return `Dans ${days} jours`;
  return formatDate(date);
};
