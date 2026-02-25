import { BlogPost } from "../../../pudu/generated";
import {
    AspectRatio, Box,
    Card,
    CardCover,
    Link, Stack,
    Typography
} from "@mui/joy";
import { buildBlogPostUrl, formatBlogPostByline } from "../../../domain/news/blogPostPresentation";
import { openExternalUrl } from "../../../utils/navigation/openExternalUrl";

export default function SmallBlogPostPreview(props: BlogPost) {
    const { author, imageUrl, slug, createDateTime, summary, title } = props;
    const blogPostUrl = buildBlogPostUrl({ slug });
    const byline = formatBlogPostByline({ createDateTime, author });

    return (
        <Card variant="plain" sx={{ width: "100%", maxWidth: 400, bgcolor: "initial", p: 0 }}>

            <Box sx={{ position: "relative" }}>

                <AspectRatio ratio="4/3">
                    <figure>
                        <img
                            src={imageUrl!}
                            srcSet={imageUrl + " 2x"}
                            loading="lazy"
                            alt={title}
                        />
                    </figure>
                </AspectRatio>

                <Box sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    zIndex: 1,
                    borderRadius: "sm",
                    minWidth: 0,
                }}>
                    <Typography
                        level="title-lg"
                        noWrap
                        sx={{
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography level="body-sm" noWrap sx={{ color: "primary.50" }}>
                        {byline}
                    </Typography>
                </Box>
                <CardCover
                    className="gradient-cover"
                    sx={{
                        "&:hover, &:focus-within": {
                            opacity: 1,
                        },
                        opacity: 0,
                        transition: "0.1s ease-in",
                        background:
                            "linear-gradient(180deg, transparent 80%, rgba(0,0,0,0.00345888) 70%, rgba(0,0,0,0.014204) 65.89%, rgba(0,0,0,0.0326639) 67.83%, rgba(0,0,0,0.0589645) 69.78%, rgba(0,0,0,0.0927099) 71.72%, rgba(0,0,0,0.132754) 73.67%, rgba(0,0,0,0.177076) 75.61%, rgba(0,0,0,0.222924) 77.56%, rgba(0,0,0,0.267246) 79.5%, rgba(0,0,0,0.30729) 81.44%, rgba(0,0,0,0.341035) 83.39%, rgba(0,0,0,0.367336) 85.33%, rgba(0,0,0,0.385796) 87.28%, rgba(0,0,0,0.396541) 89.22%, rgba(0,0,0,0.4) 91.17%)",
                    }}
                >
                    <div>
                        <Box
                            sx={{
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                flexGrow: 1,
                                alignSelf: "flex-end",
                                backgroundColor: "rgba(0,0,0,0.5)",
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography
                                    level="body-xs"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: "vertical",
                                        color: "primary.50"
                                    }}
                                >
                                    {summary}
                                </Typography>
                                <Typography level="title-lg" noWrap>
                                    <Link
                                        href={blogPostUrl}
                                        onClick={(event) => void openExternalUrl(event, blogPostUrl)}
                                        overlay
                                        underline="none"
                                        sx={{
                                            color: "#fff",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            display: "block",
                                        }}
                                    >
                                        Read more...
                                    </Link>
                                </Typography>
                            </Stack>
                        </Box>
                    </div>
                </CardCover>
            </Box>
        </Card>
    );
}
