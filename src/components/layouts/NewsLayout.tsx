import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/joy";
import { motion } from "motion/react";
import HeroBlogPost from "../molecules/news/HeroBlogPost";
import SmallBlogPostPreview from "../molecules/news/SmallBlogPostPreview";
import FeaturedBlogPostPreview from "../molecules/news/FeaturedBlogPostPreview";
import NewsCarouselController from "../molecules/news/NewsCarouselController";
import ChangelogSidebar from "../molecules/news/ChangelogSidebar";
import { useNewsContext } from "../../contextProviders/NewsContextProvider";

function isFeaturedIndex(index: number): boolean {
    // Every 3rd card (0-indexed: 0, 3, 6, 9...) is featured (spans 2 columns)
    return index % 3 === 0;
}

export default function NewsLayout() {
    const {
        allPosts,
        activeIndex,
        totalPosts,
        isLoading,
        isEmpty,
        changelogEntries,
        isChangelogLoading,
        isChangelogEmpty,
        goToNext,
        goToPrevious,
        setPaused,
    } = useNewsContext();

    const heroPost = allPosts[activeIndex] ?? null;
    const gridPosts = allPosts.filter((_, i) => i !== activeIndex);

    const showEmpty = isEmpty && isChangelogEmpty;

    return (
        <Box sx={{ height: "100%", minWidth: 0, display: "flex", flexDirection: "row" }}>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <Stack spacing={0.5} sx={{ p: 3, pb: 2 }}>
                    <Typography level="h1">News</Typography>
                </Stack>

                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, pb: 3 }}>
                    <Stack spacing={3}>
                        {isLoading && (
                            <Alert color="neutral" variant="soft">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size="sm" />
                                    <Typography level="body-sm">Loading news...</Typography>
                                </Stack>
                            </Alert>
                        )}

                        {showEmpty && (
                            <Alert color="warning" variant="soft">
                                <Typography level="body-sm">
                                    No news is currently available.
                                </Typography>
                            </Alert>
                        )}

                        {heroPost && (
                            <NewsCarouselController
                                activeIndex={activeIndex}
                                total={totalPosts}
                                onPrevious={goToPrevious}
                                onNext={goToNext}
                                onHover={setPaused}
                            >
                                <HeroBlogPost {...heroPost} />
                            </NewsCarouselController>
                        )}

                        {gridPosts.length > 0 && (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gridAutoFlow: "dense",
                                    gap: 2.5,
                                }}
                            >
                                {gridPosts.map((post, index) => {
                                    const featured = isFeaturedIndex(index);
                                    return (
                                        <motion.div
                                            key={post.slug ?? `post-${index}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.35,
                                                delay: Math.min(index * 0.07, 0.5),
                                                ease: "easeOut",
                                            }}
                                            style={{
                                                gridColumn: featured ? "span 2" : "span 1",
                                            }}
                                        >
                                            {featured ? (
                                                <FeaturedBlogPostPreview {...post} />
                                            ) : (
                                                <SmallBlogPostPreview {...post} />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>
            <ChangelogSidebar
                entries={changelogEntries}
                isLoading={isChangelogLoading}
                isEmpty={isChangelogEmpty}
            />
        </Box>
    );
}
