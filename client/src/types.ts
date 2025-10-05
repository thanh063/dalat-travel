export type Role = 'ADMIN' | 'USER';

export interface UserDto { id:string; fullName:string; email:string; role:Role }
export interface Tag { id:string; name:string; slug:string }
export interface PlaceTag { tag: Tag }
export interface Place {
  id:string; name:string; slug:string; address:string; price:number; description?:string|null;
  imageUrl?: string | null;            // <--- thêm ảnh
  rating:number; ratingCount:number; createdAt:string; updatedAt:string; tags:PlaceTag[];
}
export interface Review { id:string; rating:number; content:string; createdAt:string; user:{ id:string; fullName:string } }
export interface Booking { id:string; placeId:string; visitDate:string; persons:number; unitPrice:number; total:number; status:'PENDING'|'PAID'|'CANCELLED' }
