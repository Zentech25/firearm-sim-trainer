import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Trash2, Edit2, Check, X, ChevronRight, ChevronDown,
  Target, Clock, Move, RotateCcw, UserPlus, Crosshair, Folder, FolderOpen,
  Shield, Anchor, Plane, Building2, Layers, Camera, ImagePlus, ChevronLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  orbatPath: string[]; // ids from root to leaf
  orbatLabel: string;
  photo?: string; // data URL for trainee photo
}

// --- Constants ---
const RANKS = [
  "Sipahi", "Lance Naik", "Naik", "Havildar", "Naib Subedar",
  "Subedar", "Subedar Major", "Lieutenant", "Captain", "Major",
  "Lieutenant Colonel", "Colonel", "Brigadier",
];

const RANK_BADGES: Record<string, { colors: string[]; stars: number }> = {
  "Sipahi": { colors: ["hsl(45,60%,40%)"], stars: 0 },
  "Lance Naik": { colors: ["hsl(45,60%,40%)", "hsl(45,70%,50%)"], stars: 1 },
  "Naik": { colors: ["hsl(45,60%,40%)", "hsl(45,70%,50%)"], stars: 2 },
  "Havildar": { colors: ["hsl(45,60%,35%)", "hsl(45,80%,55%)"], stars: 3 },
  "Naib Subedar": { colors: ["hsl(35,50%,30%)", "hsl(45,90%,60%)"], stars: 1 },
  "Subedar": { colors: ["hsl(35,50%,30%)", "hsl(45,90%,60%)"], stars: 2 },
  "Subedar Major": { colors: ["hsl(30,40%,25%)", "hsl(50,100%,65%)"], stars: 3 },
  "Lieutenant": { colors: ["hsl(220,30%,25%)", "hsl(45,90%,60%)"], stars: 1 },
  "Captain": { colors: ["hsl(220,30%,25%)", "hsl(45,90%,60%)"], stars: 2 },
  "Major": { colors: ["hsl(220,30%,25%)", "hsl(45,90%,60%)"], stars: 3 },
  "Lieutenant Colonel": { colors: ["hsl(0,50%,35%)", "hsl(45,100%,65%)"], stars: 1 },
  "Colonel": { colors: ["hsl(0,50%,35%)", "hsl(45,100%,65%)"], stars: 2 },
  "Brigadier": { colors: ["hsl(0,50%,35%)", "hsl(45,100%,65%)"], stars: 3 },
};

const WEAPONS = [
  "9mm PISTOL", "5.56mm INSAS Rifle", "5.56mm INSAS LMG",
  "7.62mm Sig 716", "7.62mm SLR", "40mm MGL", "AK-47",
];

const FIRER_HANDS = ["Right Hand Firer", "Left Hand Firer"];

// Exercise tree data
const EXERCISE_TREE = [
  {
    id: "range", name: "Range", icon: Target, children: [
      { id: "tutorials", name: "Tutorials", children: [
        { id: "slides", name: "Slides" }, { id: "videos", name: "Videos" }
      ]},
      { id: "squadpost", name: "SquadPost", children: [
        { id: "sp_normal", name: "Squad Post Normal" },
        { id: "sp_moving", name: "Squad Post Moving" },
        { id: "sp_pendulum", name: "Squad Post Pendulum" },
      ]},
      { id: "appfire", name: "Application Fire", children: [
        { id: "static_normal", name: "Static Normal" },
        { id: "static_rotate", name: "Static Rotate" },
      ]},
      { id: "grouping", name: "Grouping" },
      { id: "group_correction", name: "Group Correction Exercise", children: [
        { id: "aiming_box", name: "Aiming Box Exercise" },
        { id: "blank_target", name: "Blank Target Exercise" },
      ]},
    ],
  },
  {
    id: "time", name: "Time", icon: Clock, children: [
      { id: "snap_shot", name: "Snap Shot", children: [
        { id: "snap_popup", name: "Snap Shot Pop Up Target" },
      ]},
      { id: "rapid_fire", name: "Rapid Fire", children: [
        { id: "rapid_normal", name: "Rapid Normal" },
        { id: "rapid_advanced", name: "Rapid Advanced" },
      ]},
    ],
  },
  {
    id: "pendulum", name: "Pendulum", icon: RotateCcw, children: [
      { id: "pend_basic", name: "Pendulum Basic", children: [
        { id: "pend_slow", name: "Slow Pendulum" },
        { id: "pend_fast", name: "Fast Pendulum" },
      ]},
      { id: "pend_advanced", name: "Pendulum Advanced", children: [
        { id: "pend_variable", name: "Variable Speed" },
        { id: "pend_random", name: "Random Pattern" },
      ]},
    ],
  },
  {
    id: "moving", name: "Moving", icon: Move, children: [
      { id: "moving_basic", name: "Moving Basic", children: [
        { id: "lat_ltr", name: "Lateral Left To Right" },
        { id: "lat_rtl", name: "Lateral Right To Left" },
        { id: "head_on", name: "Head On" },
        { id: "head_off", name: "Head Off" },
        { id: "oblique_on", name: "Oblique Head On" },
        { id: "oblique_off", name: "Oblique Head Off" },
      ]},
      { id: "moving_adv", name: "Moving Advanced", children: [
        { id: "lat_ltr_adv", name: "Lateral Left to Right Advanced" },
        { id: "lat_rtl_adv", name: "Lateral Right to Left Advanced" },
        { id: "head_on_adv", name: "Head On Advanced" },
        { id: "head_off_adv", name: "Head Off Advanced" },
        { id: "oblique_on_adv", name: "Oblique Head On Advanced" },
        { id: "oblique_off_adv", name: "Oblique Head Off Advanced" },
      ]},
    ],
  },
];

