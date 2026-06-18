import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, ChevronRight, ChevronDown,
  Target, Clock, Move, RotateCcw, Crosshair, Folder, FolderOpen,
  Shield, Anchor, Plane, Building2, Layers, ChevronLeft, Search,
  ArrowDown, ArrowUp, X, Settings2, Gauge, Timer, MapPin, Play, Upload,
  Sparkles, ListChecks,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import terrainRange from "@/assets/terrain-range.jpg";
import terrainUrban from "@/assets/terrain-urban.jpg";
import terrainJungle from "@/assets/terrain-jungle.jpg";
import terrainDesert from "@/assets/terrain-desert.jpg";
import terrainSnow from "@/assets/terrain-snow.jpg";
import terrainNight from "@/assets/terrain-night.jpg";

const TERRAIN_IMAGES: Record<string, string> = {
  Range: terrainRange, Urban: terrainUrban, Jungle: terrainJungle,
  Desert: terrainDesert, Snow: terrainSnow, Night: terrainNight,
};
import ThemeToggle from "@/components/ThemeToggle";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// --- Types ---
interface OrbatNode {
  id: string;
  name: string;
  type: "organization" | "branch" | "regiment" | "unit" | "company" | "platoon" | "section";
  children: OrbatNode[];
}

interface Trainee {
  id: string;
  sno: number;
  traineeNumber: string;
  rank: string;
  name: string;
  firerMasterHand: string;
  weapon: string;
  orbatPath: string[];
  orbatLabel: string;
}

interface LaneTrainee extends Trainee {
  laneId: number;
  ammunition: number;
  ammunitionType: string;
  target: string;
}

// --- Constants ---
const WEAPONS = [
  "9mm PISTOL", "5.56mm INSAS Rifle", "5.56mm INSAS LMG",
  "7.62mm Sig 716", "7.62mm SLR", "40mm MGL", "AK-47",
];

const AMMO_TYPES = ["BALL", "NATO", "TRACER", "AP"];
const TARGETS = ["Bore Sight Target", "Fig 11", "Fig 12", "Fig 14", "Chaung Target"];

const BRANCH_ICONS: Record<string, typeof Shield> = {
  "Army": Shield, "Navy": Anchor, "Air Force": Plane,
};

const ORBAT_CHILD_TYPE: Record<string, OrbatNode["type"]> = {
  branch: "regiment", regiment: "unit", unit: "company", company: "platoon", platoon: "section",
};

