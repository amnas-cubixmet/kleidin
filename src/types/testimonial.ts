export type Testimonial = {
  id: string;
  name: string;
  quote: string;
  location?: string;
  productImage?: string;
  productImagePublicId?: string;
  rating: number;
  productSlug?: string;
  showOnHome: boolean;
  enabled: boolean;
  pending?: boolean;
  submittedByCustomer?: boolean;
  createdAt: string;
};
