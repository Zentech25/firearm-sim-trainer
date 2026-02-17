import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair, Target, Trophy, Medal, Users, Activity,
  Play, Settings, LogOut, ChevronRight, Flame, Zap,
  Star, TrendingUp, Clock, MapPin, Shield, Eye, BarChart3,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
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
    case "Medium": return "border-status-warning/40 text-status-warning bg-status-warning/5";
    case "Hard": return "border-status-danger/40 text-status-danger bg-status-danger/5";
    case "Expert": return "border-destructive/60 text-destructive bg-destructive/5";
    default: return "border-muted-foreground/40 text-muted-foreground";
  }
};

const statIconBgs = [
  "bg-gradient-to-br from-status-info/20 to-status-info/5",
  "bg-gradient-to-br from-status-online/20 to-status-online/5",
  "bg-gradient-to-br from-status-warning/20 to-status-warning/5",
  "bg-gradient-to-br from-primary/20 to-primary/5",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [hoveredPerformer, setHoveredPerformer] = useState<number | null>(null);

  const bestSection = SECTIONS[0];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="absolute inset-0 hud-grid" />
      
      {/* Animated ambient glow */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ background: [
          "radial-gradient(800px circle at 30% 20%, hsl(265 75% 55% / 0.04), transparent 60%)",
          "radial-gradient(900px circle at 70% 80%, hsl(210 75% 55% / 0.05), transparent 60%)",
          "radial-gradient(800px circle at 30% 20%, hsl(265 75% 55% / 0.04), transparent 60%)",
        ]}}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          animate={{ y: ["-100%", "100vh"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Top nav */}
      <motion.header className="relative z-10 flex items-center justify-between glass-nav px-6 py-3"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <div className="flex items-center gap-4">
          <motion.button className="flex items-center gap-2.5" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/dashboard")}>
            <motion.div 
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25"
              animate={{ boxShadow: ["0 0 8px hsl(265 75% 55% / 0.1)", "0 0 20px hsl(265 75% 55% / 0.25)", "0 0 8px hsl(265 75% 55% / 0.1)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crosshair className="h-4.5 w-4.5 text-primary" />
            </motion.div>
            <span className="font-mono text-base font-bold tracking-[0.12em] text-gradient">IWTS</span>
          </motion.button>
          <div className="h-5 w-px bg-border/50" />
          <nav className="flex items-center gap-1">
            {[
              { label: "Mission", path: "/mission" },
              { label: "Configuration", path: "/configuration" },
            ].map((link) => (
              <motion.button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="relative rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground group"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{link.label}</span>
                <motion.div
                  className="absolute inset-0 rounded-lg bg-secondary/60"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.div 
            className="flex items-center gap-2 rounded-lg glass-tile px-3 py-1.5"
            animate={{ borderColor: ["hsl(145 65% 48% / 0.1)", "hsl(145 65% 48% / 0.3)", "hsl(145 65% 48% / 0.1)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div 
              className="h-2 w-2 rounded-full bg-status-online"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-mono text-xs text-muted-foreground">SYSTEM ONLINE</span>
          </motion.div>
          <motion.button onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LogOut className="h-4 w-4" /> Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Main content */}
      <motion.div 
        className="relative z-10 mx-auto px-6 py-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome */}
        <motion.div className="mb-5" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">Instructor</span>
          </h1>
          <p className="mt-1 text-base text-muted-foreground">Training overview & session management</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4" variants={itemVariants}>
          {[
            { label: "Active Trainees", value: "42", icon: Users, change: "+3", iconColor: "text-status-info", changeBg: "bg-status-info/10", changeColor: "text-status-info" },
            { label: "Sessions Today", value: "18", icon: Activity, change: "+5", iconColor: "text-status-online", changeBg: "bg-status-online/10", changeColor: "text-status-online" },
            { label: "Avg. Accuracy", value: "93.4%", icon: Target, change: "+1.2%", iconColor: "text-status-warning", changeBg: "bg-status-warning/10", changeColor: "text-status-warning" },
            { label: "Top Score", value: "9,850", icon: Trophy, change: "SGT. Cole", iconColor: "text-primary", changeBg: "bg-primary/10", changeColor: "text-primary" },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="glass-tile rounded-xl p-4 shimmer-hover glow-hover accent-line-top cursor-default">
              <div className="flex items-center gap-3">
                <motion.div 
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${statIconBgs[i]} border border-border/20`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                </div>
                <motion.span 
                  className={`rounded-lg ${stat.changeBg} px-2.5 py-1 font-mono text-xs font-semibold ${stat.changeColor} border border-current/10`}
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.change}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left: Scenarios */}
          <div className="space-y-4 lg:col-span-4">
            <motion.div variants={itemVariants}
              className="glass-tile rounded-xl gradient-border">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                    <Crosshair className="h-5 w-5 text-primary" />
                  </motion.div>
                  Scenario Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2.5 px-5 pb-5">
                {SCENARIOS.map((scenario, idx) => {
                  const isSelected = selectedScenario === scenario.id;
                  return (
                    <motion.button key={scenario.id}
                      onClick={() => setSelectedScenario(isSelected ? null : scenario.id)}
                      className={`group relative flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                        isSelected ? "border-primary/40 bg-primary/5 shadow-[inset_0_1px_0_hsl(265_75%_55%/0.1)]" : "border-border/40 bg-secondary/30 hover:border-primary/25 hover:bg-secondary/50"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.3 }}
                      whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }} layout>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? "bg-primary/15" : "bg-muted/50"}`}
                            whileHover={{ rotate: 15 }}
                          >
                            <scenario.icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </motion.div>
                          <span className="text-sm font-semibold text-foreground">{scenario.name}</span>
                        </div>
                        <span className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-semibold ${difficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-10">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{scenario.env}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{scenario.duration}</span>
                      </div>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 flex gap-2 ml-10">
                            <motion.button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shimmer-hover"
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                              <Play className="h-3.5 w-3.5" /> Launch
                            </motion.button>
                            <motion.button className="flex items-center justify-center rounded-xl border border-border bg-secondary px-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                              whileHover={{ scale: 1.05, rotate: 90 }} whileTap={{ scale: 0.95 }}>
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
          <div className="space-y-4 lg:col-span-5">
            <motion.div variants={itemVariants}
              className="glass-tile rounded-xl">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Activity className="h-5 w-5 text-status-info" />
                  </motion.div>
                  Recent Sessions
                  <span className="ml-auto rounded-lg bg-status-info/10 px-2 py-0.5 font-mono text-[10px] text-status-info border border-status-info/20">LIVE</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 px-5 pb-5">
                {RECENT_SESSIONS.map((session, i) => (
                  <motion.div key={session.id}
                    className="flex items-center gap-3 rounded-xl border border-border/20 bg-secondary/25 p-3.5 transition-all hover:border-primary/20 hover:bg-secondary/40 cursor-pointer shimmer-hover"
                    initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                    whileHover={{ x: 4, borderColor: "hsl(265 75% 55% / 0.2)" }}>
                    <motion.div 
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-status-info/15 to-status-info/5 border border-status-info/15"
                      whileHover={{ rotate: 45 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Crosshair className="h-4 w-4 text-status-info" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{session.scenario}</p>
                      <p className="text-xs text-muted-foreground">{session.trainee}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-foreground">{session.score.toLocaleString()}</p>
                      <p className="font-mono text-xs text-status-online">{session.accuracy}%</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{session.time}</span>
                  </motion.div>
                ))}
              </CardContent>
            </motion.div>

            {/* Best Section */}
            <motion.div variants={itemVariants}
              className="glass-tile-elevated rounded-xl relative overflow-hidden gradient-border">
              <motion.div className="absolute inset-0 pointer-events-none"
                animate={{ background: [
                  "radial-gradient(150px circle at 80% 20%, hsl(35 90% 55% / 0.06), transparent 70%)",
                  "radial-gradient(200px circle at 20% 80%, hsl(35 90% 55% / 0.1), transparent 70%)",
                  "radial-gradient(150px circle at 80% 20%, hsl(35 90% 55% / 0.06), transparent 70%)",
                ]}}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <CardHeader className="pb-1 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-status-warning" />
                  Best Section
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-center gap-4">
                  <motion.div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-status-warning/25 bg-gradient-to-br from-status-warning/15 to-status-warning/5"
                    animate={{ rotate: [0, 5, -5, 0], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <Star className="h-7 w-7 text-status-warning" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-mono text-xl font-bold text-foreground">{bestSection.name} Section</p>
                    <p className="text-xs text-muted-foreground">{bestSection.members} members · {bestSection.sessions} sessions</p>
                  </div>
                  <motion.div 
                    className="flex items-center gap-1 rounded-xl bg-status-online/10 px-3 py-2 border border-status-online/20"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-status-online" />
                    <span className="font-mono text-xs font-bold text-status-online">+{bestSection.trend}%</span>
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { value: bestSection.avgScore.toLocaleString(), label: "Avg Score" },
                    { value: `${bestSection.accuracy}%`, label: "Accuracy" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      className="rounded-xl bg-secondary/50 p-3.5 text-center border border-border/30 glow-hover"
                      whileHover={{ scale: 1.03 }}
                    >
                      <p className="font-mono text-xl font-bold text-foreground">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          </div>

          {/* Right: Leaderboard */}
          <div className="lg:col-span-3">
            <motion.div variants={itemVariants}
              className="glass-tile rounded-xl gradient-border">
              <Tabs defaultValue="performers">
                <CardHeader className="pb-2 pt-4 px-4">
                  <TabsList className="w-full bg-secondary/50 h-9 rounded-xl">
                    <TabsTrigger value="performers" className="flex-1 gap-1.5 text-xs h-7 rounded-lg"><Medal className="h-4 w-4" /> Performers</TabsTrigger>
                    <TabsTrigger value="sections" className="flex-1 gap-1.5 text-xs h-7 rounded-lg"><BarChart3 className="h-4 w-4" /> Sections</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <TabsContent value="performers" className="mt-0 space-y-2">
                    {TOP_PERFORMERS.map((p, i) => (
                      <motion.div key={p.rank}
                        className="flex items-center gap-2.5 rounded-xl border border-border/20 bg-secondary/25 p-2.5 transition-all hover:border-primary/20 hover:bg-secondary/40 cursor-pointer"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                        onHoverStart={() => setHoveredPerformer(p.rank)} onHoverEnd={() => setHoveredPerformer(null)}
                        whileHover={{ x: -3, scale: 1.01 }}>
                        <motion.span 
                          className={`font-mono text-base font-bold w-6 text-center ${rankColors[i] || "text-muted-foreground"}`}
                          animate={i === 0 ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {p.rank}
                        </motion.span>
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">{p.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.section} · {p.accuracy}%</p>
                        </div>
                        <AnimatePresence mode="wait">
                          {hoveredPerformer === p.rank ? (
                            <motion.div key="streak" className="flex items-center gap-1 text-status-warning"
                              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                              <Flame className="h-3.5 w-3.5" />
                              <span className="font-mono text-xs font-bold">{p.streak}</span>
                            </motion.div>
                          ) : (
                            <motion.span key="score" className="font-mono text-xs font-bold text-foreground"
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
                        className="rounded-xl border border-border/20 bg-secondary/25 p-3"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                        whileHover={{ scale: 1.02, x: -2 }}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {i === 0 && (
                              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Star className="h-3.5 w-3.5 text-status-warning" />
                              </motion.div>
                            )}
                            <span className="text-sm font-bold text-foreground">{s.name}</span>
                            <span className="text-[10px] text-muted-foreground">{s.members} members</span>
                          </div>
                          <span className={`flex items-center gap-0.5 font-mono text-xs font-semibold ${s.trend > 0 ? "text-status-online" : "text-destructive"}`}>
                            <TrendingUp className={`h-3 w-3 ${s.trend < 0 ? "rotate-180" : ""}`} />
                            {s.trend > 0 ? "+" : ""}{s.trend}%
                          </span>
                        </div>
                        <Progress value={s.accuracy} className="h-1.5 mb-1.5" />
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
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
      </motion.div>
    </div>
  );
};

export default Dashboard;
