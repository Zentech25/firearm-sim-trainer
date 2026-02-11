import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair, Target, Trophy, Medal, Users, Activity,
  Play, Settings, LogOut, ChevronRight, Flame, Zap,
  Star, TrendingUp, Clock, MapPin, Shield, Eye, BarChart3,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { id: 4, scenario: "Defensive Pos", trainee: "SGT. Volkov", score: 8700, accuracy: 92.1, time: "1 hr ago" },
];

const rankColors = ["text-status-warning", "text-muted-foreground", "text-accent"];

const difficultyColor = (d: string) => {
  switch (d) {
    case "Medium": return "border-status-warning/40 text-status-warning";
    case "Hard": return "border-status-danger/40 text-status-danger";
    case "Expert": return "border-destructive/60 text-destructive";
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
      <div className="absolute inset-0 hud-grid" />
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ background: [
          "radial-gradient(800px circle at 30% 20%, hsl(265 75% 55% / 0.03), transparent 60%)",
          "radial-gradient(800px circle at 70% 80%, hsl(210 75% 55% / 0.04), transparent 60%)",
          "radial-gradient(800px circle at 30% 20%, hsl(265 75% 55% / 0.03), transparent 60%)",
        ]}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Top nav */}
      <motion.header className="relative z-10 flex items-center justify-between glass-nav px-6 py-3"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4">
          <motion.button className="flex items-center gap-2.5" whileHover={{ scale: 1.05 }} onClick={() => navigate("/dashboard")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
              <Crosshair className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono text-base font-bold tracking-[0.12em] text-foreground">IWTS</span>
          </motion.button>
          <div className="h-5 w-px bg-border/50" />
          <nav className="flex items-center gap-1">
            <motion.button onClick={() => navigate("/mission")} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Mission</motion.button>
            <motion.button onClick={() => navigate("/configuration")} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Configuration</motion.button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg glass-tile px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-status-online animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">SYSTEM ONLINE</span>
          </div>
          <motion.button onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LogOut className="h-4 w-4" /> Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-5">
        {/* Welcome */}
        <motion.div className="mb-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="text-primary">Instructor</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Training overview & session management</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {[
            { label: "Active Trainees", value: "42", icon: Users, change: "+3", iconBg: "bg-status-info/12", iconColor: "text-status-info", changeBg: "bg-status-info/10", changeColor: "text-status-info" },
            { label: "Sessions Today", value: "18", icon: Activity, change: "+5", iconBg: "bg-status-online/12", iconColor: "text-status-online", changeBg: "bg-status-online/10", changeColor: "text-status-online" },
            { label: "Avg. Accuracy", value: "93.4%", icon: Target, change: "+1.2%", iconBg: "bg-status-warning/12", iconColor: "text-status-warning", changeBg: "bg-status-warning/10", changeColor: "text-status-warning" },
            { label: "Top Score", value: "9,850", icon: Trophy, change: "SGT. Cole", iconBg: "bg-primary/12", iconColor: "text-primary", changeBg: "bg-primary/10", changeColor: "text-primary" },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="glass-tile rounded-xl p-3.5 transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{stat.label}</p>
                </div>
                <span className={`rounded-md ${stat.changeBg} px-2 py-0.5 font-mono text-[10px] ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left: Scenarios + Recent */}
          <div className="space-y-4 lg:col-span-5">
            {/* Scenario Selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="glass-tile rounded-xl">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Crosshair className="h-4 w-4 text-primary" />
                  Scenario Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 px-4 pb-4">
                {SCENARIOS.map((scenario) => {
                  const isSelected = selectedScenario === scenario.id;
                  return (
                    <motion.button key={scenario.id}
                      onClick={() => setSelectedScenario(isSelected ? null : scenario.id)}
                      className={`group relative flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-all ${
                        isSelected ? "border-primary/40 bg-primary/5" : "border-border/40 bg-secondary/30 hover:border-primary/25 hover:bg-secondary/50"
                      }`}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} layout>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <scenario.icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-sm font-semibold text-foreground">{scenario.name}</span>
                        </div>
                        <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] ${difficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{scenario.env}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{scenario.duration}</span>
                      </div>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 flex gap-2">
                            <motion.button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground"
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                              <Play className="h-3.5 w-3.5" /> Launch
                            </motion.button>
                            <motion.button className="flex items-center justify-center rounded-lg border border-border bg-secondary px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Settings className="h-3.5 w-3.5" />
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </CardContent>
            </motion.div>
          </div>

          {/* Center: Recent Sessions */}
          <div className="space-y-4 lg:col-span-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass-tile rounded-xl">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-status-info" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                {RECENT_SESSIONS.map((session, i) => (
                  <motion.div key={session.id}
                    className="flex items-center gap-3 rounded-lg border border-border/20 bg-secondary/25 p-2.5 transition-colors hover:border-primary/20 hover:bg-secondary/40"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.06 }}
                    whileHover={{ x: 3 }}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-info/10">
                      <Crosshair className="h-3.5 w-3.5 text-status-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{session.scenario}</p>
                      <p className="text-[10px] text-muted-foreground">{session.trainee}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-foreground">{session.score.toLocaleString()}</p>
                      <p className="font-mono text-[10px] text-status-online">{session.accuracy}%</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{session.time}</span>
                  </motion.div>
                ))}
              </CardContent>
            </motion.div>

            {/* Best Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="glass-tile-elevated rounded-xl relative overflow-hidden">
              <motion.div className="absolute inset-0 pointer-events-none"
                animate={{ background: [
                  "radial-gradient(150px circle at 80% 20%, hsl(35 90% 55% / 0.06), transparent 70%)",
                  "radial-gradient(150px circle at 20% 80%, hsl(35 90% 55% / 0.1), transparent 70%)",
                  "radial-gradient(150px circle at 80% 20%, hsl(35 90% 55% / 0.06), transparent 70%)",
                ]}}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-status-warning" />
                  Best Section
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-4">
                  <motion.div className="flex h-12 w-12 items-center justify-center rounded-xl border border-status-warning/25 bg-status-warning/10"
                    animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Star className="h-6 w-6 text-status-warning" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-mono text-lg font-bold text-foreground">{bestSection.name} Section</p>
                    <p className="text-[10px] text-muted-foreground">{bestSection.members} members · {bestSection.sessions} sessions</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-status-online/10 px-2 py-1 border border-status-online/15">
                    <TrendingUp className="h-3 w-3 text-status-online" />
                    <span className="font-mono text-xs text-status-online">+{bestSection.trend}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-lg bg-secondary/50 p-2.5 text-center border border-border/30">
                    <p className="font-mono text-lg font-bold text-foreground">{bestSection.avgScore.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Avg Score</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-2.5 text-center border border-border/30">
                    <p className="font-mono text-lg font-bold text-foreground">{bestSection.accuracy}%</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          </div>

          {/* Right: Leaderboard */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="glass-tile rounded-xl">
              <Tabs defaultValue="performers">
                <CardHeader className="pb-2 pt-3 px-3">
                  <TabsList className="w-full bg-secondary/50 h-8">
                    <TabsTrigger value="performers" className="flex-1 gap-1 text-[10px] h-6"><Medal className="h-3 w-3" /> Performers</TabsTrigger>
                    <TabsTrigger value="sections" className="flex-1 gap-1 text-[10px] h-6"><BarChart3 className="h-3 w-3" /> Sections</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <TabsContent value="performers" className="mt-0 space-y-1.5">
                    {TOP_PERFORMERS.map((p, i) => (
                      <motion.div key={p.rank}
                        className="flex items-center gap-2 rounded-lg border border-border/20 bg-secondary/25 p-2 transition-all hover:border-primary/20 hover:bg-secondary/40 cursor-pointer"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                        onHoverStart={() => setHoveredPerformer(p.rank)} onHoverEnd={() => setHoveredPerformer(null)}
                        whileHover={{ x: -2 }}>
                        <span className={`font-mono text-sm font-bold w-5 text-center ${rankColors[i] || "text-muted-foreground"}`}>{p.rank}</span>
                        <Avatar className="h-7 w-7 border border-border/50">
                          <AvatarFallback className="bg-secondary text-[9px] font-bold text-foreground">{p.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground truncate">{p.name}</p>
                          <p className="text-[9px] text-muted-foreground">{p.section} · {p.accuracy}%</p>
                        </div>
                        <AnimatePresence>
                          {hoveredPerformer === p.rank ? (
                            <motion.div className="flex items-center gap-1 text-status-warning"
                              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                              <Flame className="h-3 w-3" />
                              <span className="font-mono text-[10px]">{p.streak}</span>
                            </motion.div>
                          ) : (
                            <motion.span className="font-mono text-[10px] font-bold text-foreground"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              {p.score.toLocaleString()}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </TabsContent>
                  <TabsContent value="sections" className="mt-0 space-y-2">
                    {SECTIONS.map((s, i) => (
                      <motion.div key={s.name}
                        className="rounded-lg border border-border/20 bg-secondary/25 p-2.5"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                        whileHover={{ scale: 1.02 }}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {i === 0 && <Star className="h-3 w-3 text-status-warning" />}
                            <span className="text-xs font-bold text-foreground">{s.name}</span>
                            <span className="text-[9px] text-muted-foreground">{s.members} members</span>
                          </div>
                          <span className={`flex items-center gap-0.5 font-mono text-[10px] ${s.trend > 0 ? "text-status-online" : "text-destructive"}`}>
                            <TrendingUp className={`h-3 w-3 ${s.trend < 0 ? "rotate-180" : ""}`} />
                            {s.trend > 0 ? "+" : ""}{s.trend}%
                          </span>
                        </div>
                        <Progress value={s.accuracy} className="h-1 mb-1" />
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>Accuracy: {s.accuracy}%</span>
                          <span>Avg: {s.avgScore.toLocaleString()}</span>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
