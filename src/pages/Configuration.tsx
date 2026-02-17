import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Trash2, Edit2, Check, X, ChevronRight, ChevronDown,
  UserPlus, Crosshair, Folder, FolderOpen,
  Shield, Anchor, Plane, Building2, Camera, ImagePlus,
  Wrench, Target,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft } from "lucide-react";

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
  photo?: string;
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

let nextId = 200;
const genId = () => `cfg_${nextId++}`;

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
          <linearGradient id={`cfg-badge-${rank}`} x1="0" y1="0" x2="1" y2="0">
            {badge.colors.map((c, i) => (
              <stop key={i} offset={`${(i / (badge.colors.length - 1 || 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <rect x="2" y="6" width="56" height="12" rx="3" fill={`url(#cfg-badge-${rank})`} stroke="hsl(45,60%,50%)" strokeWidth="0.5" />
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
  node, depth = 0, selectedId, onSelect, onAdd, onRename, onDelete,
}: {
  node: OrbatNode; depth?: number; selectedId: string;
  onSelect: (id: string) => void; onAdd: (parentId: string) => void;
  onRename: (id: string, newName: string) => void; onDelete: (id: string) => void;
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
        className={`group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-all text-sm ${
          isSelected ? "bg-primary/15 text-primary border border-primary/30" : "hover:bg-muted/60 text-foreground border border-transparent"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => { onSelect(node.id); if (hasChildren) setExpanded(!expanded); }}
        whileHover={{ x: 2 }}
      >
        {hasChildren ? (expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />) : <div className="w-3.5" />}
        {node.type === "branch" ? <BranchIcon className="h-4 w-4 shrink-0 text-primary" /> : expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-accent" /> : <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />}
        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-5 text-xs px-1 py-0" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") { onRename(node.id, editName); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
              onClick={(e) => e.stopPropagation()} />
            <Check className="h-3 w-3 text-primary cursor-pointer" onClick={(e) => { e.stopPropagation(); onRename(node.id, editName); setEditing(false); }} />
            <X className="h-3 w-3 text-destructive cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditing(false); }} />
          </div>
        ) : (
          <span className="truncate flex-1 text-sm font-medium">{node.name}</span>
        )}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
          {canAdd && <motion.button className="p-0.5 rounded hover:bg-primary/20" onClick={(e) => { e.stopPropagation(); onAdd(node.id); }} whileTap={{ scale: 0.9 }}><Plus className="h-3 w-3 text-primary" /></motion.button>}
          {canEdit && <motion.button className="p-0.5 rounded hover:bg-accent/20" onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(node.name); }} whileTap={{ scale: 0.9 }}><Edit2 className="h-3 w-3 text-accent" /></motion.button>}
          {canDelete && <motion.button className="p-0.5 rounded hover:bg-destructive/20" onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} whileTap={{ scale: 0.9 }}><Trash2 className="h-3 w-3 text-destructive" /></motion.button>}
        </div>
      </motion.div>
      <AnimatePresence>
        {expanded && node.children.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            {node.children.map((child) => (
              <OrbatTreeNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onRename={onRename} onDelete={onDelete} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-tab content components ---
const TraineeCreation = () => {
  const [orbat, setOrbat] = useState<OrbatNode>(createDefaultOrbat);
  const [selectedOrbatId, setSelectedOrbatId] = useState("army");
  const [traineeNumber, setTraineeNumber] = useState("");
  const [traineeRank, setTraineeRank] = useState("");
  const [traineeName, setTraineeName] = useState("");
  const [firerHand, setFirerHand] = useState("Right Hand Firer");
  const [weapon, setWeapon] = useState("9mm PISTOL");
  const [trainees, setTrainees] = useState<Trainee[]>(createDummyTrainees);
  const [traineePhoto, setTraineePhoto] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const findNode = useCallback((root: OrbatNode, id: string): OrbatNode | null => {
    if (root.id === id) return root;
    for (const child of root.children) { const found = findNode(child, id); if (found) return found; }
    return null;
  }, []);

  const getNodeLabel = useCallback((root: OrbatNode, id: string, path: string[] = []): string => {
    if (root.id === id) return [...path, root.name].join(" > ");
    for (const child of root.children) { const result = getNodeLabel(child, id, [...path, root.name]); if (result) return result; }
    return "";
  }, []);

  const traineeMatchesOrbat = useCallback((trainee: Trainee): boolean => {
    return trainee.orbatPath.includes(selectedOrbatId);
  }, [selectedOrbatId]);

  const filteredTrainees = trainees.filter(traineeMatchesOrbat);
  const totalPages = Math.max(1, Math.ceil(filteredTrainees.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTrainees = filteredTrainees.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  let snoCounter = trainees.length > 0 ? Math.max(...trainees.map(t => t.sno)) + 1 : 1;

  const addNodeToOrbat = useCallback((parentId: string) => {
    setOrbat(prev => {
      const clone = JSON.parse(JSON.stringify(prev)) as OrbatNode;
      const parent = findNode(clone, parentId);
      if (!parent) return prev;
      const childType = ORBAT_CHILD_TYPE[parent.type];
      if (!childType) return prev;
      parent.children.push({ id: genId(), name: `New ${childType.charAt(0).toUpperCase() + childType.slice(1)}`, type: childType, children: [] });
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

  const getOrbatPath = useCallback((root: OrbatNode, targetId: string, current: string[] = []): string[] | null => {
    if (root.id === targetId) return [...current, root.id];
    for (const child of root.children) { const result = getOrbatPath(child, targetId, [...current, root.id]); if (result) return result; }
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
    setTrainees(prev => [...prev, { id: genId(), sno: snoCounter, traineeNumber, rank: traineeRank, name: traineeName, firerMasterHand: firerHand, weapon, orbatPath: path, orbatLabel: label, photo: traineePhoto }]);
    setTraineeNumber(""); setTraineeName(""); setTraineePhoto(undefined);
  };

  const deleteTrainee = (id: string) => setTrainees(prev => prev.filter(t => t.id !== id));

  return (
    <div className="h-full flex gap-4 p-5">
      {/* Left: ORBAT Tree */}
      <div className="w-72 shrink-0 glass-tile rounded-2xl flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-status-info" />
            ORBAT Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-2 overflow-hidden">
          <ScrollArea className="h-full">
            <OrbatTreeNode node={orbat} selectedId={selectedOrbatId} onSelect={(id) => setSelectedOrbatId(id)} onAdd={addNodeToOrbat} onRename={renameNode} onDelete={deleteNode} />
          </ScrollArea>
        </CardContent>
      </div>

      {/* Right: Form + Table */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Trainee Form */}
        <div className="glass-tile rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-status-warning" />
              Add Trainee
              <span className="ml-auto text-xs text-muted-foreground font-mono">
                ORBAT: {getNodeLabel(orbat, selectedOrbatId) || "Select a node"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1 row-span-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Photo</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoFile} />
                <div className="flex flex-col items-center gap-2">
                  <motion.div className="relative h-20 w-20 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer group"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => fileInputRef.current?.click()}>
                    {traineePhoto ? (
                      <><img src={traineePhoto} alt="Trainee" className="h-full w-full object-cover" />
                        <motion.div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="h-4 w-4 text-foreground" /></motion.div></>
                    ) : (<ImagePlus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />)}
                  </motion.div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => fileInputRef.current?.click()}><ImagePlus className="h-3 w-3" /> Browse</Button>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => cameraInputRef.current?.click()}><Camera className="h-3 w-3" /> Camera</Button>
                  </div>
                  {traineePhoto && <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-destructive" onClick={() => setTraineePhoto(undefined)}>Remove</Button>}
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
              <Button onClick={addTrainee} className="gap-2" size="sm"><Plus className="h-3.5 w-3.5" /> Add Trainee</Button>
            </div>
          </CardContent>
        </div>

        {/* Trainee Table */}
        <div className="flex-1 glass-tile rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-status-info" />
              Trainees
              <span className="ml-2 rounded-md bg-status-info/10 px-2 py-0.5 font-mono text-xs text-status-info">{filteredTrainees.length}</span>
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
                      <motion.tr key={t.id} className="border-border/20 hover:bg-muted/30 cursor-pointer"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}>
                        <TableCell className="font-mono text-sm text-muted-foreground">{t.sno}</TableCell>
                        <TableCell>
                          <Avatar className="h-8 w-8"><AvatarImage src={t.photo} /><AvatarFallback className="text-[10px] bg-muted/50">{t.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{t.traineeNumber}</TableCell>
                        <TableCell className="text-sm">{t.rank}</TableCell>
                        <TableCell className="text-sm font-medium">{t.name}</TableCell>
                        <TableCell className="text-sm">{t.firerMasterHand}</TableCell>
                        <TableCell className="text-sm">{t.weapon}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">{t.orbatLabel}</TableCell>
                        <TableCell>
                          <motion.button onClick={() => deleteTrainee(t.id)} className="p-1 rounded hover:bg-destructive/20" whileTap={{ scale: 0.9 }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </motion.button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredTrainees.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No trainees in selected ORBAT node</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/30 px-4 py-2">
                <span className="text-xs text-muted-foreground">Page {safePage} of {totalPages} · {filteredTrainees.length} trainees</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button key={page} variant={page === safePage ? "default" : "ghost"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setCurrentPage(page)}>{page}</Button>
                  ))}
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
};

const ArcTool = () => {
  const [weapon, setWeapon] = useState("9mm PISTOL");
  const [rangeCourse, setRangeCourse] = useState("9mm Pistol Range Course");
  const [courseType, setCourseType] = useState("Preliminary Marksmanship");
  const [practiceType, setPracticeType] = useState("");
  const [firingPosition, setFiringPosition] = useState("SU (Standing Unsupported)");
  const [rangeMeters, setRangeMeters] = useState(25);
  const [exerciseBehaviour, setExerciseBehaviour] = useState("Grouping");
  const [ammunition, setAmmunition] = useState(5);
  const [ammoType, setAmmoType] = useState("BALL");
  const [selectedTarget, setSelectedTarget] = useState("Fig 11");
  const [settingsMode, setSettingsMode] = useState<"advance" | "scoring">("scoring");
  const [groupSize, setGroupSize] = useState(20);
  const [illumination, setIllumination] = useState(false);
  const [illuminationType, setIlluminationType] = useState("");
  const [intervalVal, setIntervalVal] = useState(1);
  const [rounds, setRounds] = useState(1);
  const [rangeVal, setRangeVal] = useState(20);
  const [remarks, setRemarks] = useState("");

  interface ArcExercise {
    id: number; practiceType: string; position: string; range: number; target: string; ammunition: number; groupSize: number; remarks: string; ammoType: string;
  }
  const [exercises, setExercises] = useState<ArcExercise[]>([
    { id: 1, practiceType: "Introductory Shoot", position: "SU (Standing Unsupported)", range: 10, target: "Zeroing Target 120 Cms", ammunition: 5, groupSize: 20, remarks: "To be fired once only during the exercise", ammoType: "BALL" },
  ]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(1);

  const ARC_WEAPONS = ["9mm PISTOL", "5.56mm INSAS Rifle", "5.56mm INSAS LMG", "7.62mm Sig 716", "7.62mm SLR", "40mm MGL", "AK-47"];
  const COURSE_TYPES = ["Preliminary Marksmanship", "Annual Range Course", "Battle Inoculation", "Advanced Combat", "Refresher Course"];
  const FIRING_POSITIONS = ["SU (Standing Unsupported)", "SS (Standing Supported)", "KU (Kneeling Unsupported)", "KS (Kneeling Supported)", "PU (Prone Unsupported)", "PS (Prone Supported)"];
  const BEHAVIOURS = ["Grouping", "Zeroing", "Application", "Snap Shooting", "Moving Target"];
  const ARC_AMMO_TYPES = ["BALL", "TRACER", "BLANK", "AP"];
  const TARGETS_LIST = ["Fig 11", "Fig 12", "Fig 13", "Fig 14", "Zeroing Target 120 Cms", "Bull's Eye", "Chaung Target"];
  const ILLUMINATION_TYPES = ["Flare", "Searchlight", "NVD", "Ambient"];

  const addExercise = () => {
    const newEx: ArcExercise = {
      id: Date.now(), practiceType: practiceType || "New Exercise", position: firingPosition,
      range: rangeMeters, target: selectedTarget, ammunition, groupSize, remarks, ammoType,
    };
    setExercises(prev => [...prev, newEx]);
  };

  const deleteExercise = () => {
    if (selectedExerciseId) setExercises(prev => prev.filter(e => e.id !== selectedExerciseId));
    setSelectedExerciseId(null);
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Main fields */}
        <div className="flex-1 glass-tile rounded-2xl p-5 space-y-3 overflow-auto">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <Wrench className="h-4 w-4 text-status-info" /> Exercise Configuration
          </h3>
          <div className="grid grid-cols-[180px_1fr] gap-y-2.5 gap-x-4 items-center">
            <label className="text-xs font-medium text-muted-foreground">Select Weapon</label>
            <Select value={weapon} onValueChange={setWeapon}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{ARC_WEAPONS.map(w => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-xs font-medium text-muted-foreground">Select Range Course</label>
            <div className="flex gap-2">
              <Select value={rangeCourse} onValueChange={setRangeCourse}>
                <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="9mm Pistol Range Course" className="text-xs">9mm Pistol Range Course</SelectItem>
                  <SelectItem value="5.56mm Rifle Range Course" className="text-xs">5.56mm Rifle Range Course</SelectItem>
                  <SelectItem value="7.62mm Range Course" className="text-xs">7.62mm Range Course</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 text-xs px-3">New</Button>
            </div>

            <label className="text-xs font-medium text-muted-foreground">Select Course Type</label>
            <Select value={courseType} onValueChange={setCourseType}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{COURSE_TYPES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-xs font-medium text-muted-foreground">Type of Practice</label>
            <Input value={practiceType} onChange={e => setPracticeType(e.target.value)} className="h-8 text-xs" placeholder="Enter practice type" />

            <label className="text-xs font-medium text-muted-foreground">Select Firing Position</label>
            <Select value={firingPosition} onValueChange={setFiringPosition}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{FIRING_POSITIONS.map(f => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-xs font-medium text-muted-foreground">Range (mtrs)</label>
            <Input type="number" value={rangeMeters} onChange={e => setRangeMeters(parseInt(e.target.value) || 0)} className="h-8 text-xs w-32 font-mono" />

            <label className="text-xs font-medium text-muted-foreground">Select Exercise Behaviour</label>
            <Select value={exerciseBehaviour} onValueChange={setExerciseBehaviour}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{BEHAVIOURS.map(b => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-xs font-medium text-muted-foreground">Ammunition</label>
            <Input type="number" value={ammunition} onChange={e => setAmmunition(parseInt(e.target.value) || 0)} className="h-8 text-xs w-32 font-mono" />

            <label className="text-xs font-medium text-muted-foreground">Select Ammunition Type</label>
            <Select value={ammoType} onValueChange={setAmmoType}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{ARC_AMMO_TYPES.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}</SelectContent>
            </Select>

            <label className="text-xs font-medium text-muted-foreground">Select Target</label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{TARGETS_LIST.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Settings panel */}
        <div className="w-80 shrink-0 glass-tile rounded-2xl p-5 space-y-4 overflow-auto">
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={settingsMode === "advance"} onChange={() => setSettingsMode("advance")} className="accent-primary" />
              <span className="text-xs font-medium text-foreground">Advance Settings</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={settingsMode === "scoring"} onChange={() => setSettingsMode("scoring")} className="accent-primary" />
              <span className="text-xs font-medium text-foreground">Scoring System</span>
            </label>
          </div>

          {settingsMode === "scoring" && (
            <div className="glass-tile rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground border-b border-border/30 pb-2">Scoring System</h4>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-28">Group Size (cms)</label>
                <Input type="number" value={groupSize} onChange={e => setGroupSize(parseInt(e.target.value) || 0)} className="h-7 text-xs w-20 font-mono" />
              </div>
            </div>
          )}

          {settingsMode === "advance" && (
            <div className="glass-tile rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground border-b border-border/30 pb-2">Advance Settings</h4>
              <p className="text-xs text-muted-foreground">Advanced configuration options for this exercise.</p>
            </div>
          )}

          <div className="glass-tile rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={illumination} onCheckedChange={(v) => setIllumination(!!v)} />
              <span className="text-xs font-medium text-foreground">Illumination</span>
            </label>
            {illumination && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-28">Illumination type</label>
                <Select value={illuminationType} onValueChange={setIlluminationType}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{ILLUMINATION_TYPES.map(i => <SelectItem key={i} value={i} className="text-xs">{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground w-28">Interval</label>
              <Input type="number" value={intervalVal} onChange={e => setIntervalVal(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} className="h-7 text-xs w-16 font-mono" />
              <span className="text-[10px] text-muted-foreground">1-10 sec</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground w-28">Rounds</label>
              <Input type="number" value={rounds} onChange={e => setRounds(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} className="h-7 text-xs w-16 font-mono" />
              <span className="text-[10px] text-muted-foreground">1-10</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground w-28">Range</label>
              <Input type="number" value={rangeVal} onChange={e => setRangeVal(parseInt(e.target.value) || 0)} className="h-7 text-xs w-16 font-mono" />
            </div>
          </div>

          <div className="glass-tile rounded-xl p-4">
            <label className="text-xs font-medium text-foreground mb-2 block">Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full h-16 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
        </div>
      </div>

      {/* Bottom: Exercise table */}
      <div className="glass-tile rounded-2xl flex flex-col min-h-[180px]">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30">
                <TableHead className="text-[10px] w-8"></TableHead>
                <TableHead className="text-[10px]">Type of Practice</TableHead>
                <TableHead className="text-[10px]">Position</TableHead>
                <TableHead className="text-[10px]">Range (mtrs)</TableHead>
                <TableHead className="text-[10px]">Type of Target</TableHead>
                <TableHead className="text-[10px]">Ammunition</TableHead>
                <TableHead className="text-[10px]">Group Size (cms)</TableHead>
                <TableHead className="text-[10px]">Remarks</TableHead>
                <TableHead className="text-[10px]">Ammo Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map(ex => (
                <TableRow key={ex.id} className={`cursor-pointer transition-colors ${selectedExerciseId === ex.id ? "bg-primary/10 border-primary/30" : "hover:bg-secondary/30"}`}
                  onClick={() => setSelectedExerciseId(ex.id)}>
                  <TableCell><Checkbox checked={selectedExerciseId === ex.id} /></TableCell>
                  <TableCell className="text-xs">{ex.practiceType}</TableCell>
                  <TableCell className="text-xs">{ex.position}</TableCell>
                  <TableCell className="text-xs font-mono">{ex.range}</TableCell>
                  <TableCell className="text-xs">{ex.target}</TableCell>
                  <TableCell className="text-xs font-mono">{ex.ammunition}</TableCell>
                  <TableCell className="text-xs font-mono">{ex.groupSize}</TableCell>
                  <TableCell className="text-xs truncate max-w-[180px]">{ex.remarks}</TableCell>
                  <TableCell className="text-xs">{ex.ammoType}</TableCell>
                </TableRow>
              ))}
              {exercises.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-xs text-muted-foreground py-6">No exercises configured</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="flex items-center justify-center gap-3 border-t border-border/30 px-4 py-3">
          <Button onClick={addExercise} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Exercise
          </Button>
          <Button onClick={deleteExercise} variant="outline" size="sm" className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Edit2 className="h-3.5 w-3.5" /> Update
          </Button>
        </div>
      </div>
    </div>
  );
};

const TargetWeapon = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="glass-tile-elevated rounded-2xl max-w-md text-center p-8">
      <motion.div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-status-warning/30 bg-status-warning/10"
        animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        <Target className="h-8 w-8 text-status-warning" />
      </motion.div>
      <h2 className="text-xl font-bold text-foreground mb-2">Target & Weapon</h2>
      <p className="text-sm text-muted-foreground">Manage target configurations and weapon profiles for simulation exercises.</p>
    </div>
  </div>
);

// --- Main Configuration Component ---
const Configuration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"trainee" | "arc" | "target">("trainee");

  const tabs = [
    { id: "trainee" as const, label: "Trainee Creation", icon: UserPlus, color: "text-status-warning" },
    { id: "arc" as const, label: "ARC Tool", icon: Wrench, color: "text-status-info" },
    { id: "target" as const, label: "Target & Weapon", icon: Target, color: "text-status-online" },
  ];

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
              <motion.button onClick={() => navigate("/mission")} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Mission</motion.button>
              <motion.button className="rounded-lg px-3 py-1.5 text-sm text-primary bg-primary/10 border border-primary/20 font-semibold" whileTap={{ scale: 0.95 }}>Configuration</motion.button>
            </nav>
          </div>
        </div>
        {/* Sub-tabs */}
        <div className="px-6 py-2 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab.id ? `bg-secondary/80 border border-border/60 ${tab.color}` : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "trainee" && (
              <motion.div key="trainee" className="h-full" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <TraineeCreation />
              </motion.div>
            )}
            {activeTab === "arc" && (
              <motion.div key="arc" className="h-full flex" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <ArcTool />
              </motion.div>
            )}
            {activeTab === "target" && (
              <motion.div key="target" className="h-full flex" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <TargetWeapon />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
