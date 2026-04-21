declare module Blog {
	export interface IAuthor {
		id: string;
		name: string;
		avatar: string;
		bio: string;
		skills: string[];
		socials: { platform: string; url: string }[];
	}

	export interface ITag {
		id: string;
		name: string;
		slug: string;
		postCount: number;
	}

	export interface IPost {
		id: string;
		title: string;
		slug: string;
		thumbnail: string;
		summary: string;
		content: string;
		author?: IAuthor;
		createdAt: string;
		viewCount: number;
		status: 'draft' | 'published';
		tags: string[];
	}
}