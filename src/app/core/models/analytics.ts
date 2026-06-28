export interface EventAnalyticsResponse {
  eventId: number;
  totalRegistrations: number;
  totalCheckIns: number;
  totalCancellations: number;
  totalFeedback: number;
  averageRating: number | null;
  revenue: number | null;
  computedAt: string;
}

export interface AttendancePoint {
  day: string; 
  count: number;
}
