export interface SpeakerRequest {
  userId?: number | null;
  name: string;
  bio?: string | null;
  company?: string | null;
  titlePosition?: string | null;
  photoUrl?: string | null;
  websiteUrl?: string | null;
}

export interface SpeakerResponse {
  id: number;
  userId: number | null;
  name: string;
  bio: string | null;
  company: string | null;
  titlePosition: string | null;
  photoUrl: string | null;
  websiteUrl: string | null;
}

export interface PresentationMaterialResponse {
  id: number;
  speakerId: number;
  agendaItemId: number | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}