// Exercise tree data
const EXERCISE_TREE = [
  { id: "range", name: "Range", icon: Target, children: [
    { id: "tutorials", name: "Tutorials", children: [{ id: "slides", name: "Slides" }, { id: "videos", name: "Videos" }] },
    { id: "squadpost", name: "SquadPost", children: [{ id: "sp_normal", name: "Squad Post Normal" }, { id: "sp_moving", name: "Squad Post Moving" }, { id: "sp_pendulum", name: "Squad Post Pendulum" }] },
    { id: "appfire", name: "Application Fire", children: [{ id: "static_normal", name: "Static Normal" }, { id: "static_rotate", name: "Static Rotate" }] },
    { id: "grouping", name: "Grouping" },
    { id: "group_correction", name: "Group Correction Exercise", children: [{ id: "aiming_box", name: "Aiming Box Exercise" }, { id: "blank_target", name: "Blank Target Exercise" }] },
  ]},
  { id: "time", name: "Time", icon: Clock, children: [
    { id: "snap_shot", name: "Snap Shot", children: [
      { id: "snap_popup", name: "Snap Shot Pop Up Target" },
      { id: "snap_rotate", name: "Snap Shot Target Rotate" },
      { id: "snap_color_discs", name: "Snap Shot Color Discs" },
      { id: "snap_random", name: "Snap Shot Random" },
      { id: "snap_random_adv", name: "Snap Shot Random Advance" },
      { id: "snap_color_target", name: "Snap Shot Color Target" },
      { id: "snap_shape_target", name: "Snap Shot Shape Target" },
      { id: "snap_falling", name: "Snap Shot Falling Target" },
      { id: "snap_falling_adv", name: "Snap Shot Falling Target Advance" },
      { id: "snap_user_def", name: "Snap Shot User Defined Exercise" },
      { id: "snap_user_moving", name: "Snap Shot User Defined Moving" },
      { id: "snap_user_random", name: "Snap Shot User Defined Random" },
      { id: "snap_user_moving_adv", name: "Snap Shot User Defined Moving Advance" },
    ]},
    { id: "rapid_fire", name: "Rapid Fire", children: [{ id: "rapid_normal", name: "Rapid Normal" }, { id: "rapid_advanced", name: "Rapid Advanced" }] },
  ]},
  { id: "pendulum", name: "Pendulum", icon: RotateCcw, children: [
    { id: "pend_basic", name: "Pendulum Basic", children: [{ id: "pend_slow", name: "Slow Pendulum" }, { id: "pend_fast", name: "Fast Pendulum" }] },
    { id: "pend_advanced", name: "Pendulum Advanced", children: [{ id: "pend_variable", name: "Variable Speed" }, { id: "pend_random", name: "Random Pattern" }] },
  ]},
  { id: "moving", name: "Moving", icon: Move, children: [
    { id: "moving_basic", name: "Moving Basic", children: [
      { id: "lat_ltr", name: "Lateral Left To Right" }, { id: "lat_rtl", name: "Lateral Right To Left" },
      { id: "head_on", name: "Head On" }, { id: "head_off", name: "Head Off" },
      { id: "oblique_on", name: "Oblique Head On" }, { id: "oblique_off", name: "Oblique Head Off" },
    ]},
    { id: "moving_adv", name: "Moving Advanced", children: [
      { id: "lat_ltr_adv", name: "Lateral Left to Right Advanced" }, { id: "lat_rtl_adv", name: "Lateral Right to Left Advanced" },
      { id: "head_on_adv", name: "Head On Advanced" }, { id: "head_off_adv", name: "Head Off Advanced" },
      { id: "oblique_on_adv", name: "Oblique Head On Advanced" }, { id: "oblique_off_adv", name: "Oblique Head Off Advanced" },
    ]},
  ]},
];

// --- Common dropdown vocab ---
const FIRING_POSITIONS = ["SU - Standing Unsupported", "SS - Standing Supported", "KU - Kneeling Unsupported", "KS - Kneeling Supported", "PU - Prone Unsupported", "PS - Prone Supported"];
const TERRAINS = ["Range", "Urban", "Jungle", "Desert", "Snow", "Night"];
const VEHICLE_TYPES = ["Infantry Soldier", "Light Vehicle", "Heavy Vehicle", "APC", "Tank", "Motorbike"];

// --- Exercise unique parameters schema (derived from Exercises_Type.xlsx) ---
type FieldDef =
  | { kind: "number"; key: string; label: string; min?: number; max?: number; step?: number; unit?: string; default: number }
  | { kind: "select"; key: string; label: string; options: string[]; default: string }
  | { kind: "toggle"; key: string; label: string; default: boolean };

const SESSION_TIME: FieldDef = { kind: "number", key: "sessionTime", label: "Session Time", min: 10, max: 600, step: 5, unit: "sec", default: 60 };
const GROUP_SIZE: FieldDef = { kind: "number", key: "acceptedGroupSize", label: "Accepted Group Size", min: 1, max: 50, step: 1, unit: "cm", default: 10 };
const SPEED: FieldDef = { kind: "number", key: "speed", label: "Target Speed", min: 1, max: 30, step: 1, unit: "km/h", default: 8 };
const UPTIME: FieldDef = { kind: "number", key: "upTime", label: "Up Time", min: 1, max: 60, step: 1, unit: "sec", default: 5 };
const DOWNTIME: FieldDef = { kind: "number", key: "downTime", label: "Down Time", min: 1, max: 60, step: 1, unit: "sec", default: 5 };
const SNAPS: FieldDef = { kind: "number", key: "snaps", label: "Snaps (Count)", min: 1, max: 50, step: 1, default: 10 };
const SELECT_LANE: FieldDef = { kind: "select", key: "snapLane", label: "Select Lane", options: ["All Lanes", ...Array.from({ length: 10 }, (_, i) => `Lane ${i + 1}`)], default: "All Lanes" };
const VEHICLE: FieldDef = { kind: "select", key: "vehicleType", label: "Targets / Vehicle Type", options: VEHICLE_TYPES, default: VEHICLE_TYPES[0] };
const DIFF_DISC: FieldDef = { kind: "toggle", key: "differentDisc", label: "Different Disc", default: false };
const SHOW_DISC_TIME: FieldDef = { kind: "toggle", key: "showDiscTime", label: "Show Disc Time", default: true };

