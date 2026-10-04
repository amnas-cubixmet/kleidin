export type Announcement = {
  id: string;
  text: string;
  linkLabel: string;
  linkHref: string;
  startsAt: string | null;
  endsAt: string | null;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
