import { Box, Card, CardContent, CardOverflow, Link, Stack, Typography } from "@mui/joy";
import { BlogPost } from "../../../pudu/generated";
import { buildBlogPostUrl, formatBlogPostByline } from "../../../domain/news/blogPostPresentation";
import { openExternalUrl } from "../../../utils/navigation/openExternalUrl";

export default function FeaturedBlogPostPreview(props: BlogPost) {
    const { author, imageUrl, slug, createDateTime, summary, title } = props;
    const blogPostUrl = buildBlogPostUrl({ slug });
    const byline = formatBlogPostByline({ createDateTime, author });

    return (
        <Card
            orientation="horizontal"
            variant="outlined"
            sx={{
                height: "100%",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                    boxShadow: "md",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <CardOverflow sx={{ flex: "0 0 45%" }}>
                <Box
                    component="img"
                    src={imageUrl!}
                    loading="lazy"
                    alt={title}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        minHeight: 200,
                    }}
                />
            </CardOverflow>
            <CardContent>
                <Stack spacing={1} justifyContent="center" sx={{ height: "100%" }}>
                    <Typography level="title-lg">{title}</Typography>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        {byline}
                    </Typography>
                    <Typography
                        level="body-sm"
                        sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {summary}
                    </Typography>
                    <Link
                        href={blogPostUrl}
                        onClick={(event) => void openExternalUrl(event, blogPostUrl)}
                        overlay
                        underline="none"
                        level="body-sm"
                        sx={{ fontWeight: "lg" }}
                    >
                        Read more
                    </Link>
                </Stack>
            </CardContent>
        </Card>
    );
}
