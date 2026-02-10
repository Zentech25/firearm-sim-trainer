import { useState } from "react";
import { useNavigate } from "react-router-dom";
import tacticalBg from "@/assets/tactical-bg.jpg";
import { Crosshair } from "lucide-react";

const ROLES = ["INSTRUCTOR", "TRAINEE", "ADMINISTRATOR", "OBSERVER"];
const LANGUAGES = ["English", "French", "Spanish", "Arabic", "German"];

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("INSTRUCTOR");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background */}
      <img
        src={tacticalBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />

      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scan-line absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-tactical-glow/20 to-transparent" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-tactical-dark/80 via-background/60 to-tactical-dark/80" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center gap-3">
            <Crosshair className="h-10 w-10 text-primary animate-pulse-glow" />
            <h1 className="font-mono text-5xl font-bold tracking-widest text-primary">
              IWTS
            </h1>
            <Crosshair className="h-10 w-10 text-primary animate-pulse-glow" />
          </div>
          <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground uppercase">
            Integrated Weapon Training Simulator
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="tactical-border rounded-lg bg-card/90 p-8 backdrop-blur-md"
        >
          {/* Login As */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Login As
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded bg-input px-4 py-3 text-lg font-semibold text-foreground outline-none ring-1 ring-border transition-all focus:ring-2 focus:ring-primary"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-popover text-popover-foreground">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded bg-input px-4 py-3 text-lg text-foreground outline-none ring-1 ring-border transition-all focus:ring-2 focus:ring-primary"
              placeholder="Enter password"
            />
          </div>

          {/* Language */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded bg-input px-4 py-3 text-lg font-semibold text-foreground outline-none ring-1 ring-border transition-all focus:ring-2 focus:ring-primary"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-popover text-popover-foreground">
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex-1 rounded bg-primary px-6 py-3 text-lg font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 tactical-glow"
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              onClick={() => window.close()}
              className="flex-1 rounded bg-secondary px-6 py-3 text-lg font-bold uppercase tracking-wider text-secondary-foreground transition-all hover:bg-muted active:scale-[0.98]"
            >
              Exit
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center font-mono text-xs tracking-wider text-muted-foreground">
          v1.0.0 — SYSTEM READY
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
