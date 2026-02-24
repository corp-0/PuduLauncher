import {BlogPost} from "../../../pudu/generated";
import {
    AspectRatio, Box,
    Card,
    CardCover,
    Link, Stack,
    Typography
} from "@mui/joy";
import {formatDistance, subDays} from "date-fns";
import {UNITYSTATION_BLOG_URL} from "../../../constants/externalLinks.ts";

export default function SmallBlogPostPreview(props: BlogPost) {
    const {author, imageUrl, slug, createDateTime, summary, title} = props;

    const humanizedDate = () => {
        return formatDistance(
            subDays(new Date(createDateTime!), 3),
            new Date(),
            {addSuffix: true}
        );
    }

    const buildLink = () => {
        return UNITYSTATION_BLOG_URL + slug;
    }

    return (
        <Card variant="plain" sx={{width: 350, bgcolor: "initial", p: 0}}>

            <Box sx={{position: "relative"}}>

                <AspectRatio ratio="4/3">
                    <figure>
                        <img
                            src={imageUrl!}
                            srcSet={imageUrl + " x2"}
                            loading="lazy"
                            alt={title}
                        />
                    </figure>
                </AspectRatio>

                <Box sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    p: 2,
                    zIndex: 1,
                    borderRadius: "sm"
                }}>
                    <Typography level="title-lg" noWrap sx={{color: "#fff"}}>
                        {title}
                    </Typography>
                    <Typography level="body-sm" noWrap>
                        {humanizedDate()} by {author}
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
                            "linear-gradient(180deg, transparent 62%, rgba(0,0,0,0.00345888) 63.94%, rgba(0,0,0,0.014204) 65.89%, rgba(0,0,0,0.0326639) 67.83%, rgba(0,0,0,0.0589645) 69.78%, rgba(0,0,0,0.0927099) 71.72%, rgba(0,0,0,0.132754) 73.67%, rgba(0,0,0,0.177076) 75.61%, rgba(0,0,0,0.222924) 77.56%, rgba(0,0,0,0.267246) 79.5%, rgba(0,0,0,0.30729) 81.44%, rgba(0,0,0,0.341035) 83.39%, rgba(0,0,0,0.367336) 85.33%, rgba(0,0,0,0.385796) 87.28%, rgba(0,0,0,0.396541) 89.22%, rgba(0,0,0,0.4) 91.17%)",
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
                                <Typography level="body-xs">
                                    {summary}
                                </Typography>
                                <Typography level="title-lg" noWrap>
                                    <Link
                                        href={buildLink()}
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