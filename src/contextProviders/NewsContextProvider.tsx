import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BlogApi, ChangelogApi, type BlogPost, type ChangelogEntry } from "../pudu/generated";
import { useErrorContext } from "./ErrorContextProvider";

const ROTATION_INTERVAL_MS = 8_000;
const POSTS_TO_FETCH = 12;
const CHANGELOG_TO_FETCH = 10;
const VISIBLE_POSTS = 4;
const PLACEHOLDER_IMAGE_URL = "/aiPlaceholders/pudu-nap.png";

interface NewsContextValue {
    posts: BlogPost[];
    featuredPost: BlogPost | null;
    secondaryPosts: BlogPost[];
    activeIndex: number;
    totalPosts: number;
    isLoading: boolean;
    isEmpty: boolean;
    changelogEntries: ChangelogEntry[];
    isChangelogLoading: boolean;
    isChangelogEmpty: boolean;
    goToNext: () => void;
    goToPrevious: () => void;
}

const NewsContext = createContext<NewsContextValue | undefined>(undefined);

function normalizePost(post: BlogPost, index: number): BlogPost {
    return {
        ...post,
        title: post.title || `Post ${index + 1}`,
        slug: post.slug ?? "",
        author: post.author ?? "UnityStation",
        createDateTime: post.createDateTime ?? new Date().toISOString(),
        imageUrl: post.imageUrl ?? PLACEHOLDER_IMAGE_URL,
        summary: post.summary ?? "",
        state: post.state ?? "published",
    };
}

function buildVisiblePosts(posts: BlogPost[], startIndex: number): BlogPost[] {
    if (posts.length === 0) {
        return [];
    }

    return Array.from({ length: VISIBLE_POSTS }, (_, offset) => {
        const index = (startIndex + offset) % posts.length;
        return posts[index];
    });
}

export function NewsContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showError } = useErrorContext();

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isChangelogLoading, setIsChangelogLoading] = useState(true);

    const goToNext = useCallback(() => {
        setActiveIndex((previous) => {
            if (posts.length === 0) {
                return 0;
            }

            return (previous + 1) % posts.length;
        });
    }, [posts.length]);

    const goToPrevious = useCallback(() => {
        setActiveIndex((previous) => {
            if (posts.length === 0) {
                return 0;
            }

            return (previous - 1 + posts.length) % posts.length;
        });
    }, [posts.length]);

    useEffect(() => {
        const loadBlogPosts = async () => {
            setIsLoading(true);

            const api = new BlogApi();

            try {
                const response = await api.getBlogPosts(POSTS_TO_FETCH);

                if (!response.success || !response.data) {
                    showError({
                        source: "frontend.news.get-blog-posts",
                        userMessage: "Failed to load news feed.",
                        code: "NEWS_FETCH_FAILED",
                        technicalDetails: response.error ?? "Unknown backend error.",
                    });
                    setPosts([]);
                    return;
                }

                const normalized = response.data.map((post, index) => normalizePost(post, index));
                setPosts(normalized);
            } catch (error: unknown) {
                showError({
                    source: "frontend.news.get-blog-posts",
                    userMessage: "Failed to load news feed.",
                    code: "NEWS_FETCH_EXCEPTION",
                    technicalDetails: error instanceof Error ? error.message : String(error),
                });
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        const loadChangelog = async () => {
            setIsChangelogLoading(true);

            const api = new ChangelogApi();

            try {
                const response = await api.getChangelog(CHANGELOG_TO_FETCH);

                if (!response.success || !response.data) {
                    showError({
                        source: "frontend.news.get-changelog",
                        userMessage: "Failed to load changelog.",
                        code: "CHANGELOG_FETCH_FAILED",
                        technicalDetails: response.error ?? "Unknown backend error.",
                    });
                    setChangelogEntries([]);
                    return;
                }

                setChangelogEntries(response.data);
            } catch (error: unknown) {
                showError({
                    source: "frontend.news.get-changelog",
                    userMessage: "Failed to load changelog.",
                    code: "CHANGELOG_FETCH_EXCEPTION",
                    technicalDetails: error instanceof Error ? error.message : String(error),
                });
                setChangelogEntries([]);
            } finally {
                setIsChangelogLoading(false);
            }
        };

        void Promise.all([loadBlogPosts(), loadChangelog()]);
    }, [showError]);

    useEffect(() => {
        if (posts.length < 2) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setActiveIndex((previous) => (previous + 1) % posts.length);
        }, ROTATION_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [posts.length]);

    useEffect(() => {
        if (activeIndex >= posts.length) {
            setActiveIndex(0);
        }
    }, [activeIndex, posts.length]);

    const visiblePosts = useMemo(() => buildVisiblePosts(posts, activeIndex), [posts, activeIndex]);

    const featuredPost = visiblePosts[0] ?? null;
    const secondaryPosts = visiblePosts.slice(1);

    const value: NewsContextValue = {
        posts,
        featuredPost,
        secondaryPosts,
        activeIndex,
        totalPosts: posts.length,
        isLoading,
        isEmpty: !isLoading && posts.length === 0,
        changelogEntries,
        isChangelogLoading,
        isChangelogEmpty: !isChangelogLoading && changelogEntries.length === 0,
        goToNext,
        goToPrevious,
    };

    return (
        <NewsContext.Provider value={value}>
            {children}
        </NewsContext.Provider>
    );
}

export function useNewsContext() {
    const context = useContext(NewsContext);

    if (context === undefined) {
        throw new Error("useNewsContext must be used within a NewsContextProvider.");
    }

    return context;
}
