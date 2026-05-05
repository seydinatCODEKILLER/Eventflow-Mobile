export const QUERY_KEYS = {
  feed: ["feed"],
  feedEvent: (id: string) => ["feed", "event", id],
  explorer: ["explorer"],
  nearby: ["explorer", "nearby"],
  events: ["events"],
  myEvents: ["events", "mine"],
  tickets: ["tickets"],
  notifications: ["notifications"],
  profile: ["profile"],
} as const;