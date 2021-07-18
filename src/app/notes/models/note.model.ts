export interface Note {
    id: number;
    author: number;
    title: string;
    content: string;
    todo: {todoTitle: string, value: boolean}[];
    images: string[];
    lat: string;
    long: string;
    type: string;
    includesUrl: boolean;
    includesMaps: boolean;
    includesImages: boolean;
    isPinned: boolean;
}