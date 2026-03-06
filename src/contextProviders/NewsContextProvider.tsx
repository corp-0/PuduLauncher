import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { BlogApi, ChangelogApi, type BlogPost, type ChangelogEntry } from "../pudu/generated";
import { useFeedbackContext } from "./FeedbackContextProvider";

const ROTATION_INTERVAL_MS = 8_000;
const POSTS_TO_FETCH = 12;
const CHANGELOG_TO_FETCH = 10;
const PLACEHOLDER_IMAGE_URL = "/aiPlaceholders/pudu-nap.png";

interface NewsContextValue {
    allPosts: BlogPost[];
    activeIndex: number;
    totalPosts: number;
    isLoading: boolean;
    isEmpty: boolean;
    changelogEntries: ChangelogEntry[];
    isChangelogLoading: boolean;
    isChangelogEmpty: boolean;
    goToNext: () => void;
    goToPrevious: () => void;
    setPaused: (paused: boolean) => void;
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

export function NewsContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showError } = useFeedbackContext();

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isChangelogLoading, setIsChangelogLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    const goToNext = () => {
        setActiveIndex((previous) => {
            if (posts.length === 0) {
                return 0;
            }

            return (previous + 1) % posts.length;
        });
    };

    const goToPrevious = () => {
        setActiveIndex((previous) => {
            if (posts.length === 0) {
                return 0;
            }

            return (previous - 1 + posts.length) % posts.length;
        });
    };

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
        if (posts.length < 2 || isPaused) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setActiveIndex((previous) => (previous + 1) % posts.length);
        }, ROTATION_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [posts.length, isPaused]);

    useEffect(() => {
        if (activeIndex >= posts.length) {
            setActiveIndex(0);
        }
    }, [activeIndex, posts.length]);

    const value: NewsContextValue = {
        allPosts: posts,
        activeIndex,
        totalPosts: posts.length,
        isLoading,
        isEmpty: !isLoading && posts.length === 0,
        changelogEntries,
        isChangelogLoading,
        isChangelogEmpty: !isChangelogLoading && changelogEntries.length === 0,
        goToNext,
        goToPrevious,
        setPaused: setIsPaused,
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
