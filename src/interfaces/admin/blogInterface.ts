export interface IUserBolg {
  name: string;
  profileImage: string;
}

export interface IComment {
  user: IUserBolg;
  comment: string;
  date: Date;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  author: IUserBolg;
  coverImage: string;
  content: string;
  tags: string[];
  comments: IComment[];
}