import { Box, Link, Stack, Typography } from "@mui/joy";
import { BlogPost } from "../../../pudu/generated";
import { buildBlogPostUrl, formatBlogPostByline } from "../../../domain/news/blogPostPresentation";
import { openExternalUrl } from "../../../utils/navigation/openExternalUrl";

export default function HeroBlogPost(props: BlogPost) {
    const { imageUrl, summary, title, createDateTime, author, slug } = props;
    const blogPostUrl = buildBlogPostUrl({ slug });
    const byline = formatBlogPostByline({ createDateTime, author });

    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                minHeight: 320,
                maxHeight: 400,
                borderRadius: "lg",
                overflow: "hidden",
                cursor: "pointer",
            }}
            onClick={(event) => void openExternalUrl(event, blogPostUrl)}
        >
            <Box
                component="img"
                src={imageUrl!}
                alt={title}
                sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)",
                }}
            />
            <Stack
                justifyContent="flex-end"
                sx={{
                    position: "relative",
                    height: "100%",
                    p: 4,
                    minHeight: 320,
                }}
            >
                <Stack spacing={1.5} sx={{ maxWidth: 600 }}>
                    <Typography
                        level="h2"
                        sx={{
                            color: "#fff",
                            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        {byline}
                    </Typography>
                    <Typography
                        level="body-md"
                        sx={{
                            color: "rgba(255,255,255,0.85)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {summary}
                    </Typography>
                    <Link
                        href={blogPostUrl}
                        onClick={(event) => void openExternalUrl(event, blogPostUrl)}
                        underline="none"
                        sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "lg" }}
                    >
                        Read more
                    </Link>
                </Stack>
            </Stack>
        </Box>
    );
}
