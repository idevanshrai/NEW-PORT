import { useEffect, useState } from 'react';

interface ContributionDay {
    date: string;
    contributionCount: number;
    color: string;
}

interface GitHubStats {
    totalCommits: number;
    totalRepos: number;
    totalStars: number;
    totalPRs: number;
}

interface GitHubEvent {
    id: string;
    type: string;
    repo: { name: string };
    created_at: string;
}

export const GitHubActivity = () => {
    const [contributions, setContributions] = useState<ContributionDay[]>([]);
    const [stats, setStats] = useState<GitHubStats>({ totalCommits: 0, totalRepos: 0, totalStars: 0, totalPRs: 0 });
    const [recentActivity, setRecentActivity] = useState<GitHubEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGitHubData = async () => {
            const token = import.meta.env.VITE_GITHUB_TOKEN;
            const username = 'idevanshrai';

            if (!token) {
                console.warn('GitHub Token not found. Using mock data.');
                setContributions(Array.from({ length: 140 }).map((_, i) => ({
                    date: new Date(Date.now() - (139 - i) * 86400000).toISOString().split('T')[0],
                    contributionCount: Math.random() > 0.7 ? Math.floor(Math.random() * 8) : 0,
                    color: ''
                })));
                setStats({
                    totalCommits: 452,
                    totalRepos: 45,
                    totalStars: 12,
                    totalPRs: 28
                });
                setRecentActivity([
                    { id: '1', type: 'PushEvent', repo: { name: 'idevanshrai/portfolio' }, created_at: new Date().toISOString() },
                    { id: '2', type: 'PullRequestEvent', repo: { name: 'idevanshrai/nextjs-starter' }, created_at: new Date(Date.now() - 86400000).toISOString() },
                    { id: '3', type: 'CreateEvent', repo: { name: 'idevanshrai/learning-rust' }, created_at: new Date(Date.now() - 172800000).toISOString() }
                ]);
                setLoading(false);
                return;
            }

            try {
                // GraphQL Query
                const query = `
                    query($userName:String!) {
                        user(login: $userName) {
                            contributionsCollection {
                                contributionCalendar {
                                    totalContributions
                                    weeks {
                                        contributionDays {
                                            contributionCount
                                            date
                                            color
                                        }
                                    }
                                }
                                totalCommitContributions
                                totalPullRequestContributions
                                totalRepositoryContributions
                            }
                            repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
                                totalCount
                                nodes {
                                    stargazerCount
                                }
                            }
                        }
                    }
                `;

                const graphQLResponse = await fetch('https://api.github.com/graphql', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query, variables: { userName: username } }),
                });

                const graphQLData = await graphQLResponse.json();
                const user = graphQLData.data?.user;

                if (user) {
                    // Process Contributions
                    const weeks = user.contributionsCollection.contributionCalendar.weeks;
                    const days: ContributionDay[] = [];
                    weeks.forEach((week: { contributionDays: ContributionDay[] }) => {
                        week.contributionDays.forEach((day: ContributionDay) => {
                            days.push(day);
                        });
                    });
                    // Take last ~140 days (approx 20 weeks) for a nice layout
                    setContributions(days.slice(-140));

                    // Process Stats
                    const totalStars = user.repositories.nodes.reduce((acc: number, repo: { stargazerCount: number }) => acc + repo.stargazerCount, 0);

                    setStats({
                        totalCommits: user.contributionsCollection.totalCommitContributions,
                        totalRepos: user.repositories.totalCount,
                        totalStars: totalStars,
                        totalPRs: user.contributionsCollection.totalPullRequestContributions,
                    });
                }

                // REST API for Recent Activity
                const restResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=5`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const events = await restResponse.json();
                if (Array.isArray(events)) {
                    setRecentActivity(events);
                }

            } catch (error) {
                console.error("Failed to fetch GitHub data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubData();
    }, []);

    // Color scale helper
    const getThemeColor = (count: number) => {
        if (count === 0) return 'bg-white/5 border border-white/5';
        if (count <= 3) return 'bg-primary/40 border border-primary/20';
        if (count <= 6) return 'bg-primary/70 border border-primary/50';
        return 'bg-primary shadow-[0_0_10px_rgba(170,255,0,0.5)] border border-primary';
    };

    return (
        <section className="px-4 py-8 md:py-20 md:px-20 max-w-[1400px] mx-auto w-full" id="github">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 tracking-tighter mb-12">
                My GitHub Activity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 1. Contribution Graph */}
                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/20">
                    <h3 className="text-xl font-bold mb-6 text-white/90">Contribution Graph</h3>
                    <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                        {loading ? (
                            <div className="text-white/30 animate-pulse">Loading heatmap...</div>
                        ) : (
                            contributions.map((day) => (
                                <div
                                    key={day.date}
                                    title={`${day.contributionCount} contributions on ${day.date}`}
                                    className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm transition-all duration-300 hover:scale-125 ${getThemeColor(day.contributionCount)}`}
                                />
                            ))
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider font-mono mb-1">This Month</p>
                            <p className="text-2xl font-black text-white">
                                {contributions
                                    .filter(day => new Date(day.date).getMonth() === new Date().getMonth() && new Date(day.date).getFullYear() === new Date().getFullYear())
                                    .reduce((acc, day) => acc + day.contributionCount, 0)}
                            </p>
                        </div>
                        <a
                            href="https://github.com/idevanshrai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-primary hover:text-white transition-colors flex items-center gap-1"
                        >
                            View Profile <span className="material-symbols-outlined text-sm">arrow_outward</span>
                        </a>
                    </div>
                </div>

                {/* 2. Stats */}
                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/20">
                    <h3 className="text-xl font-bold mb-6 text-white/90">GitHub Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatBox label="Commits (2025)" value={stats.totalCommits} icon="commit" color="text-accent-pink" />
                        <StatBox label="Public Repos" value={stats.totalRepos} icon="folder_open" color="text-accent-violet" />
                        <StatBox label="Stars Earned" value={stats.totalStars} icon="star" color="text-yellow-400" />
                        <StatBox label="Pull Requests" value={stats.totalPRs} icon="merge_type" color="text-primary" />
                    </div>
                </div>

                {/* 3. Recent Activity */}
                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-black/20">
                    <h3 className="text-xl font-bold mb-6 text-white/90">Recent Activity</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-white/30 animate-pulse">Loading activity...</div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-white/30">No recent public activity.</div>
                        ) : (
                            recentActivity.map(event => (
                                <div key={event.id} className="flex items-start gap-3 text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                    <span className="material-symbols-outlined text-white/40 text-lg mt-0.5">
                                        {event.type === 'PushEvent' ? 'arrow_upward' :
                                            event.type === 'CreateEvent' ? 'add_circle' :
                                                event.type === 'PullRequestEvent' ? 'merge' : 'history'}
                                    </span>
                                    <div>
                                        <p className="text-white/80">
                                            {event.type.replace('Event', '')} on <span className="text-primary">{event.repo.name.split('/')[1]}</span>
                                        </p>
                                        <p className="text-white/30 text-xs mt-1">
                                            {new Date(event.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

const StatBox = ({ label, value, icon, color }: { label: string, value: number, icon: string, color: string }) => (
    <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-white/5 hover:border-white/10 transition-colors">
        <span className={`material-symbols-outlined text-2xl mb-2 ${color}`}>{icon}</span>
        <span className="text-2xl font-black text-white">{value}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/40 mt-1">{label}</span>
    </div>
);
