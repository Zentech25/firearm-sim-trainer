import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Lock, ChevronDown, Globe, User, Shield, Eye, EyeOff } from "lucide-react";

const ROLES = [
  { value: "INSTRUCTOR", icon: User, label: "Instructor" },
  { value: "TRAINEE", icon: Crosshair, label: "Trainee" },
  { value: "ADMINISTRATOR", icon: Shield, label: "Administrator" },
  { value: "OBSERVER", icon: Eye, label: "Observer" },
];

const LANGUAGES = ["English", "French", "Spanish", "Arabic", "German"];

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("INSTRUCTOR");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  const selectedRole = ROLES.find((r) => r.value === role)!;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* HUD grid background */}
      <div className="absolute inset-0 hud-grid" />

      {/* Animated radial glow - dual colors */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(600px circle at 30% 40%, hsl(265 75% 55% / 0.06), transparent 60%), radial-gradient(400px circle at 70% 60%, hsl(210 75% 55% / 0.04), transparent 60%)",
            "radial-gradient(800px circle at 50% 50%, hsl(265 75% 55% / 0.08), transparent 60%), radial-gradient(500px circle at 30% 70%, hsl(145 65% 48% / 0.04), transparent 60%)",
            "radial-gradient(600px circle at 70% 30%, hsl(210 75% 55% / 0.06), transparent 60%), radial-gradient(400px circle at 40% 60%, hsl(265 75% 55% / 0.04), transparent 60%)",
            "radial-gradient(600px circle at 30% 40%, hsl(265 75% 55% / 0.06), transparent 60%), radial-gradient(400px circle at 70% 60%, hsl(210 75% 55% / 0.04), transparent 60%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
          animate={{ y: ["-10%", "110vh"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/20"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, Math.random() * -200, Math.random() * 200],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="absolute inset-0 rounded-2xl border border-primary/20 bg-primary/5"
              animate={{ 
                boxShadow: [
                  "0 0 20px hsl(265 75% 55% / 0.1)",
                  "0 0 40px hsl(265 75% 55% / 0.25)",
                  "0 0 20px hsl(265 75% 55% / 0.1)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <Crosshair className="relative h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="font-mono text-4xl font-bold tracking-[0.2em] text-gradient">
            IWTS
          </h1>
          <motion.div
            className="mx-auto mt-2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="mt-3 text-xs tracking-[0.25em] text-muted-foreground uppercase">
            Integrated Weapon Training Simulator
          </p>
        </motion.div>

        {/* Login form */}
        <motion.form
          onSubmit={handleLogin}
          className="space-y-5 glass-tile-elevated rounded-2xl p-8 gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Login As
            </label>
            <div className="relative">
              <motion.button
                type="button"
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-input px-4 py-3.5 text-left transition-colors hover:border-primary/50"
                whileTap={{ scale: 0.98 }}
              >
                <selectedRole.icon className="h-5 w-5 text-primary" />
                <span className="flex-1 text-base font-semibold text-foreground">
                  {selectedRole.label}
                </span>
                <motion.div
                  animate={{ rotate: roleDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {ROLES.map((r, i) => (
                      <motion.button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setRole(r.value);
                          setRoleDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                          role === r.value ? "bg-primary/10 text-primary" : "text-foreground"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <r.icon className="h-4 w-4" />
                        <span className="font-medium">{r.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <motion.div
              className={`flex items-center gap-2 rounded-xl border bg-input px-4 transition-colors ${
                focusedField === "password" ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.1)]" : "border-border"
              }`}
              animate={
                focusedField === "password"
                  ? { borderColor: "hsl(var(--primary))" }
                  : {}
              }
            >
              <Lock className={`h-4 w-4 transition-colors ${focusedField === "password" ? "text-primary" : "text-muted-foreground"}`} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground/50"
                placeholder="Enter password"
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                whileTap={{ scale: 0.85 }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </motion.button>
            </motion.div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Language
            </label>
            <div className="relative">
              <motion.button
                type="button"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setRoleDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-input px-4 py-3.5 text-left transition-colors hover:border-primary/50"
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="h-5 w-5 text-primary" />
                <span className="flex-1 text-base font-semibold text-foreground">
                  {language}
                </span>
                <motion.div
                  animate={{ rotate: langDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {LANGUAGES.map((l, i) => (
                      <motion.button
                        key={l}
                        type="button"
                        onClick={() => {
                          setLanguage(l);
                          setLangDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                          language === l ? "bg-primary/10 text-primary" : "text-foreground"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <span className="font-medium">{l}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              type="submit"
              disabled={isLoggingIn}
              className="relative flex-1 overflow-hidden rounded-xl bg-primary px-6 py-3.5 text-base font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60 shimmer-hover"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px hsl(265 75% 55% / 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {isLoggingIn ? (
                  <motion.div
                    key="loading"
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Connecting...
                  </motion.div>
                ) : (
                  <motion.span
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Login
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Hover shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            <motion.button
              type="button"
              onClick={() => window.close()}
              className="rounded-xl border border-border bg-secondary px-6 py-3.5 text-base font-bold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-muted"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Exit
            </motion.button>
          </div>
        </motion.form>

        {/* Footer */}
        <motion.p
          className="mt-8 text-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          v1.0.0 — System Ready
        </motion.p>
      </motion.div>

      {/* Click outside to close dropdowns */}
      {(roleDropdownOpen || langDropdownOpen) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setRoleDropdownOpen(false);
            setLangDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default LoginPage;
