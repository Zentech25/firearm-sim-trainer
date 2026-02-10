import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair, Target, Trophy, Medal, Users, Activity,
  Play, Settings, LogOut, ChevronRight, Flame, Zap,
  Star, TrendingUp, Clock, MapPin, Shield, Eye, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const TOP_PERFORMERS = [
  { rank: 1, name: "SGT. Marcus Cole", section: "Alpha", accuracy: 97.2, score: 9850, streak: 12, avatar: "MC" },
  { rank: 2, name: "CPL. Sarah Jin", section: "Bravo", accuracy: 95.8, score: 9420, streak: 8, avatar: "SJ" },
  { rank: 3, name: "PVT. Alex Reyes", section: "Alpha", accuracy: 94.1, score: 9100, streak: 15, avatar: "AR" },
  { rank: 4, name: "SGT. Dmitri Volkov", section: "Charlie", accuracy: 93.5, score: 8870, streak: 6, avatar: "DV" },
  { rank: 5, name: "CPL. Nadia Osei", section: "Delta", accuracy: 92.9, score: 8650, streak: 10, avatar: "NO" },
];

const SECTIONS = [
  { name: "Alpha", avgScore: 9320, members: 12, accuracy: 95.1, sessions: 48, trend: +3.2 },
  { name: "Bravo", avgScore: 8950, members: 10, accuracy: 92.4, sessions: 42, trend: +1.8 },
  { name: "Charlie", avgScore: 8710, members: 11, accuracy: 90.8, sessions: 45, trend: -0.5 },
  { name: "Delta", avgScore: 8400, members: 9, accuracy: 89.2, sessions: 38, trend: +2.1 },
];

const SCENARIOS = [
  { id: 1, name: "Urban CQB", difficulty: "Hard", env: "Urban", duration: "15 min", icon: MapPin },
  { id: 2, name: "Long Range Precision", difficulty: "Expert", env: "Open Field", duration: "20 min", icon: Target },
  { id: 3, name: "Night Operations", difficulty: "Hard", env: "Night Urban", duration: "12 min", icon: Eye },
  { id: 4, name: "Defensive Position", difficulty: "Medium", env: "Compound", duration: "18 min", icon: Shield },
];

const RECENT_SESSIONS = [
  { id: 1, scenario: "Urban CQB", trainee: "SGT. Cole", score: 9200, accuracy: 96.1, time: "2 min ago" },
  { id: 2, scenario: "Long Range", trainee: "CPL. Jin", score: 8800, accuracy: 94.3, time: "15 min ago" },
  { id: 3, scenario: "Night Ops", trainee: "PVT. Reyes", score: 9100, accuracy: 95.0, time: "32 min ago" },
];

const rankColors = ["text-primary", "text-muted-foreground", "text-accent"];

