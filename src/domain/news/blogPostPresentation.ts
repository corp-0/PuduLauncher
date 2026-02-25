import { formatDistance, subDays } from "date-fns";
import type { BlogPost } from "../../pudu/generated";
import { UNITYSTATION_BLOG_URL } from "../../constants/externalLinks";

export function buildBlogPostUrl(post: Pick<BlogPost, "slug">): string {
    return UNITYSTATION_BLOG_URL + (post.slug ?? "");
}

export function formatBlogPostByline(post: Pick<BlogPost, "createDateTime" | "author">): string {
    const createdAt = post.createDateTime ? new Date(post.createDateTime) : new Date();
    const relative = formatDistance(subDays(createdAt, 0), new Date(), { addSuffix: true });
    return `${relative} by ${post.author ?? "UnityStation"}`;
}
