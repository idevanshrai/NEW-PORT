export interface Project {
    title: string;
    description: string;
    year: string;
    image: string;
    icon: string;
    accentColor: "violet" | "primary" | "pink";
}

export const PROFILE = {
    name: "Devansh Rai",
    role: "Software Developer",
    initials: "DR",
    location: "India", // inferred, adding commonly used field
    email: "idevanshrai@gmail.com", // Placeholder
    hero: {
        title1: "DEVANSH",
        title2: "RAI",
        subtitles: ["A Software Developer", "A CS Student", "A Human"],
        description: "I'm a Software Developer and an open-source enthusiast, currently pursuing Computer Science at VIT and ex-SDE Intern at CeG, India."
    },
    about: {
        quote: "I'm a Computer Science undergrad who's worked across a bunch of tech stacks — from AI projects to web apps. I've dabbled in robotics, video editing, and poster design too. I previously handled social media at CodeDay Lucknow, where I got to blend creativity with community engagement. I enjoy building things that mix tech with design and solve real problems, whether it's through a clever piece of code or a clean user interface. I'm always up for learning something new, especially if it challenges me to think differently or pick up a new tool. For me, tech isn't just about building — it's about experimenting, iterating, and having fun along the way.",
        avatarUrl: "/about-me.jpg",
        stats: [
            { label: "Years Experience", value: "2+", icon: "timer", color: "text-primary" },
            { label: "Projects Shipped", value: "8+", icon: "rocket_launch", color: "text-accent-violet" },
            { label: "Internship", value: "1", icon: "work", color: "text-accent-pink" },
        ]
    },
    socials: [
        { label: "GitHub", url: "https://github.com/idevanshrai" },
        { label: "LinkedIn", url: "https://www.linkedin.com/in/idevanshrai/" },
    ],
    nav: [
        { label: "Projects", href: "#work", color: "primary" },
        { label: "About", href: "#about", color: "accent-pink" },
        { label: "Lab", href: "#lab", color: "accent-violet" },
    ]
};

export const PROJECTS: Project[] = [
    {
        title: "BrimBrowser",
        description: "A modern, lightweight browser for macOS.",
        year: "2024",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQzJJgQeSlAi8mIZzK4a-43t98eOkRQAWYLBmsyP4WXzh1koxHBFdyv_EgAuBr7xkNYWy_s09Gg1EuFt4UH-wzx4RnK9bZU2NXLEC2lnEX8IMy9WY4pCcYJHLPknz8tpfcvL6cF2DWklHo6geCRoK2k4fj4CR6llBb_2JLal9rAsdVHmObA51V75VzmzxbQA3ubA-EBOqYU6iOoMXNhwsM8QwIwwYDXASSe__5jSPlt0GS-O37KV1S-NRwNJEo5TzK0VToYd1qmlI",
        icon: "desktop_mac",
        accentColor: "violet"
    },
    {
        title: "mcp playground",
        description: "Leave Management MCP Server for Claude Desktop.",
        year: "2024",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGQtqgALG6XX3mFc_0XjLaVA1ojcOPQ5Is54CwYC1UwCJYUA0mKbly1ODHsewy5rz4Aw0Ed9iSXJCOtex-e9nJkCIYGJB7Pwji1dnL-AT5xy5GnmtFuIIyEbHcqvkFJzj0Krd0UEnVkJj5S7wKew7OfDmlCGHtfrKVpPHLhwX_UMAGshndJcZmYCJd5fqcAyedjDZPSzeAKNO0rcYsVmUFB-TU44UuQjTTTfFjpCfBS5pDMlGox7PpTxeurnrp60EeKMK8n7yAZlU",
        icon: "terminal",
        accentColor: "primary"
    },
    {
        title: "TaskSlate",
        description: "Notion-inspired collaborative workspace.",
        year: "2023",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbS2ndnfQoCe_WL4PURy8uuqjj1wWLX_WeYajjWiJZLsIg-dYJCkEpn2UCSKDEyfj9RjSD1xRhvywpBtSVwpjxrk4h9F0SNETShLh8jCPLQGES9vhr3srMwgcruXoOo5xR6vYbw4o-Vn5A17z4krHEYCq1ipCHQpuar9xJbEofq7QQ8SUNTvvpb5vqTm0aNKL4Y3ypZDbcThy5NtOLDWcN7dN_owixQTfBsiarQdvB81_QF9MEgp2pZTR-Fvr7-HiDGwW40gmLPkQ",
        icon: "dashboard",
        accentColor: "pink"
    }
];

