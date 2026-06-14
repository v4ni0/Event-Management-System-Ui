export interface FeedbackRequest {
  overallRating: number;
  comment?: string | null;
  venueRating?: number | null;
  contentRating?: number | null;
  organizationRating?: number | null;
}

export interface FeedbackResponse {
  id: number;
  userId: number;
  eventId: number;
  overallRating: number;
  comment: string | null;
  venueRating: number | null;
  contentRating: number | null;
  organizationRating: number | null;
  submittedAt: string;
}

export interface FeedbackSummaryResponse {
  eventId: number;
  totalCount: number;
  averageOverallRating: number | null;
  averageVenueRating: number | null;
  averageContentRating: number | null;
  averageOrganizationRating: number | null;
}
