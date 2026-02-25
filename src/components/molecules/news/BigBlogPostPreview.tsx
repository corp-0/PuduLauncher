import { AspectRatio, Card, Link, Stack, Typography } from "@mui/joy";
import { BlogPost } from "../../../pudu/generated";
import { buildBlogPostUrl, formatBlogPostByline } from "../../../domain/news/blogPostPresentation";
import { openExternalUrl } from "../../../utils/navigation/openExternalUrl";

export default function BigBlogPostPreview(props: BlogPost) {
    const { imageUrl, summary, title, createDateTime, author, slug } = props;
    const blogPostUrl = buildBlogPostUrl({ slug });
    const byline = formatBlogPostByline({ createDateTime, author });

    return (
        <Card sx={{ flex: { xs: "1 1 auto", lg: "1 1 0" }, minWidth: 0, width: "100%" }}>
            <Stack
                sx={{
                    width: "100%",
                    minWidth: 0,
                    flexDirection: { xs: "column", lg: "row" },
                    gap: 4
                }}>
                <Card variant="plain" sx={{ flex: { xs: "1 1 auto", lg: "2 1 0" }, minWidth: 0, width: "100%", p: 0 }}>
                    <AspectRatio ratio="16/9" sx={{ width: "100%" }}>
                        <img
                            src={imageUrl!}
                            srcSet={imageUrl + " 2x"}
                            loading="lazy"
                            alt={title}
                            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </AspectRatio>
                </Card>
                <Stack justifyContent="space-between" sx={{ flex: { xs: "1 1 auto", lg: "1 1 0" }, minWidth: 0 }}>
                    <Stack spacing={4}>
                        <Stack spacing={1}>
                            <Typography level="title-lg">
                                {title}
                            </Typography>
                            <Typography level="body-xs">
                                {byline}
                            </Typography>
                        </Stack>

                        <Typography
                            level="body-md"
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 6,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {summary}
                        </Typography>
                    </Stack>

                    <Link
                        href={blogPostUrl}
                        onClick={(event) => void openExternalUrl(event, blogPostUrl)}
                        underline="none"
                    >
                        Read more...
                    </Link>
                </Stack>
            </Stack>
        </Card>
    );
}