export const LAB_PROJECTS = [
    {
        title: "Orbital Analysis",
        subtitle: "Flux & Three.js",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqg-n8iwcL2_CFWc8ywP9YdicUazK4U0nUEgZvolqlqcxJBXQohWaUQY5Xu7NX3tBpawuz7djjrhBPkectIHDHnv849inlb5Jh6ZfDXg1SXTd0n49xBIcKFMXZgHVVSbf9M0GiX79FiIYkQeDrujEVkVfZbvc4BBF4Vel4Yieq7dIsjpw5sNNTGUVgyrG4oUucorZGUi_BjStrgYte1XJd79ligd6E8qrDREDov2auHAEhCl8EG7ky4ZCWMx55IeA8dPzA4TvY1O8"
    },
    {
        title: "Moodify",
        subtitle: "Flutter & Spotify API",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxecAMpLHfHwHqQutioJeZ27Xtd84gU89Yyahbdp-H6Z0r5iXRTc3sTEqcgsGAgx6jMszuGqqR7-T7EgO-U2zOiU7H4Z1bbxiaD0LSP0RKRRKZEgy_3vlpmJzU1R7NPZw7jRzPhnn3yeRQnx0CmhQa3-yvDgGQHrlyHyi5ZpTSG1dOj8rIU8js8wKG88ujm_DFSmWvIQ1uoXFn5jMbXsVLh8JJIDY6qjENGFydQ6Hk0_YrPw2ImM6Wb6rSQQdczTJ6UM7I5GgP1KI"
    },
    {
        title: "BANANAN",
        subtitle: "Flutter & Spotify API",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxecAMpLHfHwHqQutioJeZ27Xtd84gU89Yyahbdp-H6Z0r5iXRTc3sTEqcgsGAgx6jMszuGqqR7-T7EgO-U2zOiU7H4Z1bbxiaD0LSP0RKRRKZEgy_3vlpmJzU1R7NPZw7jRzPhnn3yeRQnx0CmhQa3-yvDgGQHrlyHyi5ZpTSG1dOj8rIU8js8wKG88ujm_DFSmWvIQ1uoXFn5jMbXsVLh8JJIDY6qjENGFydQ6Hk0_YrPw2ImM6Wb6rSQQdczTJ6UM7I5GgP1KI"
    },
    {
        title: "Moodify",
        subtitle: "Flutter & Spotify API",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxecAMpLHfHwHqQutioJeZ27Xtd84gU89Yyahbdp-H6Z0r5iXRTc3sTEqcgsGAgx6jMszuGqqR7-T7EgO-U2zOiU7H4Z1bbxiaD0LSP0RKRRKZEgy_3vlpmJzU1R7NPZw7jRzPhnn3yeRQnx0CmhQa3-yvDgGQHrlyHyi5ZpTSG1dOj8rIU8js8wKG88ujm_DFSmWvIQ1uoXFn5jMbXsVLh8JJIDY6qjENGFydQ6Hk0_YrPw2ImM6Wb6rSQQdczTJ6UM7I5GgP1KI"
    },
    {
        title: "Moodify",
        subtitle: "Flutter & Spotify API",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxecAMpLHfHwHqQutioJeZ27Xtd84gU89Yyahbdp-H6Z0r5iXRTc3sTEqcgsGAgx6jMszuGqqR7-T7EgO-U2zOiU7H4Z1bbxiaD0LSP0RKRRKZEgy_3vlpmJzU1R7NPZw7jRzPhnn3yeRQnx0CmhQa3-yvDgGQHrlyHyi5ZpTSG1dOj8rIU8js8wKG88ujm_DFSmWvIQ1uoXFn5jMbXsVLh8JJIDY6qjENGFydQ6Hk0_YrPw2ImM6Wb6rSQQdczTJ6UM7I5GgP1KI"
    },
    {
        title: "ExpenseTracker",
        subtitle: "Python & SQLite",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNFQrLIaDZMWp4dd4EjA98hmdNge03stokRt4Bf3lIrgprLAUN2__mAfZJg_v6u0kIW1pTRvE_GWn0lEWhtZBG9Wz1jsCBAJwJYjbxng_aAxrwIH7AQnxCHUV5Y4_qd5v-pdZhT6QMA6QuP6kTAlwfNAGyoKPyVxWXHejNiA20k1EmmeOP03rHgLuzueXWWL2NMTIzNwefGetvn1l8Bi0Cyu0W1WwrJv3RV6XDpSu8FZw_aUmsQ2kxH1frOsu-4uA1jHtz0KZ7QTQ"
    }
];

export const EXPERIENCE = {
    education: [
        {
            title: "B.Tech Computer Science",
            organization: "Vellore Institute of Technology",
            period: "2023 - 2027",
            description: "I'm a senior year student currently pursuing a Bachelor in Computer Science at VIT with a specialization in Artificial Intelligence and Machine Learning. I am passionate about programming, robot building, and mentoring, thriving in both collaborative and independent environments.",
            color: "text-primary"
        },
        {
            title: "Indian School Certificate(ISC)",
            organization: "City Montessori Inter College",
            period: "2021 - 2023",
            description: "From 2021 to 2023, I had the privilege of being deeply involved in various leadership and organizational roles at City Montessori School, Lucknow, India. Positions Held: Student Government, Robotics Club.",
            color: "text-primary"
        },
        {
            title: "Indian Certificate of Secondary Education(ICSE)",
            organization: "City Montessori Inter College",
            period: "2019 - 2021",
            description: "During the 2019-2020 academic period at City Montessori School, Lucknow, India, I engaged in a diverse range of activities that contributed significantly to my personal and academic growth.",
            color: "text-primary"
        }
    ],
    professional: [
        {
            title: "Software Development Intern",
            organization: "Center for eGovernance",
            period: "May 2025 - June 2024",
            description: "As part of my internship at the Centre for e-Governance (CeG), I worked on the AI Pragya project, developing and improving digital tools for AI outreach, training, and feedback within government systems.",
            color: "text-primary"
        },
        {
            title: "Social Media Co-ordinator & Volunteer",
            organization: "CodeDay Lucknow",
            period: "2024",
            description: "Organized CodeDay Hackathon in Lucknow (1500+ Participants). Workshops on learning python, Arduino hardware & Machine Learning model. Monitored online presence of CodeDay to engage with new students and answered queries.",
            color: "text-primary"
        }
    ]
};