const difficultyColor = (d: string) => {
  switch (d) {
    case "Medium": return "border-primary/40 text-primary";
    case "Hard": return "border-accent/40 text-accent";
    case "Expert": return "border-destructive/40 text-destructive";
    default: return "border-muted-foreground/40 text-muted-foreground";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [hoveredPerformer, setHoveredPerformer] = useState<number | null>(null);

  const bestSection = SECTIONS[0];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(800px circle at 30% 20%, hsl(var(--primary) / 0.04), transparent 60%)",
            "radial-gradient(800px circle at 70% 80%, hsl(var(--primary) / 0.06), transparent 60%)",
            "radial-gradient(800px circle at 30% 20%, hsl(var(--primary) / 0.04), transparent 60%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Top nav */}
      <motion.header
        className="relative z-10 flex items-center justify-between border-b border-border/50 bg-card/60 px-6 py-3 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Crosshair className="h-6 w-6 text-primary" />
            <span className="font-mono text-lg font-bold tracking-[0.15em] text-foreground">IWTS</span>
          </motion.div>
          <div className="h-6 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 py-1.5"
            animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary) / 0.3)", "hsl(var(--border))"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">SYSTEM ONLINE</span>
          </motion.div>
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl p-6">
        {/* Welcome + Quick Stats */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">Instructor</span>
          </h1>
          <p className="mt-1 text-muted-foreground">Training overview & session management</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { label: "Active Trainees", value: "42", icon: Users, change: "+3" },
            { label: "Sessions Today", value: "18", icon: Activity, change: "+5" },
            { label: "Avg. Accuracy", value: "93.4%", icon: Target, change: "+1.2%" },
            { label: "Top Score", value: "9,850", icon: Trophy, change: "SGT. Cole" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.03, y: -2 }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                  <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                    {stat.change}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column — 2/3 */}
          <div className="space-y-6 lg:col-span-2">
            {/* Scenario Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crosshair className="h-5 w-5 text-primary" />
                    Scenario Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {SCENARIOS.map((scenario) => {
                    const isSelected = selectedScenario === scenario.id;
                    return (
                      <motion.button
                        key={scenario.id}
                        onClick={() => setSelectedScenario(isSelected ? null : scenario.id)}
                        className={`group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
                            : "border-border/50 bg-muted/30 hover:border-primary/30"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        layout
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <scenario.icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="font-semibold text-foreground">{scenario.name}</span>
                          </div>
                          <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${difficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{scenario.env}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{scenario.duration}</span>
                        </div>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 flex gap-2"
                            >
                              <motion.button
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <Play className="h-4 w-4" /> Launch
                              </motion.button>
                              <motion.button
                                className="flex items-center justify-center rounded-lg border border-border bg-secondary px-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Settings className="h-4 w-4" />
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {RECENT_SESSIONS.map((session, i) => (
                    <motion.div
                      key={session.id}
                      className="flex items-center gap-4 rounded-lg border border-border/30 bg-muted/20 p-3 transition-colors hover:border-primary/20 hover:bg-muted/40"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Crosshair className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{session.scenario}</p>
                        <p className="text-xs text-muted-foreground">{session.trainee}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-foreground">{session.score.toLocaleString()}</p>
                        <p className="font-mono text-xs text-primary">{session.accuracy}%</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{session.time}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            {/* Best Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative overflow-hidden border-primary/30 bg-card/80 backdrop-blur-sm">
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: [
                      "radial-gradient(200px circle at 80% 20%, hsl(var(--primary) / 0.08), transparent 70%)",
                      "radial-gradient(200px circle at 20% 80%, hsl(var(--primary) / 0.12), transparent 70%)",
                      "radial-gradient(200px circle at 80% 20%, hsl(var(--primary) / 0.08), transparent 70%)",
                    ],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-primary" />
                    Best Section
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="flex flex-col items-center gap-3 py-2"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Star className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-mono text-2xl font-bold text-primary">{bestSection.name} Section</p>
                      <p className="text-xs text-muted-foreground">{bestSection.members} members · {bestSection.sessions} sessions</p>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="font-mono text-xl font-bold text-foreground">{bestSection.avgScore.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="font-mono text-xl font-bold text-foreground">{bestSection.accuracy}%</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Accuracy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span className="font-mono text-xs text-primary">+{bestSection.trend}% this week</span>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard & Sections Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <Tabs defaultValue="performers">
                  <CardHeader className="pb-2">
                    <TabsList className="w-full bg-muted/50">
                      <TabsTrigger value="performers" className="flex-1 gap-1 text-xs"><Medal className="h-3 w-3" /> Top Performers</TabsTrigger>
                      <TabsTrigger value="sections" className="flex-1 gap-1 text-xs"><BarChart3 className="h-3 w-3" /> Sections</TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <CardContent>
                    <TabsContent value="performers" className="mt-0 space-y-2">
                      {TOP_PERFORMERS.map((p, i) => (
                        <motion.div
                          key={p.rank}
                          className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/20 p-2.5 transition-all hover:border-primary/20 hover:bg-muted/40 cursor-pointer"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + i * 0.06 }}
                          onHoverStart={() => setHoveredPerformer(p.rank)}
                          onHoverEnd={() => setHoveredPerformer(null)}
                          whileHover={{ x: -3 }}
                        >
                          <span className={`font-mono text-lg font-bold w-6 text-center ${rankColors[i] || "text-muted-foreground"}`}>
                            {p.rank}
                          </span>
                          <Avatar className="h-8 w-8 border border-border/50">
                            <AvatarFallback className="bg-muted text-xs font-bold text-foreground">{p.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.section} · {p.accuracy}%</p>
                          </div>
                          <AnimatePresence>
                            {hoveredPerformer === p.rank ? (
                              <motion.div
                                className="flex items-center gap-1 text-primary"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Flame className="h-3 w-3" />
                                <span className="font-mono text-xs">{p.streak}</span>
                              </motion.div>
                            ) : (
                              <motion.span
                                className="font-mono text-xs font-bold text-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                {p.score.toLocaleString()}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </TabsContent>

                    <TabsContent value="sections" className="mt-0 space-y-3">
                      {SECTIONS.map((s, i) => (
                        <motion.div
                          key={s.name}
                          className="rounded-lg border border-border/30 bg-muted/20 p-3"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + i * 0.06 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {i === 0 && <Star className="h-3.5 w-3.5 text-primary" />}
                              <span className="text-sm font-bold text-foreground">{s.name}</span>
                              <span className="text-[10px] text-muted-foreground">{s.members} members</span>
                            </div>
                            <span className={`flex items-center gap-1 font-mono text-xs ${s.trend > 0 ? "text-primary" : "text-destructive"}`}>
                              <TrendingUp className={`h-3 w-3 ${s.trend < 0 ? "rotate-180" : ""}`} />
                              {s.trend > 0 ? "+" : ""}{s.trend}%
                            </span>
                          </div>
                          <Progress value={s.accuracy} className="h-1.5 mb-1" />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Accuracy: {s.accuracy}%</span>
                            <span>Avg: {s.avgScore.toLocaleString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
