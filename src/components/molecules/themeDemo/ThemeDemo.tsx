import {
    Accordion,
    AccordionDetails,
    AccordionGroup,
    AccordionSummary,
    Alert,
    AspectRatio,
    Avatar,
    AvatarGroup,
    Badge,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    CardOverflow,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    FormLabel,
    IconButton,
    Input,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator,
    Option,
    Radio,
    RadioGroup,
    Select,
    Sheet,
    Slider,
    Snackbar,
    Stack,
    Switch,
    Tab,
    TabList,
    TabPanel,
    Table,
    Tabs,
    Textarea,
    Tooltip,
    Typography,
} from "@mui/joy";
import { useState } from "react";
import Section from "./ThemeDemoSection";

export default function ThemeDemo() {
    const [switchChecked, setSwitchChecked] = useState(true);
    const [sliderValue, setSliderValue] = useState(40);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);


    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
            <Typography level="h1" sx={{ mb: 1 }}>
                Pudu Theme Showcase
            </Typography>
            <Typography level="body-md" sx={{ mb: 4, color: "text.secondary" }}>
                A warm, cozy dark theme inspired by the adorable pudu deer.
            </Typography>

            {/* Typography */}
            <Section title="Typography">
                <Stack spacing={1}>
                    <Typography level="h1">Heading 1</Typography>
                    <Typography level="h2">Heading 2</Typography>
                    <Typography level="h3">Heading 3</Typography>
                    <Typography level="h4">Heading 4</Typography>
                    <Typography level="title-lg">Title Large</Typography>
                    <Typography level="title-md">Title Medium</Typography>
                    <Typography level="title-sm">Title Small</Typography>
                    <Typography level="body-lg">Body Large</Typography>
                    <Typography level="body-md">Body Medium — The pudu is the world's smallest deer.</Typography>
                    <Typography level="body-sm">Body Small — Native to South American temperate rainforests.</Typography>
                    <Typography level="body-xs">Body Extra Small — They stand only 32–44 cm tall.</Typography>
                </Stack>
            </Section>

            {/* Buttons */}
            <Section title="Buttons">
                <Stack spacing={2}>
                    <Typography level="title-sm">Solid</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button color="primary">Primary</Button>
                        <Button color="neutral">Neutral</Button>
                        <Button color="danger">Danger</Button>
                        <Button color="success">Success</Button>
                        <Button color="warning">Warning</Button>
                    </Stack>
                    <Typography level="title-sm">Soft</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button variant="soft" color="primary">Primary</Button>
                        <Button variant="soft" color="neutral">Neutral</Button>
                        <Button variant="soft" color="danger">Danger</Button>
                        <Button variant="soft" color="success">Success</Button>
                        <Button variant="soft" color="warning">Warning</Button>
                    </Stack>
                    <Typography level="title-sm">Outlined</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button variant="outlined" color="primary">Primary</Button>
                        <Button variant="outlined" color="neutral">Neutral</Button>
                        <Button variant="outlined" color="danger">Danger</Button>
                        <Button variant="outlined" color="success">Success</Button>
                        <Button variant="outlined" color="warning">Warning</Button>
                    </Stack>
                    <Typography level="title-sm">Plain</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button variant="plain" color="primary">Primary</Button>
                        <Button variant="plain" color="neutral">Neutral</Button>
                        <Button variant="plain" color="danger">Danger</Button>
                        <Button variant="plain" color="success">Success</Button>
                        <Button variant="plain" color="warning">Warning</Button>
                    </Stack>
                    <Typography level="title-sm">Sizes & States</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                        <Button disabled>Disabled</Button>
                        <Button loading>Loading</Button>
                    </Stack>
                </Stack>
            </Section>

            {/* Icon Buttons */}
            <Section title="Icon Buttons">
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <IconButton variant="solid" color="primary">P</IconButton>
                    <IconButton variant="soft" color="success">S</IconButton>
                    <IconButton variant="outlined" color="warning">W</IconButton>
                    <IconButton variant="plain" color="danger">D</IconButton>
                    <IconButton variant="solid" color="neutral">N</IconButton>
                </Stack>
            </Section>

            {/* Form Controls */}
            <Section title="Form Controls">
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <FormControl sx={{ minWidth: 200 }}>
                            <FormLabel>Name</FormLabel>
                            <Input placeholder="Little Pudu" />
                        </FormControl>
                        <FormControl sx={{ minWidth: 200 }}>
                            <FormLabel>Email</FormLabel>
                            <Input placeholder="pudu@forest.cl" variant="soft" />
                        </FormControl>
                        <FormControl sx={{ minWidth: 200 }}>
                            <FormLabel>Disabled</FormLabel>
                            <Input placeholder="Disabled" disabled />
                        </FormControl>
                    </Stack>
                    <FormControl>
                        <FormLabel>Message</FormLabel>
                        <Textarea placeholder="Write something nice about pudus..." minRows={2} />
                    </FormControl>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <FormControl sx={{ minWidth: 200 }}>
                            <FormLabel>Habitat</FormLabel>
                            <Select defaultValue="forest" placeholder="Select habitat">
                                <Option value="forest">Temperate Forest</Option>
                                <Option value="bamboo">Bamboo Thickets</Option>
                                <Option value="shrub">Shrubland</Option>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 200 }}>
                            <FormLabel>Variant: Soft</FormLabel>
                            <Select variant="soft" defaultValue="1" placeholder="Choose...">
                                <Option value="1">Option One</Option>
                                <Option value="2">Option Two</Option>
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            </Section>

            {/* Checkboxes, Radios, Switches */}
            <Section title="Checkboxes, Radios & Switches">
                <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                    <Stack spacing={1}>
                        <Typography level="title-sm">Checkboxes</Typography>
                        <Checkbox label="Cute" defaultChecked color="primary" />
                        <Checkbox label="Tiny" defaultChecked color="success" />
                        <Checkbox label="Fluffy" color="warning" />
                        <Checkbox label="Disabled" disabled />
                    </Stack>
                    <Stack spacing={1}>
                        <Typography level="title-sm">Radio Group</Typography>
                        <RadioGroup defaultValue="pudu">
                            <Radio value="pudu" label="Southern Pudu" color="primary" />
                            <Radio value="northern" label="Northern Pudu" color="primary" />
                            <Radio value="other" label="Not a pudu" color="danger" />
                        </RadioGroup>
                    </Stack>
                    <Stack spacing={2}>
                        <Typography level="title-sm">Switches</Typography>
                        <Switch
                            checked={switchChecked}
                            onChange={(e) => setSwitchChecked(e.target.checked)}
                            color={switchChecked ? "success" : "neutral"}
                        />
                        <Switch defaultChecked color="primary" />
                        <Switch color="warning" />
                        <Switch disabled />
                    </Stack>
                </Stack>
            </Section>

            {/* Slider */}
            <Section title="Slider">
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                    <Typography level="body-sm">Cuteness Level: {sliderValue}%</Typography>
                    <Slider
                        value={sliderValue}
                        onChange={(_e, v) => setSliderValue(v as number)}
                        color="primary"
                    />
                    <Slider defaultValue={70} color="success" />
                    <Slider defaultValue={30} color="warning" disabled />
                </Stack>
            </Section>

            {/* Chips */}
            <Section title="Chips">
                <Stack spacing={1}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip color="primary">Primary</Chip>
                        <Chip color="neutral">Neutral</Chip>
                        <Chip color="danger">Danger</Chip>
                        <Chip color="success">Success</Chip>
                        <Chip color="warning">Warning</Chip>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip variant="soft" color="primary">Soft Primary</Chip>
                        <Chip variant="soft" color="success">Soft Success</Chip>
                        <Chip variant="outlined" color="warning">Outlined</Chip>
                        <Chip variant="outlined" color="danger">Outlined</Chip>
                    </Stack>
                </Stack>
            </Section>

            {/* Badges & Avatars */}
            <Section title="Badges & Avatars">
                <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Badge badgeContent={3} color="danger">
                        <Avatar>PU</Avatar>
                    </Badge>
                    <Badge badgeContent="!" color="warning">
                        <Avatar color="primary">DU</Avatar>
                    </Badge>
                    <Badge badgeContent={99} color="success">
                        <Avatar variant="soft" color="success">OK</Avatar>
                    </Badge>
                    <AvatarGroup>
                        <Avatar>A</Avatar>
                        <Avatar color="primary">B</Avatar>
                        <Avatar color="success">C</Avatar>
                        <Avatar>+2</Avatar>
                    </AvatarGroup>
                </Stack>
            </Section>

            {/* Alerts */}
            <Section title="Alerts">
                <Stack spacing={1.5}>
                    <Alert color="primary">This is a primary alert — pudu spotted nearby!</Alert>
                    <Alert color="neutral">Neutral alert — nothing unusual in the forest.</Alert>
                    <Alert color="success">Success — the pudu population is growing!</Alert>
                    <Alert color="warning">Warning — habitat fragmentation detected.</Alert>
                    <Alert color="danger">Danger — poachers reported in the area.</Alert>
                    <Alert variant="soft" color="primary" invertedColors>Soft variant — a gentle reminder about pudus.</Alert>
                    <Alert variant="outlined" color="success" invertedColors>Outlined variant — conservation efforts are working.</Alert>
                </Stack>
            </Section>

            {/* Cards */}
            <Section title="Cards">
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Card variant="outlined" sx={{ minWidth: 250, flex: 1 }}>
                        <CardContent>
                            <Typography level="title-lg">Southern Pudu</Typography>
                            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                                Pudu puda — found in Chile and Argentina. The smallest deer in the world,
                                standing at just 35–45 cm tall.
                            </Typography>
                        </CardContent>
                        <CardOverflow variant="soft" sx={{ p: 1.5 }}>
                            <Typography level="body-xs">Status: Near Threatened</Typography>
                        </CardOverflow>
                    </Card>
                    <Card variant="soft" color="primary" invertedColors sx={{ minWidth: 250, flex: 1 }}>
                        <CardContent>
                            <Typography level="title-lg">Northern Pudu</Typography>
                            <Typography level="body-sm">
                                Pudu mephistophiles — found in Colombia, Ecuador, and Peru.
                                Even smaller than its southern cousin.
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card variant="solid" color="success" invertedColors sx={{ minWidth: 250, flex: 1 }}>
                        <CardContent>
                            <Typography level="title-lg">Conservation</Typography>
                            <Typography level="body-sm">
                                Protected areas and breeding programs help ensure the survival
                                of these adorable creatures.
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Section>

            {/* Sheets */}
            <Section title="Sheets">
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: "sm", flex: 1, minWidth: 180 }}>
                        <Typography level="title-sm">Outlined Sheet</Typography>
                        <Typography level="body-sm">A container with border</Typography>
                    </Sheet>
                    <Sheet variant="soft" invertedColors sx={{ p: 2, borderRadius: "sm", flex: 1, minWidth: 180 }}>
                        <Typography level="title-sm">Soft Sheet</Typography>
                        <Typography level="body-sm">A tinted container</Typography>
                    </Sheet>
                    <Sheet variant="solid" color="primary" invertedColors sx={{ p: 2, borderRadius: "sm", flex: 1, minWidth: 180 }}>
                        <Typography level="title-sm">Solid Primary</Typography>
                        <Typography level="body-sm">Bold and warm</Typography>
                    </Sheet>
                </Stack>
            </Section>

            {/* Tabs */}
            <Section title="Tabs">
                <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v as number)}>
                    <TabList>
                        <Tab>Overview</Tab>
                        <Tab>Habitat</Tab>
                        <Tab>Diet</Tab>
                    </TabList>
                    <TabPanel value={0}>
                        <Typography level="body-md">
                            Pudus are the world's smallest deer, known for their shy nature and adorable appearance.
                        </Typography>
                    </TabPanel>
                    <TabPanel value={1}>
                        <Typography level="body-md">
                            They live in dense temperate rainforests of South America, favoring thick undergrowth.
                        </Typography>
                    </TabPanel>
                    <TabPanel value={2}>
                        <Typography level="body-md">
                            Pudus eat leaves, bark, seeds, and fallen fruit. They can stand on hind legs to reach branches.
                        </Typography>
                    </TabPanel>
                </Tabs>
            </Section>

            {/* Accordion */}
            <Section title="Accordion">
                <AccordionGroup>
                    <Accordion>
                        <AccordionSummary>What is a pudu?</AccordionSummary>
                        <AccordionDetails>
                            The pudu is a genus of South American deer. Two species are known: the northern pudu
                            and the southern pudu. They are the world's smallest deer.
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>How big do they get?</AccordionSummary>
                        <AccordionDetails>
                            Southern pudus stand 35–45 cm at the shoulder and weigh 6.4–13.4 kg.
                            Northern pudus are even smaller.
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary>Are they endangered?</AccordionSummary>
                        <AccordionDetails>
                            The southern pudu is classified as Near Threatened, while the northern pudu
                            is Vulnerable due to habitat loss and hunting.
                        </AccordionDetails>
                    </Accordion>
                </AccordionGroup>
            </Section>

            {/* Table */}
            <Section title="Table">
                <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "auto" }}>
                    <Table stripe="even" hoverRow>
                        <thead>
                            <tr>
                                <th>Species</th>
                                <th>Region</th>
                                <th>Height</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Southern Pudu</td>
                                <td>Chile, Argentina</td>
                                <td>35–45 cm</td>
                                <td><Chip size="sm" color="warning">Near Threatened</Chip></td>
                            </tr>
                            <tr>
                                <td>Northern Pudu</td>
                                <td>Colombia, Ecuador, Peru</td>
                                <td>32–35 cm</td>
                                <td><Chip size="sm" color="danger">Vulnerable</Chip></td>
                            </tr>
                            <tr>
                                <td>White-tailed Deer</td>
                                <td>Americas</td>
                                <td>53–120 cm</td>
                                <td><Chip size="sm" color="success">Least Concern</Chip></td>
                            </tr>
                            <tr>
                                <td>Moose</td>
                                <td>North America, Europe</td>
                                <td>140–210 cm</td>
                                <td><Chip size="sm" color="success">Least Concern</Chip></td>
                            </tr>
                        </tbody>
                    </Table>
                </Sheet>
            </Section>

            {/* List */}
            <Section title="List">
                <Sheet variant="outlined" sx={{ borderRadius: "sm", maxWidth: 350 }}>
                    <List>
                        <ListItem>
                            <ListItemButton>
                                <ListItemDecorator>
                                    <Avatar size="sm" color="primary">F</Avatar>
                                </ListItemDecorator>
                                <ListItemContent>
                                    <Typography level="title-sm">Forest Walk</Typography>
                                    <Typography level="body-xs">Explore pudu habitats</Typography>
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton selected>
                                <ListItemDecorator>
                                    <Avatar size="sm" color="success">C</Avatar>
                                </ListItemDecorator>
                                <ListItemContent>
                                    <Typography level="title-sm">Conservation</Typography>
                                    <Typography level="body-xs">Join the effort</Typography>
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton>
                                <ListItemDecorator>
                                    <Avatar size="sm" color="warning">P</Avatar>
                                </ListItemDecorator>
                                <ListItemContent>
                                    <Typography level="title-sm">Photo Gallery</Typography>
                                    <Typography level="body-xs">Adorable pudu pics</Typography>
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Sheet>
            </Section>

            {/* Breadcrumbs & Links */}
            <Section title="Breadcrumbs & Links">
                <Breadcrumbs>
                    <Link color="neutral" href="#">Home</Link>
                    <Link color="neutral" href="#">Animals</Link>
                    <Link color="primary" href="#">Cervidae</Link>
                    <Typography>Pudu</Typography>
                </Breadcrumbs>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Link href="#" color="primary">Primary Link</Link>
                    <Link href="#" color="neutral">Neutral Link</Link>
                    <Link href="#" color="danger">Danger Link</Link>
                </Stack>
            </Section>

            {/* Progress */}
            <Section title="Progress">
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                    <Typography level="body-sm">Circular</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <CircularProgress size="sm" />
                        <CircularProgress size="md" color="success" />
                        <CircularProgress size="lg" color="warning" />
                        <CircularProgress determinate value={75} color="primary" />
                        <CircularProgress determinate value={100} color="success" />
                    </Stack>
                    <Typography level="body-sm">Linear</Typography>
                    <LinearProgress color="primary" />
                    <LinearProgress determinate value={60} color="success" />
                    <LinearProgress determinate value={30} color="warning" />
                    <LinearProgress determinate value={85} color="danger" />
                </Stack>
            </Section>

            {/* Tooltips */}
            <Section title="Tooltips">
                <Stack direction="row" spacing={2}>
                    <Tooltip title="I'm a pudu!" arrow>
                        <Button variant="soft">Hover me</Button>
                    </Tooltip>
                    <Tooltip title="Warm and cozy" variant="solid" arrow>
                        <Button variant="outlined">Solid tooltip</Button>
                    </Tooltip>
                </Stack>
            </Section>

            {/* AspectRatio */}
            <Section title="Aspect Ratio">
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Card variant="outlined" sx={{ width: 200 }}>
                        <CardOverflow>
                            <AspectRatio ratio="16/9">
                                <Box sx={{ bgcolor: "primary.softBg", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography level="h2" sx={{ color: "primary.softColor" }}>16:9</Typography>
                                </Box>
                            </AspectRatio>
                        </CardOverflow>
                        <CardContent>
                            <Typography level="body-sm">Widescreen placeholder</Typography>
                        </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ width: 150 }}>
                        <CardOverflow>
                            <AspectRatio ratio="1">
                                <Box sx={{ bgcolor: "success.softBg", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography level="h2" sx={{ color: "success.softColor" }}>1:1</Typography>
                                </Box>
                            </AspectRatio>
                        </CardOverflow>
                        <CardContent>
                            <Typography level="body-sm">Square</Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Section>

            {/* Snackbar */}
            <Section title="Snackbar">
                <Button onClick={() => setSnackbarOpen(true)} color="primary">
                    Show Snackbar
                </Button>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    color="success"
                    variant="soft"
                >
                    A wild pudu appeared!
                </Snackbar>
            </Section>

            {/* Dividers */}
            <Section title="Dividers">
                <Stack spacing={2}>
                    <Divider />
                    <Stack direction="row" spacing={2} alignItems="center" divider={<Divider orientation="vertical" />} sx={{ height: 40 }}>
                        <Typography>Section A</Typography>
                        <Typography>Section B</Typography>
                        <Typography>Section C</Typography>
                    </Stack>
                    <Divider>with text</Divider>
                </Stack>
            </Section>

            {/* Color Palette Swatches */}
            <Section title="Color Palette">
                <Stack spacing={2}>
                    {(["primary", "neutral", "danger", "success", "warning"] as const).map((color) => (
                        <Stack key={color} spacing={0.5}>
                            <Typography level="title-sm" sx={{ textTransform: "capitalize" }}>{color}</Typography>
                            <Stack direction="row" spacing={0.5}>
                                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                                    <Tooltip key={shade} title={`${color}.${shade}`} arrow>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "sm",
                                                bgcolor: `${color}.${shade}`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                level="body-xs"
                                                sx={{ color: shade >= 500 ? "#fff" : "#000", fontSize: 9 }}
                                            >
                                                {shade}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            </Section>

            <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    Made with warmth for the world's smallest deer.
                </Typography>
            </Box>
        </Box>
    )
}