const EXERCISE_CONFIG: Record<string, FieldDef[]> = {
  // Application Fire
  static_normal: [SESSION_TIME],
  static_rotate: [SESSION_TIME],
  // Grouping / Group Correction
  grouping: [GROUP_SIZE, SESSION_TIME],
  aiming_box: [GROUP_SIZE, SESSION_TIME],
  blank_target: [GROUP_SIZE, SESSION_TIME],
  // Moving Basic
  lat_ltr: [SPEED], lat_rtl: [SPEED], head_on: [SPEED], head_off: [SPEED], oblique_on: [SPEED], oblique_off: [SPEED],
  // Moving Advanced
  lat_ltr_adv: [SPEED, VEHICLE], lat_rtl_adv: [SPEED, VEHICLE],
  head_on_adv: [SPEED, VEHICLE], head_off_adv: [SPEED, VEHICLE],
  oblique_on_adv: [SPEED, VEHICLE], oblique_off_adv: [SPEED, VEHICLE],
  // Snap Shots
  snap_popup: [UPTIME, DOWNTIME, SNAPS, SELECT_LANE],
  snap_rotate: [UPTIME, DOWNTIME, SNAPS, SELECT_LANE],
  snap_color_discs: [UPTIME, DOWNTIME, SNAPS, SELECT_LANE, DIFF_DISC, SHOW_DISC_TIME],
  snap_random: [UPTIME, DOWNTIME, SNAPS],
  snap_random_adv: [UPTIME, DOWNTIME, SNAPS],
  snap_color_target: [UPTIME, DOWNTIME, SNAPS, SELECT_LANE],
  snap_shape_target: [UPTIME, DOWNTIME, SNAPS, SELECT_LANE],
  snap_falling: [UPTIME, DOWNTIME, SNAPS, SELECT_LANE],
  snap_falling_adv: [UPTIME, DOWNTIME, SNAPS, SELECT_LANE],
  snap_user_def: [UPTIME, DOWNTIME, SNAPS],
  snap_user_moving: [SPEED],
  snap_user_random: [SPEED],
  snap_user_moving_adv: [SPEED, VEHICLE],
};

const createDefaultOrbat = (): OrbatNode => ({
  id: "org", name: "Organization", type: "organization",
  children: [
    { id: "army", name: "Army", type: "branch", children: [
      { id: "reg_1", name: "1st Infantry Regiment", type: "regiment", children: [
        { id: "unit_1a", name: "Alpha Unit", type: "unit", children: [
          { id: "comp_1a1", name: "Alpha Company", type: "company", children: [
            { id: "plat_1a1a", name: "1st Platoon", type: "platoon", children: [
              { id: "sec_1a1a1", name: "Section A", type: "section", children: [] },
              { id: "sec_1a1a2", name: "Section B", type: "section", children: [] },
            ]},
            { id: "plat_1a1b", name: "2nd Platoon", type: "platoon", children: [] },
          ]},
          { id: "comp_1a2", name: "Bravo Company", type: "company", children: [] },
        ]},
        { id: "unit_1b", name: "Bravo Unit", type: "unit", children: [] },
      ]},
      { id: "reg_2", name: "2nd Armoured Regiment", type: "regiment", children: [
        { id: "unit_2a", name: "Delta Unit", type: "unit", children: [] },
      ]},
    ]},
    { id: "navy", name: "Navy", type: "branch", children: [
      { id: "reg_n1", name: "Western Fleet", type: "regiment", children: [] },
    ]},
    { id: "airforce", name: "Air Force", type: "branch", children: [
      { id: "reg_af1", name: "51 Squadron", type: "regiment", children: [] },
    ]},
  ],
});