// Default ORBAT with dummy structure
const createDefaultOrbat = (): OrbatNode => ({
  id: "org",
  name: "Organization",
  type: "organization",
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

// Dummy trainees
const createDummyTrainees = (): Trainee[] => [
  { id: "t1", sno: 1, traineeNumber: "TN-1001", rank: "Sipahi", name: "Rajesh Kumar", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS Rifle", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a1"], orbatLabel: "Organization > Army > 1st Infantry Regiment > Alpha Unit > Alpha Company > 1st Platoon > Section A" },
  { id: "t2", sno: 2, traineeNumber: "TN-1002", rank: "Lance Naik", name: "Vikram Singh", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS Rifle", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a1"], orbatLabel: "Organization > Army > 1st Infantry Regiment > Alpha Unit > Alpha Company > 1st Platoon > Section A" },
  { id: "t3", sno: 3, traineeNumber: "TN-1003", rank: "Naik", name: "Amit Sharma", firerMasterHand: "Left Hand Firer", weapon: "7.62mm Sig 716", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a2"], orbatLabel: "Organization > Army > 1st Infantry Regiment > Alpha Unit > Alpha Company > 1st Platoon > Section B" },
  { id: "t4", sno: 4, traineeNumber: "TN-1004", rank: "Havildar", name: "Suresh Patel", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS LMG", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1a", "sec_1a1a2"], orbatLabel: "Organization > Army > 1st Infantry Regiment > Alpha Unit > Alpha Company > 1st Platoon > Section B" },
  { id: "t5", sno: 5, traineeNumber: "TN-1005", rank: "Naib Subedar", name: "Deepak Yadav", firerMasterHand: "Right Hand Firer", weapon: "9mm PISTOL", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a1", "plat_1a1b"], orbatLabel: "Organization > Army > 1st Infantry Regiment > Alpha Unit > Alpha Company > 2nd Platoon" },
  { id: "t6", sno: 6, traineeNumber: "TN-1006", rank: "Subedar", name: "Manoj Tiwari", firerMasterHand: "Right Hand Firer", weapon: "9mm PISTOL", orbatPath: ["org", "army", "reg_1", "unit_1a", "comp_1a2"], orbatLabel: "Organization > Army > 1st Infantry Regiment > Alpha Unit > Bravo Company" },
  { id: "t7", sno: 7, traineeNumber: "TN-1007", rank: "Captain", name: "Arjun Nair", firerMasterHand: "Right Hand Firer", weapon: "9mm PISTOL", orbatPath: ["org", "army", "reg_1", "unit_1b"], orbatLabel: "Organization > Army > 1st Infantry Regiment > Bravo Unit" },
  { id: "t8", sno: 8, traineeNumber: "TN-1008", rank: "Major", name: "Pradeep Chauhan", firerMasterHand: "Left Hand Firer", weapon: "7.62mm SLR", orbatPath: ["org", "army", "reg_2", "unit_2a"], orbatLabel: "Organization > Army > 2nd Armoured Regiment > Delta Unit" },
  { id: "t9", sno: 9, traineeNumber: "TN-1009", rank: "Lieutenant", name: "Kiran Desai", firerMasterHand: "Right Hand Firer", weapon: "AK-47", orbatPath: ["org", "navy", "reg_n1"], orbatLabel: "Organization > Navy > Western Fleet" },
  { id: "t10", sno: 10, traineeNumber: "TN-1010", rank: "Sipahi", name: "Ravi Gupta", firerMasterHand: "Right Hand Firer", weapon: "5.56mm INSAS Rifle", orbatPath: ["org", "airforce", "reg_af1"], orbatLabel: "Organization > Air Force > 51 Squadron" },
];

const ORBAT_CHILD_TYPE: Record<string, OrbatNode["type"]> = {
  branch: "regiment",
  regiment: "unit",
  unit: "company",
  company: "platoon",
  platoon: "section",
};

const BRANCH_ICONS: Record<string, typeof Shield> = {
  "Army": Shield,
  "Navy": Anchor,
  "Air Force": Plane,
};

let nextId = 100;
const genId = () => `node_${nextId++}`;

// --- Rank Badge Component ---
const RankBadge = ({ rank }: { rank: string }) => {
  const badge = RANK_BADGES[rank];
  if (!badge) return null;
  return (
    <motion.div
      className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      key={rank}
    >
      <svg width="60" height="24" viewBox="0 0 60 24">
        <defs>
          <linearGradient id={`badge-${rank}`} x1="0" y1="0" x2="1" y2="0">
            {badge.colors.map((c, i) => (
              <stop key={i} offset={`${(i / (badge.colors.length - 1 || 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <rect x="2" y="6" width="56" height="12" rx="3" fill={`url(#badge-${rank})`} stroke="hsl(45,60%,50%)" strokeWidth="0.5" />
        {Array.from({ length: badge.stars }).map((_, i) => (
          <circle key={i} cx={30 + (i - (badge.stars - 1) / 2) * 10} cy="12" r="2.5" fill="hsl(45,90%,80%)" />
        ))}
      </svg>
      <span className="text-[10px] text-muted-foreground font-mono uppercase ml-1">{rank}</span>
    </motion.div>
  );
};

// --- ORBAT Tree Component ---
const OrbatTreeNode = ({
  node,
  depth = 0,
  selectedId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: {
  node: OrbatNode;
  depth?: number;
  selectedId: string;
  onSelect: (id: string, path: string[]) => void;
  onAdd: (parentId: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const hasChildren = node.children.length > 0 || ORBAT_CHILD_TYPE[node.type];
  const isSelected = selectedId === node.id;
  const canAdd = ORBAT_CHILD_TYPE[node.type] !== undefined;
  const canEdit = node.type !== "organization";
  const canDelete = node.type !== "organization" && node.type !== "branch";
  const BranchIcon = BRANCH_ICONS[node.name] || Folder;

  return (
    <div>
      <motion.div
        className={`group flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer transition-all text-sm ${
          isSelected
            ? "bg-primary/15 text-primary border border-primary/30"
            : "hover:bg-muted/60 text-foreground border border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          onSelect(node.id, []);
          if (hasChildren) setExpanded(!expanded);
        }}
        whileHover={{ x: 2 }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : <div className="w-3" />}

        {node.type === "branch" ? (
          <BranchIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
        ) : expanded ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}

        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-5 text-xs px-1 py-0"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") { onRename(node.id, editName); setEditing(false); }
                if (e.key === "Escape") setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <Check className="h-3 w-3 text-primary cursor-pointer" onClick={(e) => { e.stopPropagation(); onRename(node.id, editName); setEditing(false); }} />
            <X className="h-3 w-3 text-destructive cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditing(false); }} />
          </div>
        ) : (
          <span className="truncate flex-1 text-xs font-medium">{node.name}</span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
          {canAdd && (
            <motion.button
              className="p-0.5 rounded hover:bg-primary/20"
              onClick={(e) => { e.stopPropagation(); onAdd(node.id); }}
              whileTap={{ scale: 0.9 }}
              title={`Add ${ORBAT_CHILD_TYPE[node.type]}`}
            >
              <Plus className="h-3 w-3 text-primary" />
            </motion.button>
          )}
          {canEdit && (
            <motion.button
              className="p-0.5 rounded hover:bg-accent/20"
              onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(node.name); }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit2 className="h-3 w-3 text-accent" />
            </motion.button>
          )}
          {canDelete && (
            <motion.button
              className="p-0.5 rounded hover:bg-destructive/20"
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </motion.button>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {expanded && node.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <OrbatTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onAdd={onAdd}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Exercise Tree Component ---
const ExerciseNode = ({
  node,
  depth = 0,
  onSelect,
  selectedId,
}: {
  node: any;
  depth?: number;
  onSelect: (id: string, name: string) => void;
  selectedId: string;
}) => {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const Icon = node.icon;

  return (
    <div>
      <motion.div
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm transition-all ${
          isSelected
            ? "bg-primary/15 text-primary border border-primary/30"
            : "hover:bg-muted/60 text-foreground border border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          else onSelect(node.id, node.name);
        }}
        whileHover={{ x: 2 }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : <div className="w-3" />}
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <span className="text-xs font-medium truncate">{node.name}</span>
      </motion.div>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child: any) => (
              <ExerciseNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Mission Component ---
const Mission = () => {
  const navigate = useNavigate();
  // Active panel: "trainee" or "exercise"
  const [activePanel, setActivePanel] = useState<"trainee" | "exercise">("trainee");

  // ORBAT State
  const [orbat, setOrbat] = useState<OrbatNode>(createDefaultOrbat);
  const [selectedOrbatId, setSelectedOrbatId] = useState("army");

  // Trainee form
  const [traineeNumber, setTraineeNumber] = useState("");
  const [traineeRank, setTraineeRank] = useState("");
  const [traineeName, setTraineeName] = useState("");
  const [firerHand, setFirerHand] = useState("Right Hand Firer");
  const [weapon, setWeapon] = useState("9mm PISTOL");
  const [trainees, setTrainees] = useState<Trainee[]>(createDummyTrainees);
  const [traineePhoto, setTraineePhoto] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  let snoCounter = trainees.length > 0 ? Math.max(...trainees.map(t => t.sno)) + 1 : 1;
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Exercise state
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedExerciseName, setSelectedExerciseName] = useState("");

  // --- ORBAT helpers ---
  const findNode = useCallback((root: OrbatNode, id: string): OrbatNode | null => {
    if (root.id === id) return root;
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  }, []);

  const getNodeLabel = useCallback((root: OrbatNode, id: string, path: string[] = []): string => {
    if (root.id === id) return [...path, root.name].join(" > ");
    for (const child of root.children) {
      const result = getNodeLabel(child, id, [...path, root.name]);
      if (result) return result;
    }
    return "";
  }, []);

  const isDescendantOf = useCallback((root: OrbatNode, ancestorId: string, targetId: string): boolean => {
    const ancestor = findNode(root, ancestorId);
    if (!ancestor) return false;
    if (ancestor.id === targetId) return true;
    return ancestor.children.some(c => isDescendantOf(c, c.id, targetId) || c.id === targetId);
  }, [findNode]);

  // Check if a trainee belongs to selected ORBAT node
  const traineeMatchesOrbat = useCallback((trainee: Trainee): boolean => {
    return trainee.orbatPath.includes(selectedOrbatId);
  }, [selectedOrbatId]);

  const filteredTrainees = trainees.filter(traineeMatchesOrbat);
  const totalPages = Math.max(1, Math.ceil(filteredTrainees.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTrainees = filteredTrainees.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const addNodeToOrbat = useCallback((parentId: string) => {
    setOrbat(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as OrbatNode;
      const parent = findNode(clone, parentId);
      if (!parent) return prev;
      const childType = ORBAT_CHILD_TYPE[parent.type];
      if (!childType) return prev;
      parent.children.push({
        id: genId(),
        name: `New ${childType.charAt(0).toUpperCase() + childType.slice(1)}`,
        type: childType,
        children: [],
      });
      return clone;
    });
  }, [findNode]);

  const renameNode = useCallback((id: string, newName: string) => {
    setOrbat(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as OrbatNode;
      const node = findNode(clone, id);
      if (node) node.name = newName;
      return clone;
    });
  }, [findNode]);

  const deleteNode = useCallback((id: string) => {
    setOrbat(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as OrbatNode;
      const removeFromChildren = (node: OrbatNode): boolean => {
        const idx = node.children.findIndex(c => c.id === id);
        if (idx !== -1) { node.children.splice(idx, 1); return true; }
        return node.children.some(c => removeFromChildren(c));
      };
      removeFromChildren(clone);
      return clone;
    });
    setTrainees(prev => prev.filter(t => !t.orbatPath.includes(id)));
  }, []);

  // Get orbat path for selected node
  const getOrbatPath = useCallback((root: OrbatNode, targetId: string, current: string[] = []): string[] | null => {
    if (root.id === targetId) return [...current, root.id];
    for (const child of root.children) {
      const result = getOrbatPath(child, targetId, [...current, root.id]);
      if (result) return result;
    }
    return null;
  }, []);

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setTraineePhoto(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addTrainee = () => {
    if (!traineeNumber || !traineeRank || !traineeName) return;
    const path = getOrbatPath(orbat, selectedOrbatId) || [selectedOrbatId];
    const label = getNodeLabel(orbat, selectedOrbatId);
    setTrainees(prev => [...prev, {
      id: genId(),
      sno: snoCounter,
      traineeNumber,
      rank: traineeRank,
      name: traineeName,
      firerMasterHand: firerHand,
      weapon,
      orbatPath: path,
      orbatLabel: label,
      photo: traineePhoto,
    }]);
    setTraineeNumber("");
    setTraineeName("");
    setTraineePhoto(undefined);
  };

  const deleteTrainee = (id: string) => {
    setTrainees(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient grid */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="h-full w-full" style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative z-10 flex h-screen flex-col">
        {/* Mode Switcher - Creative animated toggle */}
        <div className="flex items-center gap-2 border-b border-border/50 bg-card/60 px-6 py-3 backdrop-blur-xl">
          <motion.button
            className="flex items-center gap-2 mr-4"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/dashboard")}
          >
            <Crosshair className="h-6 w-6 text-primary" />
            <span className="font-mono text-lg font-bold tracking-[0.15em] text-foreground">IWTS</span>
          </motion.button>
          <div className="h-6 w-px bg-border mr-4" />
          <div className="relative flex rounded-xl border border-border/50 bg-muted/30 p-1">
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg bg-primary/20 border border-primary/40"
              animate={{
                left: activePanel === "trainee" ? "4px" : "50%",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <motion.button
              className={`relative z-10 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
                activePanel === "trainee" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActivePanel("trainee")}
              whileTap={{ scale: 0.97 }}
            >
              <UserPlus className="h-4 w-4" />
              Trainee Setup
            </motion.button>
            <motion.button
              className={`relative z-10 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
                activePanel === "exercise" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActivePanel("exercise")}
              whileTap={{ scale: 0.97 }}
            >
              <Crosshair className="h-4 w-4" />
              Exercise Setup
            </motion.button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activePanel === "trainee" ? (
              <motion.div
                key="trainee"
                className="h-full flex gap-4 p-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Left: ORBAT Tree */}
                <Card className="w-72 shrink-0 border-border/50 bg-card/80 backdrop-blur-sm flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4 text-primary" />
                      ORBAT Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-2 overflow-hidden">
                    <ScrollArea className="h-full">
                      <OrbatTreeNode
                        node={orbat}
                        selectedId={selectedOrbatId}
                        onSelect={(id) => setSelectedOrbatId(id)}
                        onAdd={addNodeToOrbat}
                        onRename={renameNode}
                        onDelete={deleteNode}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Right: Form + Table */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  {/* Trainee Form */}
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <UserPlus className="h-4 w-4 text-primary" />
                        Add Trainee
                        <span className="ml-auto text-xs text-muted-foreground font-mono">
                          ORBAT: {getNodeLabel(orbat, selectedOrbatId) || "Select a node"}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Photo Upload */}
                        <div className="space-y-1 row-span-2">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Photo</label>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
                          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoFile} />
                          <div className="flex flex-col items-center gap-2">
                            <motion.div
                              className="relative h-20 w-20 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer group"
                              whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary))" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {traineePhoto ? (
                                <>
                                  <img src={traineePhoto} alt="Trainee" className="h-full w-full object-cover" />
                                  <motion.div
                                    className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Edit2 className="h-4 w-4 text-foreground" />
                                  </motion.div>
                                </>
                              ) : (
                                <ImagePlus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                              )}
                            </motion.div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => fileInputRef.current?.click()}>
                                <ImagePlus className="h-3 w-3" /> Browse
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => cameraInputRef.current?.click()}>
                                <Camera className="h-3 w-3" /> Camera
                              </Button>
                            </div>
                            {traineePhoto && (
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-destructive" onClick={() => setTraineePhoto(undefined)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Trainee Number</label>
                          <Input value={traineeNumber} onChange={(e) => setTraineeNumber(e.target.value)} placeholder="Enter number" className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Rank</label>
                          <Select value={traineeRank} onValueChange={setTraineeRank}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select rank" /></SelectTrigger>
                            <SelectContent>{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Shoulder Badge</label>
                          {traineeRank ? <RankBadge rank={traineeRank} /> : <div className="h-10 rounded-lg border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">Select rank</div>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Trainee Name</label>
                          <Input value={traineeName} onChange={(e) => setTraineeName(e.target.value)} placeholder="Enter name" className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Firer Master Hand</label>
                          <Select value={firerHand} onValueChange={setFirerHand}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{FIRER_HANDS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Weapon</label>
                          <Select value={weapon} onValueChange={setWeapon}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{WEAPONS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={addTrainee} className="gap-2" size="sm">
                          <Plus className="h-3.5 w-3.5" /> Add Trainee
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trainee Table */}
                  <Card className="flex-1 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="h-4 w-4 text-primary" />
                        Trainees
                        <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                          {filteredTrainees.length}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                      <ScrollArea className="flex-1">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/30">
                              <TableHead className="text-xs font-mono w-12">SNo</TableHead>
                              <TableHead className="text-xs font-mono w-12">Photo</TableHead>
                              <TableHead className="text-xs font-mono">Number</TableHead>
                              <TableHead className="text-xs font-mono">Rank</TableHead>
                              <TableHead className="text-xs font-mono">Name</TableHead>
                              <TableHead className="text-xs font-mono">Hand</TableHead>
                              <TableHead className="text-xs font-mono">Weapon</TableHead>
                              <TableHead className="text-xs font-mono">ORBAT</TableHead>
                              <TableHead className="text-xs font-mono w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {paginatedTrainees.map((t, i) => (
                                <motion.tr
                                  key={t.id}
                                  className="border-border/20 hover:bg-muted/30 cursor-pointer"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  transition={{ delay: i * 0.03 }}
                                >
                                  <TableCell className="font-mono text-sm text-muted-foreground">{t.sno}</TableCell>
                                  <TableCell>
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={t.photo} />
                                      <AvatarFallback className="text-[10px] bg-muted/50">{t.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                    </Avatar>
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">{t.traineeNumber}</TableCell>
                                  <TableCell className="text-sm">{t.rank}</TableCell>
                                  <TableCell className="text-sm font-medium">{t.name}</TableCell>
                                  <TableCell className="text-sm">{t.firerMasterHand}</TableCell>
                                  <TableCell className="text-sm">{t.weapon}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">{t.orbatLabel}</TableCell>
                                  <TableCell>
                                    <motion.button
                                      onClick={() => deleteTrainee(t.id)}
                                      className="p-1 rounded hover:bg-destructive/20"
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </motion.button>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                            {filteredTrainees.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                                  No trainees in selected ORBAT node
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border/30 px-4 py-2">
                          <span className="text-xs text-muted-foreground">
                            Page {safePage} of {totalPages} · {filteredTrainees.length} trainees
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              disabled={safePage <= 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={page === safePage ? "default" : "ghost"}
                                size="sm"
                                className="h-7 w-7 p-0 text-xs"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              disabled={safePage >= totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="exercise"
                className="h-full flex gap-4 p-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Exercise Tree */}
                <Card className="w-80 shrink-0 border-border/50 bg-card/80 backdrop-blur-sm flex flex-col">
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
                </Card>

                {/* Exercise Details */}
                <div className="flex-1 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {selectedExerciseName ? (
                      <motion.div
                        key={selectedExercise}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center"
                      >
                        <Card className="border-border/50 bg-card/80 backdrop-blur-sm max-w-md">
                          <CardContent className="p-8">
                            <motion.div
                              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10"
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 4, repeat: Infinity }}
                            >
                              <Crosshair className="h-8 w-8 text-primary" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-foreground mb-2">{selectedExerciseName}</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                              Configure and launch this exercise for your trainees
                            </p>
                            <Button className="gap-2" size="lg">
                              <Target className="h-4 w-4" /> Start Exercise
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground"
                      >
                        <Crosshair className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Select an exercise from the tree</p>
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
