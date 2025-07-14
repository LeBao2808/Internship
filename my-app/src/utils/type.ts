import { IBlog } from "@/app/api/models/Blog";
import { IUser } from "@/app/api/models/User";

export interface Comment {
  _id?: number;
  content: string;
  user: string | { _id: string; name: string };
  nameUser: string;
  blog: string | { _id: string; title: string };
  titleBlog: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
  nameRole: string;
}

export interface Blog {
  _id?: string;
  title: string;
  content: string;
  user: User;
  image_url: string;
  category: Category;
  createdAt?: string;
  namecategory?: string;
  nameuser?: string;
  updatedAt?: string;
  featured?: boolean;
  slug?: string;
}

export interface Category {
  _id?: string;
  name: string;
  description: string;
  image?: string; // Optional field for category image  
  slug?: string; // Optional field for category slug
}

export interface Role {
  _id?: string;
  name: string;
  description: string;
}

export interface SaveBlog {
  _id?: string;
  user: User
  blog: Blog
}