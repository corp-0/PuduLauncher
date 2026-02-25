import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/joy";
import BigBlogPostPreview from "../molecules/news/BigBlogPostPreview";
import SmallBlogPostPreview from "../molecules/news/SmallBlogPostPreview";
import NewsCarouselController from "../molecules/news/NewsCarouselController";
import BuildEntry from "../molecules/news/BuildEntry";
import { useNewsContext } from "../../contextProviders/NewsContextProvider";

export default function NewsLayout() {
    const {
        featuredPost,
        secondaryPosts,
        activeIndex,
        totalPosts,
        isLoading,
        isEmpty,
        changelogEntries,
        isChangelogLoading,
        isChangelogEmpty,
        goToNext,
        goToPrevious,
    } = useNewsContext();

    return (
        <Box sx={{ height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Stack spacing={0.5} sx={{ p: 3, pb: 2 }}>
                <Typography level="h1">
                    News
                </Typography>
            </Stack>

            <Stack direction="row" spacing={4} alignItems="stretch" sx={{ p: 3, minHeight: 0, overflow: "hidden", flex: 1 }}>
                <Stack spacing={2} sx={{ flex: 2, minWidth: 0, maxWidth: 900 }}>
                    <Typography level="body-md">
                        Latest Unitystation blog posts
                    </Typography>
                    {isLoading && (
                        <Alert color="neutral" variant="soft">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size="sm" />
                                <Typography level="body-sm">
                                    Loading blog posts...
                                </Typography>
                            </Stack>
                        </Alert>
                    )}

                    {isEmpty && (
                        <Alert color="warning" variant="soft">
                            <Typography level="body-sm">
                                No blog posts are currently available.
                            </Typography>
                        </Alert>
                    )}

                    {featuredPost && (
                        <NewsCarouselController
                            activeIndex={activeIndex}
                            total={totalPosts}
                            onPrevious={goToPrevious}
                            onNext={goToNext}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <BigBlogPostPreview {...featuredPost} />
                            </Box>
                        </NewsCarouselController>
                    )}

                    {secondaryPosts.length > 0 && (
                        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ minWidth: 0 }}>
                            {secondaryPosts.map((post, index) => (
                                <Box key={`${post.slug ?? post.title}-${index}`} sx={{ flex: 1, minWidth: 0 }}>
                                    <SmallBlogPostPreview {...post} />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Stack>

                <Stack alignItems="stretch" sx={{ flex: 1, minWidth: 0, minHeight: 0 }} spacing={2}>
                    <Typography level="body-md">
                        Official Unitystation changelog
                    </Typography>
                    <Stack spacing={1} sx={{ width: "100%", minHeight: 0, flex: 1, overflowY: "auto" }}>
                        {isChangelogLoading && (
                            <Alert color="neutral" variant="soft">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size="sm" />
                                    <Typography level="body-sm">
                                        Loading changelog...
                                    </Typography>
                                </Stack>
                            </Alert>
                        )}

                        {isChangelogEmpty && (
                            <Alert color="warning" variant="soft">
                                <Typography level="body-sm">
                                    No changelog entries are currently available.
                                </Typography>
                            </Alert>
                        )}

                        {changelogEntries.map((entry, index) => (
                            <BuildEntry key={`${entry.version}-${entry.dateCreated}-${index}`} {...entry} />
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
}