const createDummyTrainees = (): Trainee[] => [
  { id: "t1", sno: 1, traineeNumber: "TN-1001", rank: "Sipahi", name: "Rajesh Kumar", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS Rifle", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a1"], orbatLabel: "Section A" },
  { id: "t2", sno: 2, traineeNumber: "TN-1002", rank: "Lance Naik", name: "Vikram Singh", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS Rifle", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a1"], orbatLabel: "Section A" },
  { id: "t3", sno: 3, traineeNumber: "TN-1003", rank: "Naik", name: "Amit Sharma", firerMasterHand: "Left Hand Firer", weapon: "7.62mm Sig 716", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a2"], orbatLabel: "Section B" },
  { id: "t4", sno: 4, traineeNumber: "TN-1004", rank: "Havildar", name: "Suresh Patel", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS LMG", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a2"], orbatLabel: "Section B" },
  { id: "t5", sno: 5, traineeNumber: "TN-1005", rank: "Naib Subedar", name: "Deepak Yadav", firerMasterHand: "Right Hand Firer", weapon: "9mm PISTOL", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1b"], orbatLabel: "2nd Platoon" },
  { id: "t6", sno: 6, traineeNumber: "TN-1006", rank: "Subedar", name: "Manoj Tiwari", firerMasterHand: "Right Hand Firer", weapon: "9mm PISTOL", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a2"], orbatLabel: "Bravo Company" },
  { id: "t7", sno: 7, traineeNumber: "TN-1007", rank: "Captain", name: "Arjun Nair", firerMasterHand: "Right Hand Firer", weapon: "9mm PISTOL", orbatPath: ["org", "army", "reg_1", "unit_1b"], orbatLabel: "Bravo Unit" },
  { id: "t8", sno: 8, traineeNumber: "TN-1008", rank: "Major", name: "Pradeep Chauhan", firerMasterHand: "Left Hand Firer", weapon: "7.62mm SLR", orbatPath: ["org", "army", "reg_2", "unit_2a"], orbatLabel: "Delta Unit" },
  { id: "t9", sno: 9, traineeNumber: "TN-1009", rank: "Lieutenant", name: "Kiran Desai", firerMasterHand: "Right Hand Firer", weapon: "AK-47", orbatPath: ["org", "navy", "reg_n1"], orbatLabel: "Western Fleet" },
  { id: "t10", sno: 10, traineeNumber: "TN-1010", rank: "Sipahi", name: "Ravi Gupta", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS Rifle", orbatPath: ["org", "airforce", "reg_af1"], orbatLabel: "51 Squadron" },
];

// --- ORBAT Tree Component ---
const OrbatTreeNode = ({
  node, depth = 0, selectedId, onSelect,
}: {
  node: OrbatNode; depth?: number; selectedId: string; onSelect: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0 || ORBAT_CHILD_TYPE[node.type];
  const isSelected = selectedId === node.id;
  const BranchIcon = BRANCH_ICONS[node.name] || Folder;

  return (
    <div>
      <motion.div
        className={`group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-all text-sm ${
          isSelected ? "bg-primary/15 text-primary border border-primary/30" : "hover:bg-muted/60 text-foreground border border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => { onSelect(node.id); if (hasChildren) setExpanded(!expanded); }}
        whileHover={{ x: 2 }}
      >
        {hasChildren ? (expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />) : <div className="w-3.5" />}
        {node.type === "branch" ? <BranchIcon className="h-4 w-4 shrink-0 text-primary" /> : expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-accent" /> : <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <span className="truncate flex-1 text-sm font-medium">{node.name}</span>
      </motion.div>
      <AnimatePresence>
        {expanded && node.children.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            {node.children.map((child) => (
              <OrbatTreeNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Exercise Tree Component ---
const ExerciseNode = ({ node, depth = 0, onSelect, selectedId }: { node: any; depth?: number; onSelect: (id: string, name: string) => void; selectedId: string }) => {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const Icon = node.icon;

  return (
    <div>
      <motion.div
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm transition-all ${
          isSelected ? "bg-primary/15 text-primary border border-primary/30" : "hover:bg-muted/60 text-foreground border border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => { if (hasChildren) setExpanded(!expanded); else onSelect(node.id, node.name); }}
        whileHover={{ x: 2 }}
      >
        {hasChildren ? (expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />) : <div className="w-3" />}
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <span className="text-xs font-medium truncate">{node.name}</span>
      </motion.div>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            {node.children.map((child: any) => <ExerciseNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Exercise Configuration Panel ---
const ExerciseConfigPanel = ({
  exerciseId, exerciseName, laneCount, values, onChange,
}: {
  exerciseId: string;
  exerciseName: string;
  laneCount: number;
  values: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}) => {
  const uniqueFields = EXERCISE_CONFIG[exerciseId] || [];

  // Common fields always shown in Settings
  const firingPosition = values.firingPosition ?? FIRING_POSITIONS[0];
  const terrain = values.terrain ?? TERRAINS[0];
  const allBullets = values.allBullets ?? 15;
  const allLanes = values.allLanes ?? true;

  // Default unique field values
  const get = (f: FieldDef) => {
    const v = values[f.key];
    if (v !== undefined) return v;
    return (f as any).default;
  };

  const renderField = (f: FieldDef) => {
    if (f.kind === "number") {
      const val = Number(get(f));
      return (
        <div key={f.key} className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{f.label}</Label>
            <span className="text-sm font-mono font-bold text-primary tabular-nums">
              {val}{f.unit ? <span className="ml-1 text-[10px] text-muted-foreground">{f.unit}</span> : null}
            </span>
          </div>
          <Slider
            value={[val]}
            min={f.min ?? 0} max={f.max ?? 100} step={f.step ?? 1}
            onValueChange={(v) => onChange({ [f.key]: v[0] })}
          />
        </div>
      );
    }
    if (f.kind === "select") {
      return (
        <div key={f.key} className="space-y-2">
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{f.label}</Label>
          <Select value={String(get(f))} onValueChange={(v) => onChange({ [f.key]: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{f.options.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      );
    }
    return (
      <div key={f.key} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
        <Label className="text-xs font-medium">{f.label}</Label>
        <Switch checked={Boolean(get(f))} onCheckedChange={(v) => onChange({ [f.key]: v })} />
      </div>
    );
  };

  return (
    <motion.div
      key={exerciseId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col gap-3 overflow-hidden"
    >
      {/* Header */}
      <div className="glass-tile-elevated rounded-2xl gradient-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <Crosshair className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Exercise</div>
            <h2 className="text-base font-bold text-foreground leading-tight">{exerciseName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-status-online/10 px-2 py-0.5 font-mono text-[10px] text-status-online border border-status-online/20">
            {laneCount} LANE{laneCount === 1 ? "" : "S"}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-2">
        <div className="grid grid-cols-2 gap-3">
          {/* Settings */}
          <section className="glass-tile rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-foreground">Settings</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Firing Position</Label>
                <Select value={firingPosition} onValueChange={(v) => onChange({ firingPosition: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{FIRING_POSITIONS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Terrain</Label>
                <Select value={terrain} onValueChange={(v) => onChange({ terrain: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{TERRAINS.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* Terrain preview */}
              <div className="relative h-28 rounded-lg overflow-hidden border border-border/40 bg-gradient-to-br from-primary/10 via-muted/20 to-accent/10">
                <div className="absolute inset-0 hud-grid opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-6 w-6 mx-auto text-primary mb-1" />
                    <div className="text-xs font-mono uppercase tracking-wider text-foreground">{terrain}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Advance Settings */}
          <section className="glass-tile rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-foreground">Advance Settings</h3>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                {uniqueFields.length + 1} param{uniqueFields.length === 0 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-3">
              {/* Always show Session Time unless exercise already has it */}
              {!uniqueFields.some(f => f.key === "sessionTime") && renderField(SESSION_TIME)}
              {uniqueFields.map(renderField)}
              {uniqueFields.length === 0 && (
                <p className="text-[11px] text-muted-foreground italic">No additional parameters for this exercise.</p>
              )}
            </div>
          </section>

          {/* All Bullets / Lanes */}
          <section className="glass-tile rounded-2xl p-4 space-y-3 col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <ListChecks className="h-4 w-4 text-status-warning" />
              <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-foreground">All Bullets / Lanes</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Bullets per Lane</Label>
                <Input
                  type="number" min={1} max={500}
                  value={allBullets}
                  onChange={(e) => onChange({ allBullets: parseInt(e.target.value) || 0 })}
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Apply To</Label>
                <Select value={allLanes ? "all" : "selected"} onValueChange={(v) => onChange({ allLanes: v === "all" })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Lanes</SelectItem>
                    <SelectItem value="selected" className="text-xs">Selected Lanes Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Estimated Total</Label>
                <div className="h-9 flex items-center px-3 rounded-md border border-border/40 bg-muted/20 font-mono text-xs">
                  <Gauge className="h-3.5 w-3.5 mr-2 text-primary" />
                  {(allBullets || 0) * Math.max(laneCount, 1)} rounds
                </div>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* Action bar */}
      <div className="glass-tile-elevated rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          <span className="font-mono">Ready to deploy exercise to {laneCount || 0} lane{laneCount === 1 ? "" : "s"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Upload className="h-4 w-4" /> Load</Button>
          <Button size="sm" className="gap-2"><Play className="h-4 w-4" /> Start Exercise</Button>
        </div>
      </div>
    </motion.div>
  );
};


const Mission = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<"trainee" | "exercise">("trainee");

  // ORBAT
  const [orbat] = useState<OrbatNode>(createDefaultOrbat);
  const [selectedOrbatId, setSelectedOrbatId] = useState("army");

  // All available trainees
  const [allTrainees] = useState<Trainee[]>(createDummyTrainees);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<Set<string>>(new Set());

  // Lane trainees (max 10)
  const [laneTrainees, setLaneTrainees] = useState<LaneTrainee[]>([]);

  // Exercise state
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedExerciseName, setSelectedExerciseName] = useState("");
  const [configValues, setConfigValues] = useState<Record<string, Record<string, any>>>({});

  const traineeMatchesOrbat = useCallback((trainee: Trainee): boolean => {
    return trainee.orbatPath.includes(selectedOrbatId);
  }, [selectedOrbatId]);

  const filteredTrainees = allTrainees
    .filter(traineeMatchesOrbat)
    .filter(t => !laneTrainees.some(lt => lt.id === t.id))
    .filter(t => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.traineeNumber.toLowerCase().includes(q) || t.rank.toLowerCase().includes(q);
    });

  const toggleTraineeSelection = (id: string) => {
    setSelectedTraineeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const applyToLanes = () => {
    const available = 10 - laneTrainees.length;
    if (available <= 0) return;
    const selected = filteredTrainees.filter(t => selectedTraineeIds.has(t.id)).slice(0, available);
    const newLane: LaneTrainee[] = selected.map((t, i) => ({
      ...t,
      laneId: laneTrainees.length + i + 1,
      ammunition: 15,
      ammunitionType: "BALL",
      target: "Bore Sight Target",
    }));
    setLaneTrainees(prev => [...prev, ...newLane]);
    setSelectedTraineeIds(new Set());
  };

  const removeLaneTrainee = (id: string) => {
    setLaneTrainees(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return filtered.map((t, i) => ({ ...t, laneId: i + 1 }));
    });
  };

  const updateLaneTrainee = (id: string, field: keyof LaneTrainee, value: any) => {
    setLaneTrainees(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="absolute inset-0 hud-grid" />
      <div className="relative z-10 flex h-screen flex-col">
        {/* Main Nav */}
        <div className="glass-nav px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button className="flex items-center gap-2" whileHover={{ scale: 1.05 }} onClick={() => navigate("/dashboard")}>
              <Crosshair className="h-6 w-6 text-primary" />
              <span className="font-mono text-lg font-bold tracking-[0.15em] text-foreground">IWTS</span>
            </motion.button>
            <div className="h-5 w-px bg-border/50" />
            <nav className="flex items-center gap-1">
              <motion.button className="rounded-lg px-3 py-1.5 text-sm text-primary bg-primary/10 border border-primary/20 font-semibold" whileTap={{ scale: 0.95 }}>Mission</motion.button>
              <motion.button onClick={() => navigate("/configuration")} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Configuration</motion.button>
            </nav>
          </div>
          <ThemeToggle />
        </div>
        {/* Sub-tabs */}
        <div className="px-6 py-2 border-b border-border/30 bg-muted/20">
          <div className="relative flex rounded-xl border border-border/50 bg-muted/30 p-1 w-fit">
            <motion.div className="absolute top-1 bottom-1 rounded-lg bg-primary/20 border border-primary/40"
              animate={{ left: activePanel === "trainee" ? "4px" : "50%", width: "calc(50% - 4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            <motion.button
              className={`relative z-10 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${activePanel === "trainee" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActivePanel("trainee")} whileTap={{ scale: 0.97 }}>
              <Users className="h-4 w-4" /> Trainee Selection
            </motion.button>
            <motion.button
              className={`relative z-10 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${activePanel === "exercise" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActivePanel("exercise")} whileTap={{ scale: 0.97 }}>
              <Crosshair className="h-4 w-4" /> Exercise Setup
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activePanel === "trainee" ? (
              <motion.div key="trainee" className="h-full flex flex-col gap-4 p-5" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {/* Top section: ORBAT + Trainee list */}
                <div className="flex gap-4 flex-1 min-h-0">
                  {/* ORBAT Tree */}
                  <div className="w-72 shrink-0 glass-tile rounded-2xl flex flex-col gradient-border">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-5 w-5 text-status-info" />
                        Organizations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 overflow-hidden">
                      <ScrollArea className="h-full">
                        <OrbatTreeNode node={orbat} selectedId={selectedOrbatId} onSelect={(id) => setSelectedOrbatId(id)} />
                      </ScrollArea>
                    </CardContent>
                  </div>

                  {/* Trainee Selection Table */}
                  <div className="flex-1 glass-tile rounded-2xl flex flex-col min-h-0 shimmer-hover">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-status-warning" />
                          Available Trainees
                          <span className="rounded-md bg-status-warning/10 px-2 py-0.5 font-mono text-xs text-status-warning">{filteredTrainees.length}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search..."
                              className="h-8 w-48 pl-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                      <ScrollArea className="flex-1">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/30">
                              <TableHead className="text-xs font-mono w-10">Sno</TableHead>
                              <TableHead className="text-xs font-mono">Trainee Number</TableHead>
                              <TableHead className="text-xs font-mono">Rank</TableHead>
                              <TableHead className="text-xs font-mono">Trainee Name</TableHead>
                              <TableHead className="text-xs font-mono w-14 text-center">Select</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTrainees.map((t, i) => (
                              <motion.tr key={t.id} className="border-border/20 hover:bg-muted/30 cursor-pointer"
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                                onClick={() => toggleTraineeSelection(t.id)}>
                                <TableCell className="font-mono text-xs text-muted-foreground">{t.sno}</TableCell>
                                <TableCell className="font-mono text-xs">{t.traineeNumber}</TableCell>
                                <TableCell className="text-xs">{t.rank}</TableCell>
                                <TableCell className="text-xs font-medium">{t.name}</TableCell>
                                <TableCell className="text-center">
                                  <Checkbox checked={selectedTraineeIds.has(t.id)} onCheckedChange={() => toggleTraineeSelection(t.id)} />
                                </TableCell>
                              </motion.tr>
                            ))}
                            {filteredTrainees.length === 0 && (
                              <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">No trainees available</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={applyToLanes}
                    disabled={selectedTraineeIds.size === 0 || laneTrainees.length >= 10}
                    className="gap-2"
                    size="sm"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Apply To Lanes ({selectedTraineeIds.size} selected)
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono">
                    Lanes: {laneTrainees.length}/10
                  </span>
                </div>

                {/* Lane Assignment Table */}
                <div className="glass-tile rounded-2xl flex flex-col gradient-border" style={{ minHeight: "220px", maxHeight: "320px" }}>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-status-online" />
                      Lane Assignment
                      <span className="rounded-md bg-status-online/10 px-2 py-0.5 font-mono text-xs text-status-online">{laneTrainees.length}/10</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <ScrollArea className="flex-1">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/30">
                            <TableHead className="text-xs font-mono w-14">Lane ID</TableHead>
                            <TableHead className="text-xs font-mono">Trainee Number</TableHead>
                            <TableHead className="text-xs font-mono">Rank</TableHead>
                            <TableHead className="text-xs font-mono">Name</TableHead>
                            <TableHead className="text-xs font-mono">Firer Hand</TableHead>
                            <TableHead className="text-xs font-mono">Weapon</TableHead>
                            <TableHead className="text-xs font-mono w-20">Ammo</TableHead>
                            <TableHead className="text-xs font-mono">Ammo Type</TableHead>
                            <TableHead className="text-xs font-mono">Target</TableHead>
                            <TableHead className="text-xs font-mono w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {laneTrainees.map((t, i) => (
                            <motion.tr key={t.id} className="border-border/20 hover:bg-muted/30"
                              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                              <TableCell className="font-mono text-xs font-bold text-status-online">{t.laneId}</TableCell>
                              <TableCell className="font-mono text-xs">{t.traineeNumber}</TableCell>
                              <TableCell className="text-xs">{t.rank}</TableCell>
                              <TableCell className="text-xs font-medium">{t.name}</TableCell>
                              <TableCell className="text-xs">{t.firerMasterHand}</TableCell>
                              <TableCell>
                                <Select value={t.weapon} onValueChange={(v) => updateLaneTrainee(t.id, "weapon", v)}>
                                  <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>{WEAPONS.map(w => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}</SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={t.ammunition} onChange={(e) => updateLaneTrainee(t.id, "ammunition", parseInt(e.target.value) || 0)}
                                  className="h-7 w-16 text-xs font-mono" />
                              </TableCell>
                              <TableCell>
                                <Select value={t.ammunitionType} onValueChange={(v) => updateLaneTrainee(t.id, "ammunitionType", v)}>
                                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>{AMMO_TYPES.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}</SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select value={t.target} onValueChange={(v) => updateLaneTrainee(t.id, "target", v)}>
                                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>{TARGETS.map(tg => <SelectItem key={tg} value={tg} className="text-xs">{tg}</SelectItem>)}</SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <motion.button onClick={() => removeLaneTrainee(t.id)} className="p-1 rounded hover:bg-destructive/20" whileTap={{ scale: 0.9 }}>
                                  <X className="h-3.5 w-3.5 text-destructive" />
                                </motion.button>
                              </TableCell>
                            </motion.tr>
                          ))}
                          {laneTrainees.length === 0 && (
                            <TableRow><TableCell colSpan={10} className="text-center text-xs text-muted-foreground py-6">
                              Select trainees above and click "Apply To Lanes" to assign them
                            </TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </div>
              </motion.div>
            ) : (
              <motion.div key="exercise" className="h-full flex gap-4 p-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }}>
                <div className="w-80 shrink-0 glass-tile rounded-2xl flex flex-col gradient-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Layers className="h-4 w-4 text-primary" />
                      Exercise Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-2 overflow-hidden">
                    <ScrollArea className="h-full">
                      {EXERCISE_TREE.map((cat) => (
                        <ExerciseNode key={cat.id} node={cat} onSelect={(id, name) => { setSelectedExercise(id); setSelectedExerciseName(name); }} selectedId={selectedExercise} />
                      ))}
                    </ScrollArea>
                  </CardContent>
                </div>
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    {selectedExerciseName ? (
                      <ExerciseConfigPanel
                        key={selectedExercise}
                        exerciseId={selectedExercise}
                        exerciseName={selectedExerciseName}
                        laneCount={laneTrainees.length}
                        values={configValues[selectedExercise] || {}}
                        onChange={(patch) => setConfigValues(prev => ({ ...prev, [selectedExercise]: { ...(prev[selectedExercise] || {}), ...patch } }))}
                      />
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Crosshair className="h-12 w-12 mb-3 opacity-30" />
                        <p className="text-sm">Select an exercise from the tree to configure it</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Mission;
