import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

const ICON_LIST = {
  User: User,
  Users: Users,
  ShieldCheck: ShieldCheck,
  ShieldAlert: ShieldAlert,
  UserCog: UserCog,
  Contact: Contact,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  Microscope: Microscope,
  Stethoscope: Stethoscope,
  Headset: Headset,
  Construction: Construction,
  ShoppingBag: ShoppingBag,
  Truck: Truck,
  ChefHat: ChefHat,
  Coffee: Coffee,
  Plane: Plane,
  HeartPulse: HeartPulse,
  Hammer: Hammer,
  Wrench: Wrench,
  Camera: Camera,
  MapPin: MapPin,
  Bell: Bell,
  Activity: Activity,
  Database: Database,
  Star: Star,
  Crown: Crown,
  Zap: Zap,
  Flame: Flame,
  Sparkles: Sparkles,
  Gem: Gem,
  Diamond: Diamond,
  Medal: Medal,
  Award: Award,
  Trophy: Trophy,
  Target: Target,
  Crosshair: Crosshair,
  Focus: Focus,
  Home: Home,
  House: House,
  Building: Building,
  Store: Store,
  Factory: Factory,
  Warehouse: Warehouse,
  Car: Car,
  Bike: Bike,
  Bus: Bus,
  Train: Train,
  Ship: Ship,
  Rocket: Rocket,
  Book: Book,
  BookOpen: BookOpen,
  Library: Library,
  FileText: FileText,
  File: File,
  Folder: Folder,
  FolderOpen: FolderOpen,
  Music: Music,
  Radio: Radio,
  Headphones: Headphones,
  Guitar: Guitar,
  Piano: Piano,
  Gamepad2: Gamepad2,
  Joystick: Joystick,
  Puzzle: Puzzle,
  Sun: Sun,
  Moon: Moon,
  Cloud: Cloud,
  CloudRain: CloudRain,
  Snowflake: Snowflake,
  Trees: Trees,
  Leaf: Leaf,
  Flower: Flower,
  Sprout: Sprout,
  Mountain: Mountain,
  Heart: Heart,
  Smile: Smile,
  Laugh: Laugh,
  Frown: Frown,
  Meh: Meh,
  Hand: Hand,
  Handshake: Handshake,
  ThumbsUp: ThumbsUp,
  ThumbsDown: ThumbsDown,
  Lock: Lock,
  Unlock: Unlock,
  Key: Key,
  Shield: Shield,
  ShieldX: ShieldX,
  Globe2: Globe2,
  Earth: Earth,
  Compass: Compass,
  Navigation: Navigation,
  Clock2: Clock2,
  Timer: Timer,
  Hourglass: Hourglass,
  DollarSign: DollarSign,
  Euro: Euro,
  PoundSterling: PoundSterling,
  Coins: Coins,
  Smartphone: Smartphone,
  Laptop: Laptop,
  Monitor: Monitor,
  Tablet: Tablet,
  Tv: Tv,
  Pizza: Pizza,
  Cake: Cake,
  Cookie: Cookie,
  IceCream: IceCream,
  Shirt: Shirt,
  Glasses: Glasses,
  Baby: Baby,
  UserCircle: UserCircle,
  UserCheck: UserCheck,
  UserX: UserX,
  ArrowUp: ArrowUp,
  ArrowDown: ArrowDown,
  ArrowLeft: ArrowLeft,
  ArrowRight: ArrowRight,
  ArrowUpRight: ArrowUpRight,
  ArrowUpLeft: ArrowUpLeft,
  Circle: Circle,
  Square: Square,
  Triangle: Triangle,
  Hexagon: Hexagon,
  Octagon: Octagon,
  CheckCircle: CheckCircle,
  XCircle: XCircle,
  AlertTriangle: AlertTriangle,
  Info: Info,
  HelpIcon: HelpIcon,
  Lightning: Lightning,
  Fire: Fire,
  Magic: Magic
};

export interface ClienteData {
  id_cliente?: number;
  codigo_cliente?: string;
  nome_cliente?: string;
  nome_abreviado?: string;
  uf?: string;
  cidade?: string;
  userId?: number;
  [key: string]: unknown;
}
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/auth-context-core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  UserPlus, Trash2, MapPin, Loader2, LogOut, Plus, Map, X, Check, ChevronDown,
  Search, Pencil, Save, Users, ShieldCheck, User,
  LayoutDashboard, Bell, ScrollText, UsersRound, Briefcase, Send, Eye, EyeOff,
  Building2, Filter, RefreshCw, ChevronRight, MessageSquare, Globe, Activity,
  TrendingUp, AlertCircle, BadgeCheck, Palette, Upload, ImageOff, Download, Truck, Settings,
  Database, Layers, Grid3X3, Calendar, FileSpreadsheet, Camera, Percent, Mail, Phone, MapPinned,
  Route, BarChart2, ShieldAlert, UserCog, Contact, GraduationCap, Microscope, Stethoscope,
  Headset, Construction, ShoppingBag, ChefHat, Coffee, Plane, HeartPulse, Hammer, Wrench, LucideIcon,
  Users2, Package, History as HistoryIcon,
  Menu, Clock, HelpCircle,
  Star, Crown, Zap, Flame, Sparkles, Gem, Diamond, Medal, Award, Trophy,
  Target, Crosshair, Focus,
  Home, House, Building, Store, Factory, Warehouse,
  Car, Bike, Bus, Train, Ship, Rocket,
  Book, BookOpen, Library, FileText, File, Folder, FolderOpen,
  Music, Radio, Headphones, Guitar, Piano,
  Gamepad2, Joystick, Puzzle,
  Sun, Moon, Cloud, CloudRain, Snowflake,
  Trees, Leaf, Flower, Sprout, Mountain,
  Heart, Smile, Laugh, Frown, Meh,
  Hand, Handshake, ThumbsUp, ThumbsDown,
  Lock, Unlock, Key, Shield, ShieldX,
  Globe2, Earth, Compass, Navigation,
  Clock2, Timer, Hourglass,
  DollarSign, Euro, PoundSterling, Coins,
  Smartphone, Laptop, Monitor, Tablet, Tv,
  Pizza, Cake, Cookie, IceCream,
  Shirt, Glasses,
  Baby, UserCircle, UserCheck, UserX,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ArrowUpLeft,
  Circle, Square, Triangle, Hexagon, Octagon,
  CheckCircle, CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle as HelpIcon,
  Zap as Lightning, Flame as Fire, Sparkles as Magic,
  Hash
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import Loader from '@/components/Loader';
import { REP_COLOR_PALETTE, getNextColorIndex, getRepColor, type SystemUser } from '@/data/representatives';
import { UF_DATA } from '@/data/uf-codes';

import { BaseClientePanel } from '../components/admin/rotas/BaseClientePanel';
import { SupervisorRoutesPanel } from '../components/admin/rotas/SupervisorRoutesPanel';
import { VisitScheduler } from '../components/admin/rotas/VisitScheduler';
import { HelpDocumentation } from '@/components/help/HelpDocumentation';
import { DataConnectionsPanel } from '@/components/admin/data-connections/DataConnectionsPanel';
const MiniMapBrasil = React.lazy(() => import('../components/admin/MiniMapBrasil'));
import { AuditLogsPanel } from '../components/admin/AuditLogsPanel';
import { SystemConfigPanel } from '../components/admin/SystemConfigPanel';
import UserProfileManager from '../components/admin/users/UserProfileManager';
import ProfileImageCropper from '../components/admin/users/ProfileImageCropper';
import SpaceButton from '../components/admin/SpaceButton';
import { API_BASE_URL } from '@/lib/api-base';
import {
  deriveParentActiveBg,
  deriveSidebarHoverBg,
  isLegacyGreenSidebarColor,
} from '@/lib/sidebar-colors';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Territory { 
  id: number; 
  municipio: string; 
  uf: string; 
  modo: string; 
  userId?: number; 
  userIds?: number[]; 
  clientCount?: number; 
}

interface UserType {
  id: number;
  name: string;
  color: string;
  icon: string;
  showInMenu: boolean;
  active: boolean;
  isAdmin: boolean;
  isSystemDefault: boolean;
  createdAt: string;
  canVisit?: boolean;
}

interface Group { id: string; name: string; userIds: number[]; createdAt: string; }
interface SystemNotification { id: number; title: string; message: string; createdAt: string; targetAll?: boolean; targetUserIds?: number[]; seen?: boolean; }
interface AuditLog { id: string; action: string; entity: string; entityId: string; details: string; uf?: string; municipio?: string; performedBy: string; timestamp: string; ipAddress?: string; }
interface ModulePermission { userId: number; moduleId: string; canView: boolean; canEdit: boolean; }

type TabId = 'dashboard' | 'ajuda' | 'users' | 'territories' | 'groups' | 'notifications' | 'audit' | 'personal' | 'rotas' | 'baserotas' | 'clusters' | 'blocos' | 'roteiros' | 'agenda' | 'densidade' | 'cycles' | 'roteiro_seq' | 'resumo_roteiro' | 'user_types' | 'system' | 'reps' | 'visitas' | 'visitas_agendar' | 'data-connections' | 'etl-runs' | 'clientes-versions' | `user_type_${number}`;

interface NavItem {
  id: TabId | 'settings' | 'rotas_menu' | 'users_menu' | 'visitas_menu' | 'ajuda';
  label: string;
  icon: React.ElementType;
  count?: number;
  badge?: boolean;
  restrict?: string[];
  subItems?: { id: TabId; label: string; icon: React.ElementType; count?: number; }[];
}

const API = API_BASE_URL;
const IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades';
const NOTIF_FONT_WHITELIST = ['inter', 'roboto', 'open-sans', 'lato', 'montserrat', 'poppins', 'nunito', 'source-sans', 'merriweather', 'playfair'];
const NOTIF_SIZE_WHITELIST = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

const QuillFont = Quill.import('formats/font');
QuillFont.whitelist = NOTIF_FONT_WHITELIST;
Quill.register(QuillFont, true);
const QuillSize = Quill.import('attributors/style/size');
QuillSize.whitelist = NOTIF_SIZE_WHITELIST;
Quill.register(QuillSize, true);

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS = {
  get: <T,>(key: string, def: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: <T,>(key: string, val: T) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ } },
};

// ─── CPF / CNPJ mask ─────────────────────────────────────────────────────────
function maskDoc(val: string, type: 'cpf' | 'cnpj') {
  const d = val.replace(/\D/g, '');
  if (type === 'cpf') {
    return d.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, e) => e ? `${a}.${b}.${c}-${e}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a);
  }
  return d.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, a, b, c, e, f) => f ? `${a}.${b}.${c}/${e}-${f}` : e ? `${a}.${b}.${c}/${e}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a);
}

function maskPhone(val: string) {
  const d = val.replace(/\D/g, '');
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, a, b, c) => c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a})` : '');
  }
  return d.slice(0, 11).replace(/(\d{2})(\d{5})(\d{0,4})/, (_, a, b, c) => c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a})` : '');
}

function maskCEP(val: string) {
  const d = val.replace(/\D/g, '').slice(0, 8);
  return d.replace(/(\d{5})(\d{0,3})/, (_, a, b) => b ? `${a}-${b}` : a);
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder, disabled = false, loading = false }:
  { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; placeholder: string; disabled?: boolean; loading?: boolean; }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = React.useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => query ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())) : options, [options, query]);
  const selected = options.find(o => o.value === value);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" disabled={disabled || loading} onClick={() => { setOpen(!open); setQuery(''); }}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-background border rounded-md text-sm transition-colors ${disabled || loading ? 'opacity-50 cursor-not-allowed border-border' : 'border-input hover:border-primary/50 cursor-pointer'} ${open ? 'ring-1 ring-primary border-primary/50' : ''}`}>
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>{loading ? 'Carregando...' : (selected ? selected.label : placeholder)}</span>
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && (
        <div className="absolute z-[10000] w-full mt-1 bg-popover border border-border rounded-md shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-background rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? <li className="py-4 text-center text-xs text-muted-foreground">Nenhum resultado</li> :
              filtered.map(opt => (
                <li key={opt.value}>
                  <button type="button" className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2 ${opt.value === value ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                    onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}>
                    {opt.value === value && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span className={opt.value === value ? '' : 'pl-5'}>{opt.label}</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Custom Select (No Search) ────────────────────────────────────────────────
function CustomSelect({ options, value, onChange, placeholder, disabled = false, className = '' }:
  { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; placeholder: string; disabled?: boolean; className?: string; }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = options.find(o => String(o.value) === String(value));
  
  useEffect(() => { 
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; 
    document.addEventListener('mousedown', h); 
    return () => document.removeEventListener('mousedown', h); 
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button 
        type="button" 
        disabled={disabled} 
        onClick={() => setOpen(!open)}
        className={`w-full h-10 flex items-center justify-between px-3 py-2 bg-background border rounded-md text-sm transition-colors ${disabled ? 'opacity-50 cursor-not-allowed border-border' : 'border-border/50 hover:border-primary/50 cursor-pointer'} ${open ? 'ring-1 ring-primary border-primary/50' : ''}`}
      >
        <span className={selected ? 'text-foreground font-medium' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="absolute z-[100] w-full mt-1 bg-popover/95 backdrop-blur-md border border-border shadow-2xl rounded-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.map(opt => (
              <li key={opt.value}>
                <button 
                  type="button" 
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/80 flex items-center justify-between transition-colors ${String(opt.value) === String(value) ? 'text-primary bg-primary/10 font-bold' : 'text-foreground'}`}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                >
                  <span>{opt.label}</span>
                  {String(opt.value) === String(value) && <Check className="w-4 h-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ 
  displayPhoto, 
  displayName, 
  displayEmail, 
  displayTipo, 
  navItems, 
  activeTab, 
  setActiveTab, 
  expandedMenus, 
  setExpandedMenus,
  theme,
  sidebarBgColor,
  sidebarStyles
}: {
  displayPhoto: string;
  displayName: string;
  displayEmail: string;
  displayTipo: string;
  navItems: any[];
  activeTab: string;
  setActiveTab: (id: TabId) => void;
  expandedMenus: string[];
  setExpandedMenus: React.Dispatch<React.SetStateAction<string[]>>;
  theme: string;
  sidebarBgColor?: string;
  sidebarStyles: {
    textColor?: string;
    textActiveColor?: string;
    hoverColor?: string;
    activeBgColor?: string;
    parentActiveBgColor?: string;
  }
}) {
  const hasCustomSidebarBg = !!(sidebarBgColor && theme !== 'dark');
  const parentExplicit = sidebarStyles.parentActiveBgColor;
  const parentIsStaleGreen =
    hasCustomSidebarBg &&
    !!parentExplicit &&
    isLegacyGreenSidebarColor(parentExplicit) &&
    !isLegacyGreenSidebarColor(sidebarBgColor!);
  const resolvedParentActiveBg = parentIsStaleGreen
    ? deriveParentActiveBg(sidebarBgColor!)
    : parentExplicit || (hasCustomSidebarBg ? deriveParentActiveBg(sidebarBgColor!) : undefined);
  const resolvedHoverBg =
    sidebarStyles.hoverColor ||
    (hasCustomSidebarBg ? deriveSidebarHoverBg(sidebarBgColor!) : undefined);

  const isCustom =
    theme !== 'dark' &&
    (hasCustomSidebarBg ||
      sidebarStyles.textColor ||
      sidebarStyles.textActiveColor ||
      sidebarStyles.hoverColor ||
      sidebarStyles.activeBgColor ||
      sidebarStyles.parentActiveBgColor);

  return (
    <>
      {/* User Profile */}
      <div className="admin-sidebar-profile">
        <div className="admin-sidebar-avatar">
          {displayPhoto
            ? <img src={displayPhoto} alt={displayName} />
            : <User style={{ width: 28, height: 28 }} />
          }
        </div>
        <div className="flex flex-col items-center min-w-0">
          <p 
            className="admin-sidebar-username truncate w-full"
            style={isCustom && sidebarStyles.textColor ? { color: sidebarStyles.textColor } : {}}
          >
            {displayName.toUpperCase()}
          </p>
          <p 
            className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest truncate mt-0.5"
            style={isCustom && sidebarStyles.textColor ? { color: sidebarStyles.textColor, opacity: 0.7 } : {}}
          >
            {displayTipo}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isParentActive = item.subItems?.some((s: any) => s.id === activeTab);
          const isDirectActive = !item.subItems && activeTab === item.id;
          const isExpanded = expandedMenus.includes(item.id);

          const itemClass = [
            'admin-nav-item',
            isDirectActive ? 'active' : '',
            isParentActive ? 'parent-active' : '',
          ].filter(Boolean).join(' ');

          const customItemStyle = isCustom ? {
            ...(isDirectActive ? {
              color: sidebarStyles.textActiveColor || undefined,
              backgroundColor: sidebarStyles.activeBgColor || undefined,
            } : isParentActive ? {
              color: sidebarStyles.textActiveColor || undefined,
              backgroundColor: resolvedParentActiveBg || undefined,
            } : {
              color: sidebarStyles.textColor || undefined,
            }),
            '--nav-hover-bg': resolvedHoverBg || 'rgba(255,255,255,0.05)'
          } as any : {};

          return (
            <div key={item.id}>
              <button
                className={itemClass}
                style={customItemStyle}
                onClick={() => {
                  if (item.subItems) {
                    setExpandedMenus(prev =>
                      prev.includes(item.id) ? prev.filter(m => m !== item.id) : [...prev, item.id]
                    );
                  } else {
                    setActiveTab(item.id as TabId);
                  }
                }}
              >
                <Icon className="nav-icon" style={isCustom && (isDirectActive || isParentActive) && sidebarStyles.textActiveColor ? { color: sidebarStyles.textActiveColor } : {}} />
                <span className="nav-label">{item.label}</span>
                {item.count !== undefined && (
                  <span className={`admin-nav-badge${item.badge ? ' danger' : ''}`}>{item.count}</span>
                )}
                {item.subItems && (
                  <ChevronDown
                    style={{ 
                      width: 14, 
                      height: 14, 
                      flexShrink: 0, 
                      opacity: 0.6,
                      ...(isCustom && (isDirectActive || isParentActive) && sidebarStyles.textActiveColor ? { color: sidebarStyles.textActiveColor } : {})
                    }}
                    className={`admin-chevron${isExpanded ? ' open' : ''}`}
                  />
                )}
              </button>

              {item.subItems && isExpanded && (
                <div className="admin-nav-subitems">
                  {item.subItems.map((sub: any) => {
                    const SubIcon = sub.icon;
                    const subActive = activeTab === sub.id;

                    const customSubStyle = isCustom ? {
                      ...(subActive ? {
                        color: sidebarStyles.textActiveColor || undefined,
                        backgroundColor: sidebarStyles.activeBgColor || undefined,
                      } : {
                        color: sidebarStyles.textColor || undefined,
                      }),
                      '--nav-hover-bg': resolvedHoverBg || 'rgba(255,255,255,0.05)'
                    } as any : {};

                    return (
                      <button
                        key={sub.id}
                        className={`admin-nav-subitem${subActive ? ' active' : ''}`}
                        style={customSubStyle}
                        onClick={() => setActiveTab(sub.id)}
                      >
                        <SubIcon className="nav-icon" style={isCustom && subActive && sidebarStyles.textActiveColor ? { color: sidebarStyles.textActiveColor } : {}} />
                        <span style={{ flex: 1 }}>{sub.label}</span>
                        {sub.count !== undefined && (
                          <span className="admin-nav-badge">{sub.count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default function Admin() {
  const { token, logout, userId, tokenVersion, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const quillRef = React.useRef<ReactQuill | null>(null);

  // Security: redirect if no token
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // ── Core API data ──────────────────────────────────────────────────────────
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const reps = useMemo(() => users.filter(u => u.role === 'user' || u.role === 'supervisor'), [users]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [clientes, setClientes] = useState<ClienteData[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // ── Computed Territories ──────────────────────────────────────────────────
  const computedTerritories = useMemo(() => {
    const map = new globalThis.Map<string, { municipio: string, uf: string, userIds: Set<number>, clientCount: number }>();
    
    clientes.forEach(c => {
      if (!c.cidade || !c.uf) return;
      const city = c.cidade.trim();
      const uf = c.uf.trim().toUpperCase();
      const key = `${city}-${uf}`;

      if (!map.has(key)) map.set(key, { municipio: city, uf, userIds: new Set(), clientCount: 0 });
      const entry = map.get(key)!;
      entry.clientCount++;
      if (c.userId) entry.userIds.add(c.userId);
    });

    territories.forEach(t => {
      if (!t.uf) return;
      const city = t.municipio ? t.municipio.trim() : null;
      const uf = t.uf.trim().toUpperCase();
      const key = city ? `${city}-${uf}` : `STATE-${uf}`;
      
      if (!map.has(key)) {
        map.set(key, { municipio: city || '', uf, userIds: new Set(), clientCount: 0 });
      }
      if (t.userId) map.get(key)!.userIds.add(t.userId);
    });

    return Array.from(map.values()).map((t, idx) => ({
      id: idx,
      municipio: t.municipio,
      uf: t.uf,
      userIds: Array.from(t.userIds),
      clientCount: t.clientCount
    })).sort((a, b) => a.uf.localeCompare(b.uf) || a.municipio.localeCompare(b.municipio));
  }, [clientes, territories]);

  // ── Computed UF Stats ──────────────────────────────────────────────────
  const computedUFStats = useMemo(() => {
    const stats = new globalThis.Map<string, { 
      uf: string, 
      nome: string, 
      userIds: Set<number>, 
      clientCount: number, 
      municipios: globalThis.Map<string, { nome: string, userIds: Set<number>, clientCount: number }> 
    }>();
    
    UF_DATA.forEach(uf => {
      stats.set(uf.sigla, { 
        uf: uf.sigla, 
        nome: uf.nome, 
        userIds: new Set(), 
        clientCount: 0, 
        municipios: new globalThis.Map() 
      });
    });

    clientes.forEach(c => {
      if (!c.uf) return;
      const uf = c.uf.trim().toUpperCase();
      if (!stats.has(uf)) return;
      const entry = stats.get(uf)!;
      entry.clientCount++;
      if (c.userId) entry.userIds.add(c.userId);

      if (c.cidade) {
        const city = c.cidade.trim();
        if (!entry.municipios.has(city)) {
          entry.municipios.set(city, { nome: city, userIds: new Set(), clientCount: 0 });
        }
        const mEntry = entry.municipios.get(city)!;
        mEntry.clientCount++;
        if (c.userId) mEntry.userIds.add(c.userId);
      }
    });

    territories.forEach(t => {
      if (!t.uf) return;
      const uf = t.uf.trim().toUpperCase();
      if (!stats.has(uf)) return;
      const entry = stats.get(uf)!;
      if (t.userId) entry.userIds.add(t.userId);

      if (t.municipio) {
        const city = t.municipio.trim();
        if (!entry.municipios.has(city)) {
          entry.municipios.set(city, { nome: city, userIds: new Set(), clientCount: 0 });
        }
        const mEntry = entry.municipios.get(city)!;
        if (t.userId) mEntry.userIds.add(t.userId);
      }
    });

    return Array.from(stats.values())
      .filter(s => s.userIds.size > 0 || s.clientCount > 0)
      .map(s => ({
        ...s,
        userIds: Array.from(s.userIds),
        municipios: Array.from(s.municipios.values()).map(m => ({
          ...m,
          userIds: Array.from(m.userIds)
        })).sort((a, b) => a.nome.localeCompare(b.nome))
      }))
      .sort((a, b) => a.uf.localeCompare(b.uf));
  }, [clientes, territories]);

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);


  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab');
    return (tabParam as TabId) || 'dashboard';
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDashFiltersOpen, setIsDashFiltersOpen] = useState(false);
  const [isDashMapOpen, setIsDashMapOpen] = useState(false);
  const [isTerritoryMapOpen, setIsTerritoryMapOpen] = useState(false);
  const [isTerritoryDetailOpen, setIsTerritoryDetailOpen] = useState(false);
  const [isUFDetailOpen, setIsUFDetailOpen] = useState(false);
  const [systemTab, setSystemTab] = useState<'visual' | 'sidebar' | 'buttons'>('visual');
  const [selectedUFDetail, setSelectedUFDetail] = useState<string | null>(null);

  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  // Estados para o Modal Detalhado de UF
  const [isRemovingUser, setIsRemovingUser] = useState(false);
  const ufDetailData = useMemo(() => {
    if (!selectedUFDetail) return null;
    return computedUFStats.find(s => s.uf === selectedUFDetail);
  }, [selectedUFDetail, computedUFStats]);

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // ── Auth & Permissions ──────────────────────────────────────────────────
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-user-token-version': String(tokenVersion || 0)
  }), [token, tokenVersion]);

  // ── Brand / Personalização ────────────────────────────────────────────────
  const [brandLogo, setBrandLogo] = useState<string>(() => localStorage.getItem('brand_logo') || '/Logo.png');
  const [brandLogoDark, setBrandLogoDark] = useState<string>(() => localStorage.getItem('brand_logo_dark') || '');
  const [brandName, setBrandName] = useState<string>(() => localStorage.getItem('brand_name') || 'Mapa Território');
  const [brandNameDraft, setBrandNameDraft] = useState<string>(() => localStorage.getItem('brand_name') || 'Mapa Território');
  const [brandLogoHeightLogin, setBrandLogoHeightLogin] = useState<number>(() => Number(localStorage.getItem('brand_logo_height_login')) || 80);
  const [brandLogoHeightNavbar, setBrandLogoHeightNavbar] = useState<number>(() => Number(localStorage.getItem('brand_logo_height_navbar')) || 40);
  const [brandSidebarColor, setBrandSidebarColor] = useState<string>(() => localStorage.getItem('brand_sidebar_color') || '');
  const [brandSidebarTextColor, setBrandSidebarTextColor] = useState<string>(() => localStorage.getItem('brand_sidebar_text_color') || '');
  const [brandSidebarTextActiveColor, setBrandSidebarTextActiveColor] = useState<string>(() => localStorage.getItem('brand_sidebar_text_active_color') || '');
  const [brandSidebarHoverColor, setBrandSidebarHoverColor] = useState<string>(() => localStorage.getItem('brand_sidebar_hover_color') || '');
  const [brandSidebarActiveBgColor, setBrandSidebarActiveBgColor] = useState<string>(() => localStorage.getItem('brand_sidebar_active_bg_color') || '');
  const [brandSidebarParentActiveBgColor, setBrandSidebarParentActiveBgColor] = useState<string>(() => localStorage.getItem('brand_sidebar_parent_active_bg_color') || '');
  const [brandButtonBgColor, setBrandButtonBgColor] = useState<string>(() => localStorage.getItem('brand_button_bg_color') || '');
  const [brandButtonTextColor, setBrandButtonTextColor] = useState<string>(() => localStorage.getItem('brand_button_text_color') || '');
  const [brandButtonHoverBgColor, setBrandButtonHoverBgColor] = useState<string>(() => localStorage.getItem('brand_button_hover_bg_color') || '');
  const [brandButtonHoverTextColor, setBrandButtonHoverTextColor] = useState<string>(() => localStorage.getItem('brand_button_hover_text_color') || '');
  const [brandFavicon, setBrandFavicon] = useState<string>(() => localStorage.getItem('brand_favicon') || '/favicon.ico');
  const { theme } = useTheme();

  // Dynamic Button Styles Injection
  const buttonStyles = useMemo(() => {
    if (theme === 'dark') return '';
    let styles = '';
    if (brandButtonBgColor) {
      styles += `
        .admin-content button.bg-primary, 
        .admin-content .bg-primary,
        .admin-sidebar button.bg-primary { 
          background-color: ${brandButtonBgColor} !important; 
        }
      `;
    }
    if (brandButtonTextColor) {
      styles += `
        .admin-content button.bg-primary, 
        .admin-content .bg-primary,
        .admin-sidebar button.bg-primary { 
          color: ${brandButtonTextColor} !important; 
        }
      `;
    }
    if (brandButtonHoverBgColor) {
      styles += `
        .admin-content button.bg-primary:hover, 
        .admin-content .bg-primary:hover,
        .admin-sidebar button.bg-primary:hover { 
          background-color: ${brandButtonHoverBgColor} !important; 
        }
      `;
    }
    if (brandButtonHoverTextColor) {
      styles += `
        .admin-content button.bg-primary:hover, 
        .admin-content .bg-primary:hover,
        .admin-sidebar button.bg-primary:hover { 
          color: ${brandButtonHoverTextColor} !important; 
        }
      `;
    }
    return styles;
  }, [theme, brandButtonBgColor, brandButtonTextColor, brandButtonHoverBgColor, brandButtonHoverTextColor]);

  const fetchSystemSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings`, { headers: authHeaders });
      if (res.ok) {
        const settings = await res.json();
        if (settings.brand_logo) {
          setBrandLogo(settings.brand_logo);
          localStorage.setItem('brand_logo', settings.brand_logo);
        }
        if (settings.brand_logo_dark) {
          setBrandLogoDark(settings.brand_logo_dark);
          localStorage.setItem('brand_logo_dark', settings.brand_logo_dark);
        }
        if (settings.brand_name) {
          setBrandName(settings.brand_name);
          setBrandNameDraft(settings.brand_name);
          localStorage.setItem('brand_name', settings.brand_name);
        }
        if (settings.brand_logo_height_login) {
          setBrandLogoHeightLogin(Number(settings.brand_logo_height_login));
          localStorage.setItem('brand_logo_height_login', settings.brand_logo_height_login);
        }
        if (settings.brand_logo_height_navbar) {
          setBrandLogoHeightNavbar(Number(settings.brand_logo_height_navbar));
          localStorage.setItem('brand_logo_height_navbar', settings.brand_logo_height_navbar);
        }
        if (settings.brand_sidebar_color !== undefined) {
          setBrandSidebarColor(settings.brand_sidebar_color || '');
          localStorage.setItem('brand_sidebar_color', settings.brand_sidebar_color || '');
        }
        if (settings.brand_sidebar_text_color !== undefined) {
          setBrandSidebarTextColor(settings.brand_sidebar_text_color || '');
          localStorage.setItem('brand_sidebar_text_color', settings.brand_sidebar_text_color || '');
        }
        if (settings.brand_sidebar_text_active_color !== undefined) {
          setBrandSidebarTextActiveColor(settings.brand_sidebar_text_active_color || '');
          localStorage.setItem('brand_sidebar_text_active_color', settings.brand_sidebar_text_active_color || '');
        }
        if (settings.brand_sidebar_hover_color !== undefined) {
          setBrandSidebarHoverColor(settings.brand_sidebar_hover_color || '');
          localStorage.setItem('brand_sidebar_hover_color', settings.brand_sidebar_hover_color || '');
        }
        if (settings.brand_sidebar_active_bg_color !== undefined) {
          setBrandSidebarActiveBgColor(settings.brand_sidebar_active_bg_color || '');
          localStorage.setItem('brand_sidebar_active_bg_color', settings.brand_sidebar_active_bg_color || '');
        }
        if (settings.brand_sidebar_parent_active_bg_color !== undefined) {
          const mainBg = settings.brand_sidebar_color || '';
          const parentBg = settings.brand_sidebar_parent_active_bg_color || '';
          const staleParentGreen =
            mainBg &&
            !isLegacyGreenSidebarColor(mainBg) &&
            isLegacyGreenSidebarColor(parentBg);
          if (staleParentGreen) {
            setBrandSidebarParentActiveBgColor('');
            localStorage.removeItem('brand_sidebar_parent_active_bg_color');
          } else {
            setBrandSidebarParentActiveBgColor(parentBg);
            localStorage.setItem('brand_sidebar_parent_active_bg_color', parentBg);
          }
        }
        if (settings.brand_button_bg_color !== undefined) {
          setBrandButtonBgColor(settings.brand_button_bg_color || '');
          localStorage.setItem('brand_button_bg_color', settings.brand_button_bg_color || '');
        }
        if (settings.brand_button_text_color !== undefined) {
          setBrandButtonTextColor(settings.brand_button_text_color || '');
          localStorage.setItem('brand_button_text_color', settings.brand_button_text_color || '');
        }
        if (settings.brand_button_hover_bg_color !== undefined) {
          setBrandButtonHoverBgColor(settings.brand_button_hover_bg_color || '');
          localStorage.setItem('brand_button_hover_bg_color', settings.brand_button_hover_bg_color || '');
        }
        if (settings.brand_button_hover_text_color !== undefined) {
          setBrandButtonHoverTextColor(settings.brand_button_hover_text_color || '');
          localStorage.setItem('brand_button_hover_text_color', settings.brand_button_hover_text_color || '');
        }
        if (settings.brand_favicon) {
          setBrandFavicon(settings.brand_favicon);
          localStorage.setItem('brand_favicon', settings.brand_favicon);
        }
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  }, [authHeaders]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione um arquivo de imagem'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem muito grande (máx. 2 MB)'); return; }
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      try {
        const res = await fetch(`${API}/api/admin/settings`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ brand_logo: b64 })
        });
        if (res.ok) {
          setBrandLogo(b64);
          localStorage.setItem('brand_logo', b64);
          toast.success('Logo do sistema atualizada!');
          window.dispatchEvent(new Event('storage'));
        } else {
          toast.error('Erro ao salvar logo no servidor');
        }
      } catch (error) {
        toast.error('Erro de conexão ao salvar logo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione um arquivo de imagem'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem muito grande (máx. 2 MB)'); return; }
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      try {
        const res = await fetch(`${API}/api/admin/settings`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ brand_logo_dark: b64 })
        });
        if (res.ok) {
          setBrandLogoDark(b64);
          localStorage.setItem('brand_logo_dark', b64);
          toast.success('Logo do modo escuro atualizada!');
          window.dispatchEvent(new Event('storage'));
        } else {
          toast.error('Erro ao salvar logo no servidor');
        }
      } catch (error) {
        toast.error('Erro de conexão ao salvar logo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrandName = async () => {
    const name = brandNameDraft.trim() || 'Mapa Território';
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ brand_name: name })
      });
      if (res.ok) {
        setBrandName(name);
        localStorage.setItem('brand_name', name);
        toast.success('Nome da empresa salvo!');
        window.dispatchEvent(new Event('storage'));
      } else {
        toast.error('Erro ao salvar nome no servidor');
      }
    } catch (error) {
      toast.error('Erro de conexão ao salvar nome');
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ brand_logo: '/Logo.png' })
      });
      if (res.ok) {
        setBrandLogo('/Logo.png');
        localStorage.setItem('brand_logo', '/Logo.png');
        toast.success('Logo resetada para o padrão');
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      toast.error('Erro ao resetar logo');
    }
  };

  const handleRemoveLogoDark = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ brand_logo_dark: '' })
      });
      if (res.ok) {
        setBrandLogoDark('');
        localStorage.removeItem('brand_logo_dark');
        toast.success('Logo do modo escuro removida');
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      toast.error('Erro ao remover logo');
    }
  };

  const handleSaveSidebarStyleBatch = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          brand_sidebar_color: brandSidebarColor,
          brand_sidebar_text_color: brandSidebarTextColor,
          brand_sidebar_text_active_color: brandSidebarTextActiveColor,
          brand_sidebar_hover_color: brandSidebarHoverColor,
          brand_sidebar_active_bg_color: brandSidebarActiveBgColor,
          brand_sidebar_parent_active_bg_color: brandSidebarParentActiveBgColor,
          brand_button_bg_color: brandButtonBgColor,
          brand_button_text_color: brandButtonTextColor,
          brand_button_hover_bg_color: brandButtonHoverBgColor,
          brand_button_hover_text_color: brandButtonHoverTextColor,
        })
      });
      if (res.ok) {
        localStorage.setItem('brand_sidebar_color', brandSidebarColor);
        localStorage.setItem('brand_sidebar_text_color', brandSidebarTextColor);
        localStorage.setItem('brand_sidebar_text_active_color', brandSidebarTextActiveColor);
        localStorage.setItem('brand_sidebar_hover_color', brandSidebarHoverColor);
        localStorage.setItem('brand_sidebar_active_bg_color', brandSidebarActiveBgColor);
        localStorage.setItem('brand_sidebar_parent_active_bg_color', brandSidebarParentActiveBgColor);
        localStorage.setItem('brand_button_bg_color', brandButtonBgColor);
        localStorage.setItem('brand_button_text_color', brandButtonTextColor);
        localStorage.setItem('brand_button_hover_bg_color', brandButtonHoverBgColor);
        localStorage.setItem('brand_button_hover_text_color', brandButtonHoverTextColor);
        toast.success('Estilos do sistema salvos com sucesso!');
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      toast.error('Erro ao salvar estilos do sistema');
    }
  };

  const handleSaveSidebarStyle = async (key: string, value: string) => {
    // Ao trocar o fundo principal, remove verde legado do item pai (senão fica desalinhado)
    if (key === 'brand_sidebar_color' && value) {
      const parentStored =
        brandSidebarParentActiveBgColor || localStorage.getItem('brand_sidebar_parent_active_bg_color') || '';
      if (!parentStored || isLegacyGreenSidebarColor(parentStored)) {
        setBrandSidebarParentActiveBgColor('');
        localStorage.removeItem('brand_sidebar_parent_active_bg_color');
        try {
          await fetch(`${API}/api/admin/settings`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ brand_sidebar_parent_active_bg_color: '' }),
          });
        } catch {
          /* preview local já aplicado */
        }
      }
    }

    // Immediate preview by updating local state
    if (key === 'brand_sidebar_color') setBrandSidebarColor(value);
    if (key === 'brand_sidebar_text_color') setBrandSidebarTextColor(value);
    if (key === 'brand_sidebar_text_active_color') setBrandSidebarTextActiveColor(value);
    if (key === 'brand_sidebar_hover_color') setBrandSidebarHoverColor(value);
    if (key === 'brand_sidebar_active_bg_color') setBrandSidebarActiveBgColor(value);
    if (key === 'brand_sidebar_parent_active_bg_color') setBrandSidebarParentActiveBgColor(value);
    if (key === 'brand_button_bg_color') setBrandButtonBgColor(value);
    if (key === 'brand_button_text_color') setBrandButtonTextColor(value);
    if (key === 'brand_button_hover_bg_color') setBrandButtonHoverBgColor(value);
    if (key === 'brand_button_hover_text_color') setBrandButtonHoverTextColor(value);
    
    // For predefined colors, we can save immediately as it's a single click
    if (!value.startsWith('rgba') && value.length <= 7) {
      try {
        await fetch(`${API}/api/admin/settings`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ [key]: value })
        });
        localStorage.setItem(key, value);
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error saving predefined color:', error);
      }
    }
  };

  const handleRemoveSidebarStyle = async (key: string) => {
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ [key]: '' })
      });
      if (res.ok) {
        localStorage.setItem(key, '');
        toast.success('Estilo resetado para o padrão');
        window.dispatchEvent(new Event('storage'));

        if (key === 'brand_sidebar_color') setBrandSidebarColor('');
        if (key === 'brand_sidebar_text_color') setBrandSidebarTextColor('');
        if (key === 'brand_sidebar_text_active_color') setBrandSidebarTextActiveColor('');
        if (key === 'brand_sidebar_hover_color') setBrandSidebarHoverColor('');
        if (key === 'brand_sidebar_active_bg_color') setBrandSidebarActiveBgColor('');
        if (key === 'brand_sidebar_parent_active_bg_color') setBrandSidebarParentActiveBgColor('');
        if (key === 'brand_button_bg_color') setBrandButtonBgColor('');
        if (key === 'brand_button_text_color') setBrandButtonTextColor('');
        if (key === 'brand_button_hover_bg_color') setBrandButtonHoverBgColor('');
        if (key === 'brand_button_hover_text_color') setBrandButtonHoverTextColor('');
      }
    } catch {
      toast.error('Erro ao resetar estilo da sidebar');
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione um arquivo de imagem'); return; }
    if (file.size > 1 * 1024 * 1024) { toast.error('Favicon muito grande (máx. 1 MB)'); return; }
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      try {
        const res = await fetch(`${API}/api/admin/settings`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ brand_favicon: b64 })
        });
        if (res.ok) {
          setBrandFavicon(b64);
          localStorage.setItem('brand_favicon', b64);
          toast.success('Favicon atualizado!');
          window.dispatchEvent(new Event('storage'));
        } else {
          toast.error('Erro ao salvar favicon no servidor');
        }
      } catch (error) {
        toast.error('Erro de conexão ao salvar favicon');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFavicon = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ brand_favicon: '/favicon.ico' })
      });
      if (res.ok) {
        setBrandFavicon('/favicon.ico');
        localStorage.setItem('brand_favicon', '/favicon.ico');
        toast.success('Favicon resetado para o padrão');
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      toast.error('Erro ao resetar favicon');
    }
  };

  // ── LocalStorage state ────────────────────────────────────────────────────
  const [groups, setGroups] = useState<Group[]>(() => LS.get('admin_groups', []));
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.seen).length;
  }, [notifications]);

  const markAllAsSeen = useCallback(async () => {
    if (notifications.length === 0) return;
    const unread = notifications.filter(n => !n.seen);
    if (unread.length === 0) return;

    try {
      // Mark each unread notification as seen on server
      await Promise.all(unread.map(n => 
        fetch(`${API}/api/notifications/${n.id}/seen`, {
          method: 'POST',
          headers: authHeaders
        })
      ));
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  }, [notifications, authHeaders]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const [myPermissions, setMyPermissions] = useState<ModulePermission[]>([]);
  const fetchMyPermissions = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/permissions`, { headers: authHeaders });
      if (res.ok) setMyPermissions(await res.json());
    } catch (error) { console.error('Error fetching permissions', error); }
  }, [userId, authHeaders]);

  const canAccess = useCallback((moduleId: string) => {
    if (role === 'admin') return true;
    const p = myPermissions.find(p => p.moduleId === moduleId);
    return p?.canView || false;
  }, [role, myPermissions]);

  const canEdit = useCallback((moduleId: string) => {
    if (role === 'admin') return true;
    const p = myPermissions.find(p => p.moduleId === moduleId);
    return p?.canEdit || false;
  }, [role, myPermissions]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch(`${API}/api/notifications`, { headers: authHeaders });
      if (res.ok) setNotifications(await res.json());
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [authHeaders]);

  const fetchAuditLogs = useCallback(async () => {
    if (!canAccess('audit')) return;
    try {
      setLoadingAudit(true);
      const res = await fetch(`${API}/api/admin/audit`, { headers: authHeaders });
      if (res.ok) setAuditLogs(await res.json());
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoadingAudit(false);
    }
  }, [authHeaders, canAccess]);

  const saveGroups = (g: Group[]) => { setGroups(g); LS.set('admin_groups', g); };

  // Current user info for sidebar profile
  const { userName: authUserName } = useAuth();
  const currentUser = users.find(u => u.id === userId);
  const displayName = authUserName || currentUser?.full_name || currentUser?.fullName || currentUser?.username || 'Admin';
  const displayEmail = currentUser?.username || '';
  const displayPhoto = currentUser?.photo || '';
  const displayCargo = currentUser?.cargo || role || 'usuário';
  const displayTipo = currentUser?.tipo || 'Usuário';

  const navItems: NavItem[] = useMemo(() => [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ajuda' as const, label: 'Ajuda', icon: HelpCircle },
    { id: 'baserotas' as const, label: 'Base Cliente', icon: Database, restrict: ['admin', 'supervisor', 'user'] },
    {
      id: 'visitas_menu' as const, label: 'Visitas', icon: MapPinned, restrict: ['admin', 'supervisor', 'user'], subItems: [
        { id: 'visitas' as const, label: 'Acompanhamento', icon: Activity },
        { id: 'visitas_agendar' as const, label: 'Agendamento', icon: Calendar },
      ]
    },
    {
      id: 'users_menu' as const, label: 'Usuários', icon: UsersRound, restrict: ['admin'], subItems: [
        { id: 'users' as const, label: 'Todos os Usuários', icon: UserPlus, count: users.length },
        // Dynamic User Types submenus
        ...userTypes
          .filter(t => t.showInMenu && t.active)
          .map(t => ({
            id: `user_type_${t.id}` as TabId,
            label: t.name,
            icon: User,
            count: users.filter(u => u.userTypeId === t.id).length
          })),
        { id: 'groups' as const, label: 'Grupos', icon: UsersRound, count: groups.length },
      ]
    },
    { id: 'territories' as const, label: 'Territórios', icon: MapPin, restrict: ['admin', 'supervisor'] },
    { id: 'notifications' as const, label: 'Enviar Alerta', icon: Bell, restrict: ['admin'] },
    { id: 'data-connections' as const, label: 'Conexões de Dados', icon: Database, restrict: ['admin'] },
    {
      id: 'settings' as const, label: 'Configurações', icon: Settings, restrict: ['admin'], subItems: [
        { id: 'system' as const, label: 'Editar sistema', icon: Settings },
        { id: 'user_types' as const, label: 'Tipos de Usuário', icon: ShieldCheck },
        { id: 'audit' as const, label: 'Auditoria', icon: ScrollText },
      ]
    }
  ].filter(item => {
    // If it's a core section (like dashboard), allow or check specific permission if needed
    if (item.id === 'dashboard' || item.id === 'ajuda') return true;

    // Modular permission check
    const moduleMap: Record<string, string> = {
      'baserotas': 'clientes',
      'territories': 'territories',
      'visitas_menu': 'routes',
      'visitas': 'routes',
      'visitas_agendar': 'routes',
      'users_menu': 'users',
      'notifications': 'notifications',
      'audit': 'audit',
      'users': 'users',
      'system': 'settings',
      'settings': 'settings',
      'data-connections': 'data-connections'
    };

    const moduleId = moduleMap[item.id as string];
    
    // If user has explicit modular permission, grant access regardless of role restriction
    if (moduleId && canAccess(moduleId)) return true;

    // Se for subitem, também checar permissão modular do subitem
    if (item.subItems) {
        const hasAccessibleSubItem = item.subItems.some(sub => {
            const subModuleId = moduleMap[sub.id as string];
            return subModuleId && canAccess(subModuleId);
        });
        if (hasAccessibleSubItem) return true;
    }

    // Otherwise, check role-based restriction
    if (item.restrict && !item.restrict.includes(role || '')) return false;

    return true;
  }), [users, userTypes, groups, computedTerritories, unreadCount, auditLogs, role, myPermissions]);

  // Update activeTab if current one is restricted after permissions load
  useEffect(() => {
    if (loading || role === 'admin') return;

    const isCurrentTabRestricted = !navItems.some(item => {
      if (item.id === activeTab) return true;
      if (item.subItems?.some((s: any) => s.id === activeTab)) return true;
      return false;
    });

    if (isCurrentTabRestricted && navItems.length > 0) {
      const firstPermitted = navItems[0].subItems ? navItems[0].subItems[0].id : navItems[0].id;
      setActiveTab(firstPermitted as TabId);
    }
  }, [myPermissions, loading, navItems, activeTab, role]);

  // Find active tab label for header
  const findActiveLabel = () => {
    for (const item of navItems) {
      if (item.id === activeTab) return { label: item.label, icon: item.icon };
      if (item.subItems) {
        const sub = item.subItems.find(s => s.id === activeTab);
        if (sub) return { label: sub.label, icon: sub.icon };
      }
    }
    return null;
  };

  const activeNavInfo = findActiveLabel();

  // ── Dashboard filters ─────────────────────────────────────────────────────
  const [dashFilterUser, setDashFilterUser] = useState('all');
  const [dashFilterUF, setDashFilterUF] = useState('all');
  const [dashSearch, setDashSearch] = useState('');

  const addAudit = useCallback(async (action: string, entity: string, entityId: string, details: string) => {
    // Audit is now handled by the backend automatically when performing actions.
    // This frontend helper can be used for actions that don't have a dedicated backend log yet,
    // though it's better to log on the backend for security and accuracy.
    console.log(`[AUDIT] Action: ${action}, Entity: ${entity}, ID: ${entityId}, Details: ${details}`);
    fetchAuditLogs(); // Refresh the list
  }, [fetchAuditLogs]);

  // ── Confirm dialog ─────────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: '', description: '', onConfirm: () => { } });
  const openConfirm = useCallback((title: string, description: string, onConfirm: () => void) => setConfirmDialog({ open: true, title, description, onConfirm }), []);
  const closeConfirm = useCallback(() => setConfirmDialog(d => ({ ...d, open: false })), []);

  // ── Reps form ──────────────────────────────────────────────────────────────
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', fullName: '', isVago: 0, colorIndex: 1, email: '', contato: '',
    endereco: '', bairro: '', cidade: '', uf: '', cep: '', comissao: ''
  });
  const [newRep, setNewRep] = useState({
    userId: '', code: '', name: '', fullName: '', isVago: 0, colorIndex: 1, email: '', contato: '',
    endereco: '', bairro: '', cidade: '', uf: '', cep: '', comissao: ''
  });

  const [newUser, setNewUser] = useState<{
    fullName: string; email: string; password: string; confirmPassword: string;
    role: 'user' | 'supervisor' | 'admin';
    code: string; documentType: 'cpf' | 'cnpj';
    document: string; companyName: string; birthDate: string; telefone: string; photo: string; photoBorderColor: string;
    cargo: string; groupId: string; tipo: 'normal' | 'representante' | 'promotor' | 'supervisor'; colorIndex: number;
    cep: string; logradouro: string; numero: string; complemento: string; bairro_end: string; cidade: string; estado_end: string; assigned_state?: string; area_atuacao: string; base_logistica: string;
    userTypeId: string;
    canVisit: boolean;
    default_screen: string;
    managedUserIds: number[];
    permissions: { moduleId: string; canView: boolean; canEdit: boolean }[];
  }>({
    fullName: '', email: '', password: '', confirmPassword: '',
    role: 'user',
    code: '', documentType: 'cpf',
    document: '', companyName: '', birthDate: '', telefone: '', photo: '', photoBorderColor: '#FFD700',
    cargo: '', groupId: '', tipo: 'normal', colorIndex: 0,
    cep: '', logradouro: '', numero: '', complemento: '', bairro_end: '', cidade: '', estado_end: '', assigned_state: '', area_atuacao: '', base_logistica: '',
    userTypeId: '',
    canVisit: false,
    default_screen: 'mapa',
    managedUserIds: [],
    permissions: []
  });

  const [availableModules, setAvailableModules] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch(`${API}/api/admin/modules`, { headers: authHeaders })
      .then(res => res.ok ? res.json() : [])
      .then(mods => {
        setAvailableModules(mods);
        // Default modules to enable: dashboard, clientes, territories, settings
        const defaultEnabled = ['dashboard', 'clientes', 'territories', 'settings'];
        
        setNewUser(prev => ({
          ...prev,
          permissions: mods.map((m: any) => ({ 
            moduleId: m.id, 
            canView: defaultEnabled.includes(m.id), 
            canEdit: false 
          }))
        }));
      });
  }, [authHeaders]);

  const handleNewUserPermissionChange = (moduleId: string, field: 'canView' | 'canEdit', value: boolean) => {
    setNewUser(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => {
        if (p.moduleId === moduleId) {
          const newState = { ...p, [field]: value };
          if (field === 'canEdit' && value) newState.canView = true;
          return newState;
        }
        return p;
      })
    }));
  };

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'clientes': return <Users2 size={16} />;
      case 'notifications': return <Bell size={16} />;
      case 'users': return <User size={16} />;
      case 'routes': return <MapPin size={16} />;
      case 'audit': return <HistoryIcon size={16} />;
      case 'settings': return <Settings size={16} />;
      default: return <Package size={16} />;
    }
  };

  // Auto-admin flag when user type is admin
  useEffect(() => {
    const selectedType = userTypes.find(t => String(t.id) === String(newUser.userTypeId));
    if (selectedType?.isAdmin) {
      setNewUser(prev => ({
        ...prev,
        role: 'admin',
        permissions: prev.permissions.map(p => ({ ...p, canView: true, canEdit: true }))
      }));
    }
  }, [newUser.userTypeId, userTypes]);

  // ── UserTypes form ────────────────────────────────────────────────────────
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [editingUserTypeId, setEditingUserTypeId] = useState<number | null>(null);
  const [userTypeForm, setUserTypeForm] = useState({
    name: '',
    color: '#3b82f6',
    icon: 'User',
    showInMenu: false,
    active: true,
    isAdmin: false,
    canVisit: false
  });

  const handleSaveUserType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTypeForm.name) return toast.error('O nome é obrigatório');

    try {
      const url = editingUserTypeId 
        ? `${API}/api/admin/user-types/${editingUserTypeId}`
        : `${API}/api/admin/user-types`;
      
      const method = editingUserTypeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(userTypeForm)
      });

      if (res.ok) {
        toast.success(editingUserTypeId ? 'Tipo atualizado!' : 'Tipo criado!');
        setIsUserTypeModalOpen(false);
        fetchUserTypes();
        addAudit(editingUserTypeId ? 'update_user_type' : 'create_user_type', 'UserType', String(editingUserTypeId || 'new'), `Tipo: ${userTypeForm.name}`);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao salvar tipo');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const handleDeleteUserType = async (id: number, name: string) => {
    openConfirm(
      'Remover Tipo de Usuário?',
      `Isso removerá o tipo "${name}" e desvinculará todos os usuários deste tipo. Esta ação não pode ser desfeita.`,
      async () => {
        try {
          const res = await fetch(`${API}/api/admin/user-types/${id}`, {
            method: 'DELETE',
            headers: authHeaders
          });
          if (res.ok) {
            toast.success('Tipo removido');
            fetchUserTypes();
            addAudit('delete_user_type', 'UserType', String(id), `Tipo: ${name}`);
          } else {
            toast.error('Erro ao remover tipo');
          }
        } catch (error) {
          toast.error('Erro de conexão');
        }
      }
    );
  };

  const handleAddUsersToType = async (userTypeId: number) => {
    if (selectedUserIdsForType.length === 0) return;

    try {
      // Update each user individually using existing endpoint
      let successCount = 0;
      for (const userId of selectedUserIdsForType) {
        try {
          const user = users.find(u => u.id === userId);
          if (!user) continue;

          const selectedType = userTypes.find(t => t.id === userTypeId);
          const body: Record<string, any> = {
            username: user.username,
            email: user.email || user.username,
            role: selectedType?.isAdmin ? 'admin' : user.role,
            full_name: user.full_name || user.fullName || '',
            telefone: user.telefone || '',
            cpf_cnpj: user.cpf_cnpj || user.document || '',
            birth_date: user.birth_date || user.birthDate || null,
            cargo: user.cargo || '',
            company_name: user.company_name || user.companyName || '',
            groupId: user.groupId ? Number(user.groupId) : null,
            userTypeId: userTypeId,
            managedUserIds: user.managedUsers?.map((m: any) => m.id) || []
          };

          const res = await fetch(`${API}/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify(body)
          });
          if (res.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error updating user ${userId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} usuário${successCount !== 1 ? 's' : ''} adicionado${successCount !== 1 ? 's' : ''} ao tipo de usuário`);
        setSelectedUserIdsForType([]);
        setIsAddUsersModalOpen(false);
        // Refresh users data
        const uR = await fetch(`${API}/api/admin/users`, { headers: authHeaders });
        if (uR.ok) setUsers(await uR.json());
        addAudit('batch_update_user_type', 'User', selectedUserIdsForType.join(','), `Updated userTypeId to ${userTypeId}`);
      } else {
        toast.error('Erro ao adicionar usuários ao tipo');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const [groupsData, setGroupsData] = useState<{ id: number, name: string }[]>([]);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editUserForm, setEditUserForm] = useState<{
    username: string; fullName: string; document: string; password: string; confirmPassword: string;
    role: 'user' | 'supervisor' | 'admin';
    code: string; photo: string; photoBorderColor: string; telefone: string; birthDate: string;
    cargo: string; companyName: string; groupId: string;
    userTypeId: string;
    canVisit: boolean;
    managedUserIds: number[];
  }>({
    username: '', fullName: '', document: '', password: '', confirmPassword: '',
    role: 'user',
    code: '', photo: '', photoBorderColor: '#FFD700', telefone: '', birthDate: '',
    cargo: '', companyName: '', groupId: '',
      userTypeId: '',
      canVisit: false,
      managedUserIds: []
    });
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRepModalOpen, setIsRepModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userFilterOnline, setUserFilterOnline] = useState(false);
  const [userSortBy, setUserSortBy] = useState<'name' | 'code' | 'date' | 'role'>('name');
  const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false);
  const [addUsersSearch, setAddUsersSearch] = useState('');
  const [addUsersCodeFilter, setAddUsersCodeFilter] = useState('');
  const [addUsersTypeFilter, setAddUsersTypeFilter] = useState('all');
  const [selectedUserIdsForType, setSelectedUserIdsForType] = useState<number[]>([]);

  // Photo Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState('');
  const [cropperForEdit, setCropperForEdit] = useState(false);

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(u => {
      // Filter by dynamic user type if applicable
      if (activeTab.startsWith('user_type_')) {
        const typeId = parseInt(activeTab.replace('user_type_', ''));
        // Show only users who HAVE this type
        // @ts-ignore
        if (Number(u.userTypeId) !== typeId) return false;
      }

      const name = (u.full_name || u.fullName || u.username).toLowerCase();
      const email = u.username.toLowerCase();
      const search = userSearch.toLowerCase();

      const matchesSearch = name.includes(search) || email.includes(search);
      if (!matchesSearch) return false;

      if (userFilterOnline) {
        const rawLastActive = u.last_active || (u as SystemUser & { lastActive?: string }).lastActive;
        if (!rawLastActive) return false;
        const lastDate = new Date(rawLastActive);
        // epoch (new Date(0)) = never logged in sentinel
        if (lastDate.getFullYear() <= 1970) return false;
        const isOnline = (u.id === userId) || (!isNaN(lastDate.getTime()) && (Date.now() - lastDate.getTime()) < 300000);
        return isOnline;
      }

      return true;
    });

    // Ordenação
    return [...filtered].sort((a, b) => {
      if (userSortBy === 'name') {
        const nameA = (a.full_name || a.fullName || a.username).toLowerCase();
        const nameB = (b.full_name || b.fullName || b.username).toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (userSortBy === 'code') {
        const codeA = (a.code || '').toLowerCase();
        const codeB = (b.code || '').toLowerCase();
        return codeA.localeCompare(codeB);
      }
      if (userSortBy === 'date') {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA; // Mais recentes primeiro
      }
      if (userSortBy === 'role') {
        const roleA = (a.role || 'user').toLowerCase();
        const roleB = (b.role || 'user').toLowerCase();
        return roleA.localeCompare(roleB);
      }
      return 0;
    });
  }, [users, userSearch, userFilterOnline, userId, userSortBy, activeTab]);


  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Foto deve ter no máximo 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTempImage(ev.target?.result as string);
      setCropperForEdit(isEdit);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string, borderColor: string) => {
    if (cropperForEdit) {
      setEditUserForm(f => ({ ...f, photo: croppedImage, photoBorderColor: borderColor }));
    } else {
      setNewUser(f => ({ ...f, photo: croppedImage, photoBorderColor: borderColor }));
    }
    setShowCropper(false);
    setTempImage('');
  };

  // ── Territories form ──────────────────────────────────────────────────────
  const [selectedUF, setSelectedUF] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedMunicipioName, setSelectedMunicipioName] = useState('');
  const [includeBairro, setIncludeBairro] = useState(false);
  const [selectedBairro, setSelectedBairro] = useState('');
  const [selectedUserForTerritory, setSelectedUserForTerritory] = useState('');
  const [selectedModo, setSelectedModo] = useState<'planejamento' | 'atendimento'>('atendimento');
  const [municipios, setMunicipios] = useState<{ id: number; nome: string }[]>([]);
  const [subdistritos, setSubdistritos] = useState<{ id: number; nome: string }[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [loadingSubdistritos, setLoadingSubdistritos] = useState(false);
  const [staged, setStaged] = useState<Array<{ municipio: string; uf: string; bairro?: string; userId: number; modo: string }>>([]);
  const [filterUF, setFilterUF] = useState('all');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [filterUserForTerritory, setFilterUserForTerritory] = useState('');

  // ── Groups form ────────────────────────────────────────────────────────────
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [groupAddUsers, setGroupAddUsers] = useState<number[]>([]);

  // ── Notifications form ─────────────────────────────────────────────────────
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetAll, setNotifTargetAll] = useState(true);
  const [notifTargetUsers, setNotifTargetUsers] = useState<number[]>([]);
  const [notifUserSearch, setNotifUserSearch] = useState('');

  // ── Audit filters ──────────────────────────────────────────────────────────
  const [auditFilterUser, setAuditFilterUser] = useState('all');
  const [auditFilterAction, setAuditFilterAction] = useState('all');
  const [auditFilterUF, setAuditFilterUF] = useState('all');

  const filteredAudit = useMemo(() => {
    return auditLogs.filter(log => {
      if (auditFilterUser && auditFilterUser !== 'all' && (log.details).includes(auditFilterUser)) return false;
      if (auditFilterUF && auditFilterUF !== 'all' && (log.uf || log.details).includes(auditFilterUF)) return false;
      if (auditFilterAction && auditFilterAction !== 'all' && log.action !== auditFilterAction) return false;
      return true;
    });
  }, [auditLogs, auditFilterUser, auditFilterUF, auditFilterAction]);

  const auditActionLabel: Record<string, string> = {
    'create_user': 'Novo Usuário',
    'update_user': 'Editou Usuário',
    'delete_user': 'Removeu Usuário',
    'create_group': 'Novo Grupo',
    'delete_group': 'Removeu Grupo',
    'update_group': 'Editou Grupo',
    'accepted': 'Interesse Aceito',
    'rejected': 'Interesse Recusado',
    'clear_notifications': 'Limpar Notificações',
    'send_notification': 'Enviou Alerta'
  };

  // ── Fetch all API data ─────────────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/groups`, { headers: authHeaders });
      if (res.ok) setGroupsData(await res.json());
    } catch (error) { console.error('Error fetching groups:', error); }
  }, [authHeaders]);

  useEffect(() => {
    document.title = brandName;
  }, [brandName]);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = brandFavicon;
    }
  }, [brandFavicon]);

  const fetchUserTypes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/user-types`, { headers: authHeaders });
      if (res.ok) setUserTypes(await res.json());
    } catch (error) { console.error('Error fetching user types:', error); }
  }, [authHeaders]);

  const fetchClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const res = await fetch(`${API}/api/clientes`, { headers: authHeaders });
      if (res.ok) setClientes(await res.json());
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  }, [authHeaders]);

  const fetchAll = useCallback(async () => {
    setIsRefreshing(true);
    const activeNavInfo = navItems.find(item => 
        item.id === activeTab || item.subItems?.some(sub => sub.id === activeTab)
    );
    const currentLabel = activeNavInfo?.label ?? 'Painel';

    if (!initialLoadDone) setLoading(true);
    
    // Garantir que a animação dure pelo menos 800ms para feedback visual
    const minAnimationPromise = new Promise(resolve => setTimeout(resolve, 800));

    try {
      const [tR, uR, utR] = await Promise.all([
        fetch(`${API}/api/admin/territories`, { headers: authHeaders }),
        fetch(`${API}/api/admin/users`, { headers: authHeaders }),
        fetch(`${API}/api/admin/user-types`, { headers: authHeaders }),
        minAnimationPromise // Aguarda o tempo mínimo
      ]);

      const responses = [tR, uR, utR];
      const unauth = responses.find(r => r.status === 401);
      if (unauth) {
        toast.error('Sessão encerrada ou inválida. Faça login novamente.');
        logout();
        return;
      }

      if (tR.ok && uR.ok && utR.ok) {
        setTerritories(await tR.json());
        setUsers(await uR.json());
        setUserTypes(await utR.json());
      }
      // Also fetch groups
      await fetchGroups();

      // Lazy load clientes only if needed or after initial UI is ready
      if (!initialLoadDone) {
        fetchClientes();
        fetchAuditLogs();
      }

      if (initialLoadDone) {
        toast.success(`${currentLabel} atualizado`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally { 
      setLoading(false); 
      setIsRefreshing(false);
      setInitialLoadDone(true);
    }
  }, [authHeaders, logout, fetchGroups, initialLoadDone, fetchClientes, fetchAuditLogs, activeTab, navItems]);

  const handleDownloadLogisticsPlan = async () => {
    try {
      setIsGeneratingPlan(true);
      toast.info('Gerando planilha lógistica. Isso pode demorar alguns segundos...');
      const res = await fetch(`${API}/api/planilha/generate-plan`, { headers: authHeaders });
      if (!res.ok) throw new Error('Falha ao gerar o arquivo');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Planilha_Logistica.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Download da planilha concluído!');
    } catch (error) {
      toast.error('Erro ao gerar/baixar a planilha logística.');
      console.error(error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  useEffect(() => {
    if (!initialLoadDone && !authLoading && token) {
      fetchAll();
      fetchMyPermissions();
      fetchNotifications();
      fetchSystemSettings();
    }
  }, [initialLoadDone, authLoading, token, fetchAll, fetchMyPermissions, fetchNotifications, fetchSystemSettings]);


  useEffect(() => {
    if (!selectedUF) { setMunicipios([]); setSelectedMunicipio(''); setSelectedMunicipioName(''); return; }
    const uf = UF_DATA.find(u => u.sigla === selectedUF); if (!uf) return;
    setLoadingMunicipios(true); setSelectedMunicipio(''); setSelectedMunicipioName('');
    fetch(`${IBGE}/estados/${uf.codigo}/municipios`).then(r => r.json())
      .then(d => setMunicipios(d.sort((a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome))))
      .catch(() => toast.error('Erro ao carregar municípios')).finally(() => setLoadingMunicipios(false));
  }, [selectedUF]);

  useEffect(() => {
    if (!selectedMunicipio || !includeBairro) { setSubdistritos([]); setSelectedBairro(''); return; }
    setLoadingSubdistritos(true); setSelectedBairro('');

    const muni = municipios.find(m => String(m.id) === selectedMunicipio);
    if (!muni) { setLoadingSubdistritos(false); return; }

    // Prioridade total pros bairros do nosso banco (os brabos que a gente povoou)
    fetch(`${API}/api/location/bairros/${encodeURIComponent(muni.nome)}/${encodeURIComponent(selectedUF)}`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : [])
      .then(localData => {
        if (localData && localData.length > 0) {
          setSubdistritos(localData.map((b: { id: number, bairro: string }) => ({ id: b.id, nome: b.bairro })));
          setLoadingSubdistritos(false);
        } else {
          // Se não tiver local, apela pro IBGE (URGs e afins)
          Promise.all([
            fetch(`${IBGE}/municipios/${selectedMunicipio}/subdistritos`).then(r => r.ok ? r.json() : []),
            fetch(`${IBGE}/municipios/${selectedMunicipio}/distritos`).then(r => r.ok ? r.json() : []),
          ]).then(([s, d]) => { 
            const all = [...s, ...d].sort((a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome)); 
            setSubdistritos(all); 
          })
          .catch(() => toast.error('Erro ao carregar bairros do IBGE'))
          .finally(() => setLoadingSubdistritos(false));
        }
      })
      .catch(() => {
        // Fallback rápido se o nosso servidor der ruim
        fetch(`${IBGE}/municipios/${selectedMunicipio}/subdistritos`).then(r => r.json())
          .then(d => setSubdistritos(d.sort((a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome))))
          .finally(() => setLoadingSubdistritos(false));
      });
  }, [selectedMunicipio, includeBairro, selectedUF, municipios, authHeaders]);

  // ── Options ───────────────────────────────────────────────────────────────
  const ufOptions = UF_DATA.sort((a, b) => a.nome.localeCompare(b.nome)).map(u => ({ value: u.sigla, label: `${u.sigla} — ${u.nome}` }));
  const municipioOptions = municipios.map(m => ({ value: String(m.id), label: m.nome }));
  const bairroOptions = subdistritos.map(s => ({ value: String(s.id), label: s.nome }));
  const repOptions = reps.map(r => ({ value: r.code || '', label: `${r.code || ''} — ${r.full_name || r.fullName || r.username}` }));

  const handleSelectMunicipio = (id: string) => { setSelectedMunicipio(id); setSelectedMunicipioName(municipios.find(m => String(m.id) === id)?.nome || ''); };

  // ── Reps CRUD ─────────────────────────────────────────────────────────────
  const handleCreateRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRep.code.trim() || !newRep.name.trim()) { toast.error('Código e nome obrigatórios'); return; }
    const res = await fetch(`${API}/api/admin/reps`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        ...newRep,
        fullName: newRep.fullName || newRep.name
      })
    });
    if (res.ok) {
      toast.success(`Usuário ${newRep.code} cadastrado!`);
      addAudit('create_rep', 'Usuário', newRep.code, `Criou usuário ${newRep.code} — ${newRep.name}`);
      setNewRep({
        userId: '', code: '', name: '', fullName: '', isVago: 0, colorIndex: 1, email: '', contato: '',
        endereco: '', bairro: '', cidade: '', uf: '', cep: '', comissao: ''
      });
      setIsRepModalOpen(false);
      fetchAll();
    }
    else { const err = await res.json(); toast.error(err.message || 'Erro'); }
  };

  const handleDeleteRep = (code: string, name: string) => {
    openConfirm('Remover usuário', `"${name}" e todos os seus territórios serão removidos.`, async () => {
      closeConfirm();
      const res = await fetch(`${API}/api/admin/reps/${code}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) { toast.success('Removido!'); addAudit('delete_rep', 'Usuário', code, `Removeu usuário ${code} — ${name}`); fetchAll(); }
      else toast.error('Erro ao remover');
    });
  };

  const handleUpdateRep = async (code: string) => {
    if (!editForm.name.trim()) { toast.error('Nome obrigatório'); return; }
    const res = await fetch(`${API}/api/admin/reps/${code}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        ...editForm,
        fullName: editForm.fullName || editForm.name
      })
    });
    if (res.ok) {
      toast.success('Atualizado!');
      addAudit('update_rep', 'Usuário', code, `Editou usuário ${code}`);
      setEditingCode(null);
      fetchAll();
    }
    else toast.error('Erro ao atualizar');
  };

  // ── Territory CRUD ────────────────────────────────────────────────────────
  const handleAddToStaged = () => {
    if (!selectedUF || !selectedUserForTerritory) { toast.error('Selecione ao menos o estado e o usuário'); return; }
    
    const municipioLabel = selectedMunicipioName || 'Estado Inteiro';
    if (staged.find(s => s.municipio === (selectedMunicipioName || null) && s.uf === selectedUF && String(s.userId) === selectedUserForTerritory && s.modo === selectedModo)) { 
      toast.warning('Esta atribuição já está na lista'); 
      return; 
    }
    
    setStaged(prev => [...prev, { 
      municipio: selectedMunicipioName || '', // No backend trataremos string vazia como null
      uf: selectedUF, 
      bairro: includeBairro && selectedBairro ? subdistritos.find(s => String(s.id) === selectedBairro)?.nome : undefined, 
      userId: Number(selectedUserForTerritory), 
      modo: selectedModo 
    }]);
    
    setSelectedMunicipio(''); 
    setSelectedMunicipioName(''); 
    setSelectedBairro('');
    toast.success(`${municipioLabel} adicionado à lista!`);
  };

  const handleConfirmStaged = async () => {
    if (!staged.length) { toast.error('Nada para confirmar'); return; }
    let ok = 0, fail = 0;
    for (const item of staged) {
      const res = await fetch(`${API}/api/admin/territories`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          municipio: item.municipio || null,
          uf: item.uf,
          userId: item.userId,
          modo: item.modo
        })
      });
      if (res.ok) {
        ok++;
        addAudit('assign_territory', 'Território', item.municipio || 'Estado', `Atribuiu ${item.municipio || item.uf}/${item.uf} → ${item.userId}`);

        // Update user's assigned_state when a state territory is assigned
        if (!item.municipio) {
          // This is a state-level territory assignment, update user's assigned_state
          try {
            const userRes = await fetch(`${API}/api/admin/users/${item.userId}`, {
              method: 'PUT',
              headers: authHeaders,
              body: JSON.stringify({ assigned_state: item.uf })
            });
            if (userRes.ok) {
              console.log(`Updated assigned_state for user ${item.userId} to ${item.uf}`);
            }
          } catch (error) {
            console.error('Error updating user assigned_state:', error);
          }
        }
      }
      else fail++;
    }
    if (ok) toast.success(`${ok} território(s) atribuído(s)!`);
    if (fail) toast.error(`${fail} falhou`);
    setStaged([]); fetchAll();
  };

  const handleDeleteTerritory = async (id: number, municipio: string, userId: number, uf: string) => {
    const res = await fetch(`${API}/api/admin/territories/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) {
      toast.success(`${municipio} removido!`);
      addAudit('delete_territory', 'Território', String(id), `Removeu ${municipio}/${uf}`);

      // If this was a state-level territory, check if user still has any territories in this state
      if (!municipio) {
        const remainingTerritoriesInUF = territories.filter(t => t.uf === uf && t.userId === userId);
        if (remainingTerritoriesInUF.length === 0) {
          // User no longer has any territories in this state, clear assigned_state
          try {
            const userRes = await fetch(`${API}/api/admin/users/${userId}`, {
              method: 'PUT',
              headers: authHeaders,
              body: JSON.stringify({ assigned_state: '' })
            });
            if (userRes.ok) {
              console.log(`Cleared assigned_state for user ${userId}`);
            }
          } catch (error) {
            console.error('Error clearing user assigned_state:', error);
          }
        }
      }

      fetchAll();
    }
    else toast.error('Erro');
  };

  const handleRemoveUserFromUF = async (uf: string, userId: number) => {
    // Buscar todas as atribuições (territories) deste usuário para este UF
    const relatedTerritories = territories.filter(t => t.uf === uf && t.userId === userId);
    
    if (relatedTerritories.length === 0) {
      toast.error('Nenhuma atribuição encontrada para este usuário neste estado.');
      return;
    }

    openConfirm(
      'Remover Usuário do Estado?',
      `Isso removerá todas as ${relatedTerritories.length} atribuições (municípios e estado) de "${users.find(u => u.id === userId)?.username}" no estado ${uf}.`,
      async () => {
        setIsRemovingUser(true);
        try {
          let ok = 0;
          let fail = 0;
          
          for (const t of relatedTerritories) {
            const res = await fetch(`${API}/api/admin/territories/${t.id}`, { 
              method: 'DELETE', 
              headers: authHeaders 
            });
            if (res.ok) ok++;
            else fail++;
          }

          if (ok > 0) {
            toast.success(`${ok} atribuições removidas com sucesso!`);
            addAudit('remove_user_from_uf', 'Território', uf, `Removeu usuário ${userId} do estado ${uf} (${ok} locais)`);

            // Check if user still has any state-level territories in this UF
            const remainingStateTerritories = territories.filter(t => t.uf === uf && t.userId === userId && !t.municipio);
            if (remainingStateTerritories.length === 0) {
              // User no longer has state-level territory in this UF, clear assigned_state
              try {
                const userRes = await fetch(`${API}/api/admin/users/${userId}`, {
                  method: 'PUT',
                  headers: authHeaders,
                  body: JSON.stringify({ assigned_state: '' })
                });
                if (userRes.ok) {
                  console.log(`Cleared assigned_state for user ${userId} after removing from ${uf}`);
                }
              } catch (error) {
                console.error('Error clearing user assigned_state:', error);
              }
            }

            fetchAll();
          }
          if (fail > 0) toast.error(`Falha ao remover ${fail} atribuições.`);
        } catch (error) {
          toast.error('Erro de conexão ao remover usuário.');
        } finally {
          setIsRemovingUser(false);
          closeConfirm();
        }
      }
    );
  };

  const filteredTerritories = territories.filter(t => {
    if (filterUF && !t.uf.toLowerCase().includes(filterUF.toLowerCase())) return false;
    if (filterUserForTerritory && String(t.userId) !== filterUserForTerritory) return false;
    return true;
  });

  // ── Users CRUD ────────────────────────────────────────────────────────────
  const fetchCepAdmin = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setNewUser(prev => ({
          ...prev,
          logradouro: data.logradouro,
          bairro_end: data.bairro,
          cidade: data.localidade,
          estado_end: data.uf
        }));
      }
    } catch (e) {
      console.error('Erro ao buscar CEP', e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.code.trim() || !newUser.password.trim()) {
      toast.error('Código e Senha são obrigatórios'); return;
    }
    if (newUser.password !== newUser.confirmPassword) { toast.error('As senhas não coincidem!'); return; }

    // Mapeia tipo de cadastro → role do sistema
    const selectedType = userTypes.find(t => String(t.id) === newUser.userTypeId);

    const body: Record<string, any> = {
      code: newUser.code,
      full_name: newUser.fullName,
      username: newUser.email || newUser.code,
      password: newUser.password,
      role: newUser.role,
      tipo: newUser.tipo || 'normal',
      telefone: newUser.telefone,
      cpf_cnpj: newUser.document,
      birth_date: newUser.birthDate || null,
      cargo: newUser.cargo,
      company_name: newUser.companyName,
      groupId: newUser.groupId ? Number(newUser.groupId) : null,
      photo: newUser.photo || null,
      photoBorderColor: newUser.photoBorderColor || '#FFD700',
      cep: newUser.cep,
      logradouro: newUser.logradouro,
      numero: newUser.numero,
      complemento: newUser.complemento,
      bairro_end: newUser.bairro_end,
      cidade: newUser.cidade,
      estado_end: newUser.estado_end,
      assigned_state: newUser.assigned_state,
      area_atuacao: newUser.area_atuacao,
      base_logistica: newUser.base_logistica,
      default_screen: newUser.default_screen,
      canVisit: newUser.canVisit,
      userTypeId: newUser.userTypeId ? Number(newUser.userTypeId) : null,
      managedUserIds: newUser.managedUserIds,
      permissions: newUser.permissions
    };

    try {
      const res = await fetch(`${API}/api/admin/users`, { method: 'POST', headers: authHeaders, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(`Usuário "${newUser.fullName}" criado!`);
        addAudit('create_user', 'Usuário', newUser.code, `Criou usuário ${newUser.fullName} (${newUser.code})`);
        setNewUser({
          fullName: '', email: '', password: '', confirmPassword: '',
          role: 'user', code: '', documentType: 'cpf',
          document: '', companyName: '', birthDate: '', telefone: '', photo: '', photoBorderColor: '#FFD700',
          cargo: '', groupId: '', tipo: 'normal', colorIndex: 0,
          cep: '', logradouro: '', numero: '', complemento: '', bairro_end: '', cidade: '', estado_end: '', assigned_state: '', area_atuacao: '', base_logistica: '',
          userTypeId: '',
          default_screen: 'mapa',
          managedUserIds: [],
          canVisit: false,
          permissions: availableModules.map((m: any) => ({ moduleId: m.id, canView: true, canEdit: false }))
        });
        setIsUserModalOpen(false);
        fetchAll();
      }
      else { const err = await res.json(); toast.error(err.message || 'Erro'); }
    } catch (err) {
      toast.error('Erro ao criar usuário');
    }
  };

  const handleDeleteUser = (id: number, username: string) => {
    openConfirm('Remover usuário', `"${username}" perderá acesso imediatamente.`, async () => {
      closeConfirm();
      const res = await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) { toast.success('Usuário removido!'); addAudit('delete_user', 'Usuário', String(id), `Removeu usuário ${username}`); fetchAll(); }
      else { const err = await res.json(); toast.error(err.message || 'Erro'); }
    });
  };

  const handleUpdateUser = async (id: number) => {
    if (!editUserForm.username.trim()) { toast.error('Email (Username) obrigatório'); return; }
    if (editUserForm.password && editUserForm.password !== editUserForm.confirmPassword) { toast.error('As senhas não coincidem!'); return; }
    
    const selectedType = userTypes.find(t => String(t.id) === editUserForm.userTypeId);

    const body: Record<string, any> = { 
      username: editUserForm.username, 
      role: selectedType?.isAdmin ? 'admin' : 'user', 
      full_name: editUserForm.fullName,
      telefone: editUserForm.telefone,
      cpf_cnpj: editUserForm.document,
      birth_date: editUserForm.birthDate || null,
      cargo: editUserForm.cargo,
      company_name: editUserForm.companyName,
      groupId: editUserForm.groupId ? Number(editUserForm.groupId) : null,
      userTypeId: editUserForm.userTypeId ? Number(editUserForm.userTypeId) : null,
      canVisit: editUserForm.canVisit,
      managedUserIds: editUserForm.managedUserIds
    };

    if (editUserForm.password.trim()) body.password = editUserForm.password;
    if (editUserForm.photo) body.photo = editUserForm.photo;

    try {
      const res = await fetch(`${API}/api/admin/users/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success('Usuário atualizado!');
        addAudit('update_user', 'Usuário', String(id), `Atualizou usuário ${editUserForm.username}`);
        setEditingUserId(null);
        setIsUserModalOpen(false);
        fetchAll();
      }
      else { const err = await res.json(); toast.error(err.message || 'Erro'); }
    } catch (err) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleKickUser = async (user: SystemUser) => {
    openConfirm('Derrubar Sessão', `Tem certeza que deseja encerrar a sessão de ${user.full_name || user.fullName || user.username}? O usuário será desconectado imediatamente.`, async () => {
      closeConfirm();
      const res = await fetch(`${API}/api/admin/users/${user.id}/kick`, { method: 'POST', headers: authHeaders });
      if (res.ok) {
        toast.success(`Sessão de ${user.username} encerrada!`);
        fetchAll();
      } else {
        toast.error('Erro ao derrubar sessão');
      }
    });
  };

  // ── Groups CRUD ───────────────────────────────────────────────────────────
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) { toast.error('Nome do grupo obrigatório'); return; }
    const g: Group = { id: Date.now().toString(), name: newGroupName.trim(), userIds: [], createdAt: new Date().toISOString() };
    saveGroups([...groups, g]); addAudit('create_group', 'Grupo', g.id, `Criou grupo "${g.name}"`); setNewGroupName(''); toast.success('Grupo criado!');
  };

  const handleDeleteGroup = (g: Group) => {
    openConfirm('Remover grupo', `O grupo "${g.name}" será removido.`, () => { closeConfirm(); saveGroups(groups.filter(x => x.id !== g.id)); addAudit('delete_group', 'Grupo', g.id, `Removeu grupo "${g.name}"`); toast.success('Grupo removido!'); });
  };

  const handleSaveGroupUsers = (groupId: string) => {
    saveGroups(groups.map(g => g.id === groupId ? { ...g, userIds: groupAddUsers } : g));
    addAudit('update_group', 'Grupo', groupId, `Atualizou membros do grupo`);
    setExpandedGroup(null); toast.success('Grupo atualizado!');
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) { toast.error('Título e mensagem são obrigatórios'); return; }
    if (!notifTargetAll && notifTargetUsers.length === 0) { toast.error('Selecione ao menos um usuário destinatário'); return; }

    try {
      const res = await fetch(`${API}/api/notifications`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          targetAll: notifTargetAll,
          targetUserIds: notifTargetAll ? [] : notifTargetUsers
        })
      });

      if (res.ok) {
        toast.success(notifTargetAll
          ? 'Alerta enviado com sucesso para todos os usuários!'
          : `Alerta enviado com sucesso para ${notifTargetUsers.length} usuário(s)!`
        );
        setNotifTitle('');
        setNotifMessage('');
        setNotifTargetAll(true);
        setNotifTargetUsers([]);
        setNotifUserSearch('');
        fetchNotifications();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Erro ao enviar alerta');
      }
    } catch (error) {
      toast.error('Erro de conexão ao enviar alerta');
    }
  };

  const handleClearNotifications = async () => {
    openConfirm('Limpar Histórico', 'Deseja realmente apagar todo o histórico de alertas?', async () => {
      closeConfirm();
      try {
        const res = await fetch(`${API}/api/notifications/clear`, {
          method: 'DELETE',
          headers: authHeaders
        });
        if (res.ok) {
          toast.success('Histórico removido');
          setNotifications([]);
        } else {
          toast.error('Erro ao limpar histórico');
        }
      } catch (error) {
        toast.error('Erro de conexão');
      }
    });
  };

  const openImagePickerForEditor = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Selecione um arquivo de imagem válido.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error('Imagem muito grande. Limite de 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const range = quill.getSelection(true);
        const index = range ? range.index : quill.getLength();
        quill.insertEmbed(index, 'image', reader.result, 'user');
        quill.setSelection(index + 1, 0);
      };
      reader.readAsDataURL(file);
    };
  }, []);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ font: NOTIF_FONT_WHITELIST }],
        [{ size: NOTIF_SIZE_WHITELIST }],
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: openImagePickerForEditor,
      },
    },
  }), [openImagePickerForEditor]);

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'align',
    'link', 'image'
  ];

  const dailyMessages = [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "A persistência é o caminho do êxito.",
    "A única maneira de fazer um excelente trabalho é amar o que você faz.",
    "Grandes jornadas começam com um pequeno passo.",
    "Sua limitação é apenas sua imaginação.",
    "Pense positivo e coisas boas acontecerão.",
    "O melhor momento para plantar uma árvore foi há 20 anos. O segundo melhor é agora.",
    "Você é mais forte do que imagina.",
    "Acredite em si próprio e o resto virá naturalmente.",
    "O que você faz hoje pode melhorar todos os seus amanhãs."
  ];
  const getDayMessage = () => {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % dailyMessages.length;
    return dailyMessages[index];
  };

  // ─── Render Sidebar ─────────────────────────────────────────────────────────

  // Se estiver carregando pela primeira vez, mostramos o Loader centralizado
  if (loading && !initialLoadDone) {
    return <Loader label="Carregando Painel..." />;
  }

  return (<>
    <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} description={confirmDialog.description} confirmLabel="Confirmar" onConfirm={confirmDialog.onConfirm} onCancel={closeConfirm} />

    <div className="admin-layout">
      {buttonStyles && <style>{buttonStyles}</style>}
      {/* ━━ SIDEBAR (Desktop) ━━ */}
      <aside 
        className="admin-sidebar hidden lg:flex"
        style={brandSidebarColor && theme !== 'dark' ? { background: brandSidebarColor } : {}}
      >
        <SidebarContent 
          displayPhoto={displayPhoto} 
          displayName={displayName} 
          displayEmail={displayEmail}
          displayTipo={displayTipo}
          navItems={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expandedMenus={expandedMenus}
          setExpandedMenus={setExpandedMenus}
          theme={theme}
          sidebarBgColor={brandSidebarColor}
          sidebarStyles={{
            textColor: brandSidebarTextColor,
            textActiveColor: brandSidebarTextActiveColor,
            hoverColor: brandSidebarHoverColor,
            activeBgColor: brandSidebarActiveBgColor,
            parentActiveBgColor: brandSidebarParentActiveBgColor
          }}
        />
      </aside>

      {/* ━━ MAIN ━━ */}
      <div className="admin-main">

        {/* Top Header */}
        <header className="admin-header px-4 lg:px-6">
          <div className="admin-header-left">
            <div className="flex items-center gap-3">
              {/* Hamburger Mobile */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r-border/50">
                  <div 
                    className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(var(--admin-sidebar-bg))] to-[hsl(var(--admin-sidebar-bg-end))]"
                    style={brandSidebarColor && theme !== 'dark' ? { background: brandSidebarColor } : {}}
                  >
                    <SidebarContent 
                      displayPhoto={displayPhoto} 
                      displayName={displayName} 
                      displayEmail={displayEmail}
                      displayTipo={displayTipo}
                      navItems={navItems}
                      activeTab={activeTab}
                      setActiveTab={(id) => { setActiveTab(id); setIsMobileMenuOpen(false); }}
                      expandedMenus={expandedMenus}
                      setExpandedMenus={setExpandedMenus}
                      theme={theme}
                      sidebarBgColor={brandSidebarColor}
                      sidebarStyles={{
                        textColor: brandSidebarTextColor,
                        textActiveColor: brandSidebarTextActiveColor,
                        hoverColor: brandSidebarHoverColor,
                        activeBgColor: brandSidebarActiveBgColor,
                        parentActiveBgColor: brandSidebarParentActiveBgColor
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {activeNavInfo && (
                <div className="admin-header-icon hidden sm:flex">
                  {React.createElement(activeNavInfo.icon, { style: { width: 17, height: 17 } })}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="admin-header-title truncate">{activeNavInfo?.label ?? 'Painel'}</h1>
                <p className="admin-header-sub hidden lg:block">Painel Administrativo</p>
              </div>
            </div>
          </div>
          <div className="admin-header-right gap-1.5 sm:gap-2">
            {(activeTab === 'dashboard' || activeTab === 'baserotas' || activeTab === 'territories') && (
              <Button 
                variant="outline" 
                size="sm" 
                className={`lg:hidden h-9 w-9 p-0 flex items-center justify-center transition-all border-primary/20 ${isDashFiltersOpen ? 'bg-primary/10 text-primary border-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.1)]' : 'bg-background hover:bg-secondary'}`}
                onClick={() => setIsDashFiltersOpen(!isDashFiltersOpen)}
                title={isDashFiltersOpen ? 'Fechar Filtros' : 'Abrir Filtros'}
              >
                <Filter className={`w-4 h-4 ${isDashFiltersOpen ? 'animate-pulse' : ''}`} />
              </Button>
            )}

            <SpaceButton onClick={() => navigate('/mapa')} />

            <button className="admin-header-icon-btn h-9 w-9 flex items-center justify-center" onClick={fetchAll} title="Recarregar dados">
              <RefreshCw className={isRefreshing ? "animate-spin" : ""} style={{ width: 16, height: 16 }} />
            </button>

            <div className="w-px h-6 bg-border/50 mx-0.5" />

            <Popover 
              open={showNotifMenu} 
              onOpenChange={(open) => {
                setShowNotifMenu(open);
                if (open) markAllAsSeen();
              }}
            >
              <PopoverTrigger asChild>
                <button className="admin-header-icon-btn relative shrink-0" title="Notificações">
                  <Bell style={{ width: 16, height: 16 }} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-destructive text-[9px] leading-[15px] text-white font-bold text-center animate-in zoom-in duration-300">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-32px)] sm:w-[380px] p-0 shadow-2xl border-primary/10 z-[1100]" align="end">
                <div className="px-4 py-4 bg-primary/5 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        Central de Notificações
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {unreadCount} nova(s)
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Últimos alertas do sistema</p>
                    </div>
                    <Bell className="w-4 h-4 text-primary/40" />
                  </div>
                </div>
                <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto custom-scrollbar">
                  {loadingNotifications ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Carregando alertas...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-xs text-muted-foreground">Nenhuma notificação por enquanto</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {notifications.map((n) => {
                        const isRead = n.seen;
                        return (
                          <div key={n.id} className={`group px-5 py-4 transition-all duration-200 ${isRead ? 'opacity-80' : 'bg-primary/[0.02] border-l-2 border-l-primary shadow-[inset_0_0_20px_rgba(var(--primary),0.01)]'}`}>
                            <div className="flex justify-between items-start gap-3">
                              <p className={`text-xs font-bold leading-tight ${isRead ? 'text-foreground/70' : 'text-foreground'}`}>
                                {n.title}
                              </p>
                              {!isRead && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                              )}
                            </div>
                            <div className="text-[11px] leading-relaxed text-muted-foreground mt-1.5 line-clamp-3 group-hover:line-clamp-none transition-all duration-300" 
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(n.message) }} 
                            />
                            <div className="flex items-center gap-2 mt-3">
                              <Clock className="w-3 h-3 text-muted-foreground/60" />
                              <p className="text-[10px] text-muted-foreground/70 font-medium">
                                {new Date(n.createdAt).toLocaleString('pt-BR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 bg-secondary/20 border-t border-border/40 text-center">
                    <button 
                      onClick={() => { setActiveTab('notifications'); setShowNotifMenu(false); }}
                      className="text-[10px] font-bold text-primary hover:underline transition-all"
                    >
                      Ver histórico completo
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Popover open={showUserMenu} onOpenChange={setShowUserMenu}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-secondary/50 rounded-lg transition-all border border-transparent hover:border-border/40 min-w-0 group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-primary/5 shrink-0 transition-transform group-hover:scale-105">
                    {displayPhoto ? (
                      <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User style={{ width: 14, height: 14 }} className="text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start text-left min-w-0 mr-1">
                    <span className="text-[11px] font-black text-foreground truncate leading-tight tracking-wide">
                      {displayName.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-muted-foreground truncate uppercase tracking-tight opacity-70 leading-tight mt-0.5">
                      {displayTipo}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50 hidden md:block shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-1.5 shadow-2xl border-primary/10 z-[1100] animate-in fade-in zoom-in-95 duration-200" align="end">
                <div className="flex items-center justify-between px-2.5 py-2 border-b border-border/60 mb-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Interface</span>
                  <ThemeToggle />
                </div>
                <div className="px-2.5 py-2 mb-1 bg-primary/[0.03] rounded-md mx-1">
                  <p className="text-[11px] font-black text-foreground truncate">{displayName.toUpperCase()}</p>
                  <p className="text-[9px] text-muted-foreground truncate uppercase tracking-tighter opacity-70">{displayTipo}</p>
                </div>
                <div className="h-px bg-border/40 my-1 mx-1" />
                <button
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold rounded-md hover:bg-primary/10 hover:text-primary transition-all group"
                  onClick={() => { 
                    setShowUserMenu(false); 
                    const me = users.find(u => u.id === Number(userId));
                    if (me) { setEditingUserId(me.id); setIsUserModalOpen(true); }
                    else { setEditingUserId(Number(userId)); setIsUserModalOpen(true); }
                  }}
                >
                  <User className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  Meu Perfil
                </button>
                <div className="h-px bg-border/40 my-1 mx-1" />
                <button
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold rounded-md text-destructive hover:bg-destructive/10 transition-all group"
                  onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                >
                  <LogOut className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  Sair da Conta
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className={activeTab === 'ajuda' ? 'admin-content admin-content--help' : 'admin-content'}>

          {/* ━━ AJUDA / DOCUMENTAÇÃO ━━ */}
          {activeTab === 'ajuda' && (
            <div className="admin-help-wrap -mx-2 md:-mx-4">
              <HelpDocumentation embedded />
            </div>
          )}

          {/* ━━ DASHBOARD ━━ */}
          {activeTab === 'dashboard' && (() => {
            // ── Derived / filtered data ──────────────────────────────────────
            const filteredClientes = clientes.filter(c => {
              if (dashFilterUser && dashFilterUser !== 'all' && String(c.userId) !== dashFilterUser) return false;
              if (dashFilterUF && dashFilterUF !== 'all' && c.uf !== dashFilterUF) return false;
              if (dashSearch) {
                const q = dashSearch.toLowerCase();
                const userName = users.find(u => u.id === c.userId)?.full_name?.toLowerCase() || '';
                if (!(c.nome_cliente || '').toLowerCase().includes(q) && !(c.cidade || '').toLowerCase().includes(q) && !(c.uf || '').toLowerCase().includes(q) && !userName.includes(q)) return false;
              }
              return true;
            });

            // Group by UF
            const byUF: Record<string, typeof filteredClientes> = {};
            for (const c of filteredClientes) {
              const uf = c.uf || 'Sem UF';
              if (!byUF[uf]) byUF[uf] = [];
              byUF[uf].push(c);
            }
            const ufEntries = Object.entries(byUF).sort((a, b) => b[1].length - a[1].length);

            // Unique UFs and users for dropdowns
            const allUFs = [...new Set([
              ...territories.map(t => (t.uf || '').trim().toUpperCase()),
              ...clientes.map(c => (c.uf || '').trim().toUpperCase()),
            ].filter(Boolean))].sort();
            const activeUsers = users.filter(u => !u.isVago);

            const clearFilters = () => { setDashFilterUser('all'); setDashFilterUF('all'); setDashSearch(''); };
            const hasFilters = (dashFilterUser && dashFilterUser !== 'all') || (dashFilterUF && dashFilterUF !== 'all') || dashSearch;

            return (
              <div className="flex flex-col gap-5 no-scrollbar pb-10 sm:pb-0">
                <div className="admin-card lg:shrink-0" style={{ padding: '14px 20px', borderLeft: '3px solid hsl(var(--admin-sidebar-accent))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <MessageSquare style={{ width: 14, height: 14, color: 'hsl(var(--admin-sidebar-accent))' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em' }}>Mensagem do Dia</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' }}>
                    "{getDayMessage()}"
                  </p>
                </div>

                {/* ── FILTER SECTION (Mobile: Collapsible / Desktop: Always visible) ── */}
                <div className={`${isDashFiltersOpen ? 'flex animate-in slide-in-from-top-4 duration-300' : 'hidden lg:flex'} admin-card p-4 sm:p-[14px_20px] lg:shrink-0`}>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0 sm:min-w-[140px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={dashSearch}
                        onChange={e => setDashSearch(e.target.value)}
                        placeholder="Buscar município, UF..."
                        className="w-full pl-9 pr-3 h-9 border border-border rounded-lg bg-background text-foreground text-xs sm:text-[0.8rem] outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* User dropdown */}
                      <Select value={dashFilterUser} onValueChange={setDashFilterUser}>
                        <SelectTrigger className="h-9 w-40 text-[10px] font-bold uppercase bg-background border-border/40">
                          <SelectValue placeholder="Todos Usuários" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos Usuários</SelectItem>
                          {users.filter(u => !u.isVago).map(u => (
                            <SelectItem key={u.id} value={String(u.id)}>{u.username}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* UF dropdown */}
                      <Select value={dashFilterUF} onValueChange={setDashFilterUF}>
                        <SelectTrigger className="h-9 w-24 sm:w-32 text-[10px] font-bold uppercase bg-background border-border/40">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as UFs</SelectItem>
                          {allUFs.map(uf => (
                            <SelectItem key={uf} value={uf || 'empty'}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Clear */}
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="h-9 px-3 rounded-lg text-xs font-bold border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
                        >
                          <X className="w-3 h-3" /> <span className="hidden sm:inline">Limpar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── 2-COLUMN: Results + Map ── */}
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-5">

                  {/* LEFT: Territory result cards */}
                  <div className="flex flex-col gap-2.5 no-scrollbar order-2 lg:order-1">
                    {ufEntries.length === 0 ? (
                      <div className="admin-card p-10 text-center text-muted-foreground">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhum território encontrado</p>
                      </div>
                    ) : ufEntries.map(([uf, terrs]) => {
                      // Filtramos IDs inválidos ou nulos para evitar os "círculos fantasmas"
                      const uniqueUserIds = [...new Set(terrs.map(t => t.userId).filter(id => id !== null && id !== undefined))];
                      const topMunicipalities = [...new Set(terrs.map(t => t.cidade))].slice(0, 3);
                      
                      return (
                        <div key={uf} className="admin-card p-0 overflow-hidden shrink-0 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-l-4 border-l-primary">
                          {/* UF header - Refined Designer Style */}
                          <div className="p-4 sm:p-5 bg-gradient-to-r from-secondary/30 to-transparent">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              {/* UF Badge */}
                              <div className="relative">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary text-primary-foreground font-black text-lg tracking-tighter shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                  {uf}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full border-2 border-primary flex items-center justify-center">
                                  <MapPin className="w-2.5 h-2.5 text-primary" />
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-black text-base sm:text-lg tracking-tight">
                                    {uf === 'Sem UF' ? 'Território Indefinido' : `Estado de ${uf}`}
                                  </h3>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest animate-pulse">
                                    Ativo
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <UsersRound className="w-3 h-3" />
                                    <span className="text-xs font-bold">{uniqueUserIds.length} Repr.</span>
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-border" />
                                  <div className="flex items-center gap-1">
                                    <Database className="w-3 h-3" />
                                    <span className="text-xs font-bold">{terrs.length} Clientes</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-3 w-full sm:w-auto self-stretch justify-between">
                                {/* User avatars stacked */}
                                <div className="flex -space-x-2 self-end">
                                  {uniqueUserIds.slice(0, 5).map((id, idx) => {
                                    const user = users.find(u => u.id === id);
                                    const bgColor = (user && !user.isVago && user.colorIndex) ? (REP_COLOR_PALETTE[user.colorIndex] || '#6b7280') : '#6b7280';
                                    
                                    // Função local simples para contraste de texto (Branco ou Preto)
                                    // Suporta Hex (#ffffff) e HSL (hsl(0, 0%, 100%))
                                    const getContrast = (color: string) => {
                                      if (!color || typeof color !== 'string') return '#ffffff';
                                      
                                      // Se for HSL, pegamos o valor de Lightness (L)
                                      if (color.startsWith('hsl')) {
                                        try {
                                          const parts = color.split(',');
                                          if (parts.length < 3) return '#ffffff';
                                          const lightnessPart = parts[2].trim(); // ex: "55%)"
                                          const lightness = parseInt(lightnessPart, 10);
                                          return lightness >= 60 ? '#000000' : '#ffffff';
                                        } catch (e) {
                                          return '#ffffff';
                                        }
                                      }

                                      // Se for Hex
                                      if (color.startsWith('#')) {
                                        try {
                                          const hex = color.replace('#', '');
                                          const r = parseInt(hex.substring(0, 2), 16);
                                          const g = parseInt(hex.substring(2, 4), 16);
                                          const b = parseInt(hex.substring(4, 6), 16);
                                          const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                                          return yiq >= 128 ? '#000000' : '#ffffff';
                                        } catch (e) {
                                          return '#ffffff';
                                        }
                                      }

                                      return '#ffffff';
                                    };
                                    const textColor = getContrast(bgColor);

                                    const initials = (user?.full_name || user?.fullName || user?.username || 'SR').substring(0, 2).toUpperCase();
                                    return (
                                      <Tooltip key={id}>
                                        <TooltipTrigger asChild>
                                          <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-[0.7rem] font-black border-2 border-white dark:border-gray-800 shadow-md transition-all hover:-translate-y-1 hover:z-20 cursor-help" 
                                            style={{ 
                                              backgroundColor: bgColor, 
                                              color: textColor,
                                              zIndex: 10 - idx,
                                              marginLeft: idx === 0 ? 0 : '-0.5rem' // Espaçamento controlado
                                            }}
                                          >
                                            {initials}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-[10px] font-bold">
                                          {user?.full_name || user?.username}
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                  {uniqueUserIds.length > 5 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[0.6rem] font-black z-0">
                                      +{uniqueUserIds.length - 5}
                                    </div>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => { setDashFilterUF(uf === dashFilterUF ? 'all' : uf); }}
                                  className={`w-full sm:w-auto px-4 py-1.5 rounded-xl text-[0.75rem] font-black transition-all duration-300 shadow-sm ${
                                    dashFilterUF === uf 
                                      ? 'bg-destructive text-destructive-foreground shadow-destructive/20' 
                                      : 'bg-primary text-primary-foreground shadow-primary/20 hover:scale-105 active:scale-95'
                                  }`}
                                >
                                  {dashFilterUF === uf ? 'REMOVER FILTRO' : 'EXPLORAR REGIÃO'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* List of main municipalities/clients */}
                          <div className="p-2 pt-0">
                            <div className="rounded-xl overflow-hidden border border-border/40 bg-background/40 divide-y divide-border/20">
                              {terrs.slice(0, 4).map(c => {
                                const user = users.find(u => u.id === c.userId);
                                const color = user && !user.isVago ? REP_COLOR_PALETTE[user.colorIndex || 0] : 'hsl(0 0% 40%)';
                                return (
                                  <div key={c.codigo_cliente || c.id_cliente} className="group/row flex items-center gap-4 p-3 hover:bg-primary/[0.03] transition-colors">
                                    <div className="w-1.5 h-6 rounded-full shrink-0 group-hover/row:scale-y-125 transition-transform" style={{ background: color }} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[0.85rem] font-bold truncate tracking-tight uppercase">{c.nome_cliente}</p>
                                      <p className="text-[0.7rem] text-muted-foreground font-medium uppercase">{c.cidade}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[0.65rem] font-black px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border uppercase tracking-tighter">
                                        {user?.username || 'S/ USER'}
                                      </span>
                                      <span className="text-[0.6rem] text-muted-foreground/60 font-mono">#{c.codigo_cliente || '000'}</span>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              <div className="p-3 bg-secondary/10 flex items-center justify-between">
                                <p className="text-[0.7rem] text-muted-foreground font-bold italic">
                                  {terrs.length > 4 ? `+ ${terrs.length - 4} outros registros nesta região` : 'Todos os registros exibidos'}
                                </p>
                                <div className="flex gap-1">
                                  {topMunicipalities.map(m => (
                                    <span key={m} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-background/50 border border-border/40 uppercase opacity-60">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* RIGHT: Mini map + legends */}
                  <div className="flex flex-col gap-3.5 order-1 lg:order-2 lg:shrink-0">
                    {/* Map card */}
                    <div className="admin-card p-0 overflow-hidden">
                      <div className="p-3 px-4 border-b border-admin-card-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Map className="w-3.5 h-3.5 text-admin-sidebar-accent" />
                          <span className="font-bold text-[0.82rem]">Mapa de Cobertura</span>
                          {dashFilterUF && dashFilterUF !== 'all' && (
                            <span className="ml-auto text-[0.7rem] font-bold text-admin-sidebar-accent">
                              {dashFilterUF}
                            </span>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-7 px-2 text-[10px] font-bold gap-1 md:hidden transition-colors ${isDashMapOpen ? 'bg-primary/10 text-primary' : ''}`}
                          onClick={() => setIsDashMapOpen(!isDashMapOpen)}
                        >
                          {isDashMapOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isDashMapOpen ? 'Fechar' : 'Abrir'}
                        </Button>
                      </div>
                      <div className={`${isDashMapOpen ? 'block' : 'hidden md:block'} p-2 pb-1 bg-admin-sidebar-bg/3 h-[180px] sm:h-auto overflow-hidden animate-in fade-in zoom-in duration-300`}>
                        <div className="w-full h-full flex items-center justify-center scale-[0.85] sm:scale-100 origin-center transition-transform">
                        <React.Suspense fallback={<Loader2 className="animate-spin" />}>
                          <MiniMapBrasil
                            territories={territories}
                            filterUF={dashFilterUF === 'all' ? '' : dashFilterUF}
                            onClickUF={uf => setDashFilterUF(prev => prev === uf ? 'all' : uf)}
                          />
                        </React.Suspense>
                        </div>
                      </div>
                    </div>

                    {/* User legend - Desktop only or small scrollable list on mobile */}
                    {role === 'admin' && (
                      <div className="admin-card p-0 overflow-hidden flex-1 hidden md:block">
                        <div className="p-3 px-4 border-b border-admin-card-border flex items-center gap-2">
                          <UsersRound className="w-3.5 h-3.5 text-admin-sidebar-accent" />
                          <span className="font-bold text-[0.82rem]">Usuários Ativos</span>
                        </div>
                        <div className="p-2 max-h-[150px] sm:max-h-[200px] overflow-y-auto">
                          {users.filter(u => !u.isVago).length === 0 ? (
                            <p className="p-3 text-[0.78rem] text-muted-foreground">Nenhum usuário</p>
                          ) : users
                            .filter(u => !u.isVago)
                            .map(user => {
                              const rawLastActive = user.last_active || (user as any).lastActive;
                              const lastDate = rawLastActive ? new Date(rawLastActive) : null;
                              const hasEverLoggedIn = lastDate !== null && !isNaN(lastDate.getTime()) && lastDate.getFullYear() > 1970;
                              const isUserOnline = hasEverLoggedIn && ((user.id === userId) || (Date.now() - lastDate!.getTime() < 300000));
                              
                              return { ...user, isUserOnline };
                            })
                            .sort((a, b) => (b.isUserOnline ? 1 : 0) - (a.isUserOnline ? 1 : 0))
                            .map(user => {
                              const repColor = REP_COLOR_PALETTE[user.colorIndex || 0] || 'hsl(220 15% 40%)';
                              const count = clientes.filter(c => c.userId === user.id).length;
                              const isFilterSelected = dashFilterUser === String(user.id);
                              
                              return (
                                <button
                                  key={user.id}
                                  onClick={() => setDashFilterUser(prev => prev === String(user.id) ? 'all' : String(user.id))}
                                  className={`w-full flex items-center gap-2.5 p-1.5 px-4 border-none cursor-pointer text-left rounded-md transition-colors ${
                                    isFilterSelected ? 'bg-admin-sidebar-accent/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
                                  }`}
                                  title={user.isUserOnline ? 'Online agora' : 'Offline'}
                                >
                                  <div className="relative shrink-0">
                                    <div 
                                      className={`w-2.5 h-2.5 rounded-full ${user.isUserOnline ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20' : 'bg-muted-foreground/30'}`} 
                                    />
                                    <div 
                                      className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border border-current opacity-20" 
                                      style={{ color: repColor }}
                                    />
                                  </div>
                                  <span className={`flex-1 text-[0.78rem] truncate ${isFilterSelected ? 'font-black text-primary' : 'font-medium'}`}>
                                    {user.full_name || user.fullName || user.username}
                                  </span>
                                  <span className="text-[0.68rem] font-black px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 opacity-60">
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Quick stats & Reports */}
                    <div className="admin-card p-3 px-4 md:p-3 md:px-4 border-none md:border md:bg-admin-card-bg shadow-none md:shadow-sm">
                      <div className="pb-2.5 border-b border-admin-card-border mb-3 hidden md:flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-admin-sidebar-accent" />
                        <span className="font-bold text-[0.82rem]">Relatórios e Métricas</span>
                      </div>
                      <div className="flex md:grid md:grid-cols-2 gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {[
                          { l: 'Filtrados', v: filteredClientes.length, t: 'baserotas' as TabId, c: '#EAB308' },
                          { l: 'Territórios', v: territories.length, t: 'territories' as TabId, c: '#22C55E' },
                          { l: 'Estados', v: ufEntries.length, t: 'baserotas' as TabId, c: '#3B82F6' },
                          { l: 'Usuários', v: users.length, t: 'users' as TabId, c: '#06B6D4' },
                          { l: 'Grupos', v: groups.length, t: 'groups' as TabId, c: '#6366F1' },
                        ].map(s => (
                          <button
                            key={s.l}
                            onClick={() => setActiveTab(s.t)}
                            className="flex-1 min-w-[100px] md:min-w-0 p-2 md:p-2.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 cursor-pointer text-left hover:scale-[1.02] transition-transform"
                            style={{ borderLeft: `3px solid ${s.c}` }}
                          >
                            <p className="font-black text-sm md:text-lg leading-tight" style={{ color: s.c }}>{s.v}</p>
                            <p className="text-[10px] md:text-[0.65rem] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">{s.l}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ━━ USUÁRIOS ━━ */}
          {(activeTab === 'users' || activeTab.startsWith('user_type_')) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" /> 
                    {activeTab.startsWith('user_type_') 
                      ? userTypes.find(t => t.id === parseInt(activeTab.replace('user_type_', '')))?.name || 'Gestão de Usuários'
                      : 'Gestão de Usuários'}
                  </h2>
                  <p className="text-sm text-muted-foreground">Controle de acesso e permissões.</p>
                </div>
                <div className="flex w-full md:w-auto items-center gap-2 sm:gap-3">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <Input
                      placeholder={window.innerWidth < 640 ? "Buscar..." : "Buscar por nome ou email..."}
                      className="pl-8 sm:pl-9 h-9 sm:h-10 bg-background/50 border-border/40 text-xs sm:text-sm"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>

                  {/* Filtro de Ordenação Estilizado */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 sm:gap-2.5 bg-secondary/40 px-2 sm:px-4 py-2 rounded-lg border border-border/40 hover:bg-secondary/60 transition-all group">
                          <Filter className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                          <div className="hidden sm:flex flex-col items-start leading-none">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-70">ORDENAR POR</span>
                            <span className="text-xs font-bold text-foreground">
                              {userSortBy === 'name' ? 'Nome' : 
                               userSortBy === 'code' ? 'Código' : 
                               userSortBy === 'role' ? 'Tipo de Usuário' : 'Data de Criação'}
                            </span>
                          </div>
                          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground ml-0 sm:ml-1" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-1.5 shadow-2xl border-primary/10" align="end">
                        <div className="space-y-1">
                          {[
                            { id: 'name', label: 'Nome', icon: User },
                            { id: 'code', label: 'Código', icon: Database },
                            { id: 'role', label: 'Tipo de Usuário', icon: ShieldCheck },
                            { id: 'date', label: 'Data de Criação', icon: Calendar },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setUserSortBy(opt.id as any)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all ${userSortBy === opt.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                            >
                              <div className="flex items-center gap-3">
                                <opt.icon className={`w-4 h-4 ${userSortBy === opt.id ? 'text-white' : 'text-primary/60'}`} />
                                <span className="text-xs font-bold">{opt.label}</span>
                              </div>
                              {userSortBy === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    variant={userFilterOnline ? "default" : "outline"}
                    className={`h-9 sm:h-10 px-2 sm:px-4 gap-1 sm:gap-2 ${userFilterOnline ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white' : ''}`}
                    onClick={() => setUserFilterOnline(!userFilterOnline)}
                  >
                    <Activity className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${userFilterOnline ? 'animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">Online</span>
                    {userFilterOnline && <X className="w-3 h-3 ml-0 sm:ml-1" />}
                  </Button>
                  {activeTab.startsWith('user_type_') && (
                    <Button
                      className="h-9 sm:h-10 px-2 sm:px-4 gap-1 sm:gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        setSelectedUserIdsForType([]);
                        setAddUsersSearch('');
                        setAddUsersCodeFilter('');
                        setAddUsersTypeFilter('all');
                        setIsAddUsersModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar Usuários</span>
                    </Button>
                  )}
                  <Button className="h-9 sm:h-10 px-2 sm:px-4 gap-1 sm:gap-2 shadow-lg shadow-primary/20" onClick={() => {
                    setEditingUserId(null);
                    setNewUser({
                      fullName: '', email: '', password: '', confirmPassword: '',
                      role: 'user', code: '', documentType: 'cpf',
                      document: '', companyName: '', birthDate: '', telefone: '', photo: '', photoBorderColor: '#FFD700',
                      cargo: '', groupId: '', tipo: 'normal', colorIndex: 0,
                      cep: '', logradouro: '', numero: '', complemento: '', bairro_end: '', cidade: '', estado_end: '', assigned_state: '', area_atuacao: '', base_logistica: '',
                      userTypeId: '',
                      default_screen: 'mapa',
                      managedUserIds: [],
                      canVisit: false,
                      permissions: availableModules.map((m: any) => ({ moduleId: m.id, canView: true, canEdit: false }))
                    });
                    setIsUserModalOpen(true);
                  }}>
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Usuário</span>
                  </Button>
                </div>
              </div>

              {users.length === 0 ? (
                <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-muted-foreground bg-transparent">
                  <Users className="w-12 h-12 opacity-10 mb-4" /> <p>Nenhum usuário</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredUsers.map(u => {
                    const rawLastActive = u.last_active || (u as SystemUser & { lastActive?: string }).lastActive;
                    const lastDate = rawLastActive ? new Date(rawLastActive) : null;
                    const hasEverLoggedIn = lastDate !== null && !isNaN(lastDate.getTime()) && lastDate.getFullYear() > 1970;
                    const isOnline = hasEverLoggedIn && ((u.id === userId) || (Date.now() - lastDate!.getTime() < 300000));
                    const lastActive = hasEverLoggedIn ? lastDate : null;

                    const userType = userTypes.find(t => t.id === Number(u.userTypeId));
                    const hasSettingsPerm = u.permissions?.some(p => p.moduleId === 'settings' && p.canEdit);
                    const isAdminType = userType?.isAdmin || u.role === 'admin' || hasSettingsPerm;
                    
                    const cardColor = isAdminType ? '#fbbf24' : (userType?.color || '#3b82f6');
                    
                    const TypeIcon = userType?.icon && ICON_LIST[userType.icon as keyof typeof ICON_LIST] 
                      ? ICON_LIST[userType.icon as keyof typeof ICON_LIST] 
                      : (isAdminType ? ShieldCheck : (u.role === 'supervisor' ? Briefcase : User));

                    return (
                      <Card key={u.id} className="group relative overflow-hidden border-border/40 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="h-1.5 w-full absolute top-0 left-0" style={{ backgroundColor: cardColor }} />
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3">
                            <div className="relative">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-secondary border border-border/50 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300">
                                {u.photo ? <img src={u.photo} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/30" />}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center border-2 border-card shadow-sm text-white" style={{ backgroundColor: cardColor }}>
                                <TypeIcon className="w-2.5 sm:w-3" />
                              </div>
                              <div className={`absolute -top-1 -left-1 w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full border-2 border-card shadow-sm ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} title={isOnline ? 'Online' : 'Offline'} />
                            </div>
                            <div className="space-y-0.5 w-full overflow-hidden">
                              <h3 className="font-bold text-xs sm:text-sm truncate px-1" title={u.full_name || u.fullName || u.username}>{u.full_name || u.fullName || u.username}</h3>
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{u.username}</p>
                              
                              <div className="flex flex-col gap-0.5 mt-1">
                                {u.created_at || u.createdAt ? (
                                  <p className="text-[8px] sm:text-[9px] text-muted-foreground/60 flex items-center justify-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(u.created_at || u.createdAt || 0).toLocaleDateString('pt-BR')}
                                  </p>
                                ) : null}

                                {!isOnline && lastActive && (
                                  <p className="hidden sm:block text-[9px] text-muted-foreground/60 italic">Visto em {lastActive.toLocaleDateString('pt-BR')} às {lastActive.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                              <span className="text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-bold uppercase truncate max-w-full" style={{ backgroundColor: `${cardColor}20`, color: cardColor }}>{userType?.name || u.role}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-border/30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/10 hover:text-primary" onClick={() => {
                              setEditingUserId(u.id);
                              setEditUserForm({
                                username: u.username,
                                fullName: u.full_name || u.fullName || '',
                                document: u.document || u.cpf_cnpj || '',
                                password: '',
                                confirmPassword: '',
                                role: u.role as 'user' | 'supervisor' | 'admin',
                                code: u.code || '',
                                photo: u.photo || '',
                                photoBorderColor: (u as any).photoBorderColor || '#FFD700',
                                telefone: u.telefone || '',
                                birthDate: u.birth_date || u.birthDate || '',
                                cargo: u.cargo || '',
                                companyName: u.company_name || u.companyName || '',
                                groupId: String(u.groupId || ''),
                                userTypeId: String(u.userTypeId || ''),
                                canVisit: !!u.canVisit,
                                managedUserIds: u.managedUsers?.map(m => m.id) || []
                              });
                              setIsUserModalOpen(true);
                            }}><Pencil className="w-3.5 sm:w-4 h-3.5 sm:h-4" /></Button>
                            {(role === 'admin' || canEdit('settings')) && u.id !== userId && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-orange-500/10 hover:text-orange-500" title="Derrubar Sessão" onClick={() => handleKickUser(u)}><LogOut className="w-3.5 sm:w-4 h-3.5 sm:h-4" /></Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteUser(u.id, u.username)}><Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ━━ SISTEMA (Personalização e Tipos de Usuário) ━━ */}
          {activeTab === 'system' && (canEdit('settings') || role === 'admin') && (
            <SystemConfigPanel
              systemTab={systemTab}
              setSystemTab={setSystemTab}
              brandLogo={brandLogo}
              brandLogoDark={brandLogoDark}
              handleLogoUpload={handleLogoUpload}
              handleLogoDarkUpload={handleLogoDarkUpload}
              handleRemoveLogo={handleRemoveLogo}
              handleRemoveLogoDark={handleRemoveLogoDark}
              brandLogoHeightLogin={brandLogoHeightLogin}
              setBrandLogoHeightLogin={setBrandLogoHeightLogin}
              brandLogoHeightNavbar={brandLogoHeightNavbar}
              setBrandLogoHeightNavbar={setBrandLogoHeightNavbar}
              brandFavicon={brandFavicon}
              handleFaviconUpload={handleFaviconUpload}
              handleRemoveFavicon={handleRemoveFavicon}
              brandNameDraft={brandNameDraft}
              setBrandNameDraft={setBrandNameDraft}
              handleSaveBrandName={handleSaveBrandName}
              brandSidebarColor={brandSidebarColor}
              setBrandSidebarColor={setBrandSidebarColor}
              brandSidebarTextColor={brandSidebarTextColor}
              setBrandSidebarTextColor={setBrandSidebarTextColor}
              brandSidebarTextActiveColor={brandSidebarTextActiveColor}
              setBrandSidebarTextActiveColor={setBrandSidebarTextActiveColor}
              brandSidebarHoverColor={brandSidebarHoverColor}
              setBrandSidebarHoverColor={setBrandSidebarHoverColor}
              brandSidebarActiveBgColor={brandSidebarActiveBgColor}
              setBrandSidebarActiveBgColor={setBrandSidebarActiveBgColor}
              brandSidebarParentActiveBgColor={brandSidebarParentActiveBgColor}
              setBrandSidebarParentActiveBgColor={setBrandSidebarParentActiveBgColor}
              handleSaveSidebarStyle={handleSaveSidebarStyle}
              handleSaveSidebarStyleBatch={handleSaveSidebarStyleBatch}
              handleRemoveSidebarStyle={handleRemoveSidebarStyle}
              brandButtonBgColor={brandButtonBgColor}
              setBrandButtonBgColor={setBrandButtonBgColor}
              brandButtonTextColor={brandButtonTextColor}
              setBrandButtonTextColor={setBrandButtonTextColor}
              brandButtonHoverBgColor={brandButtonHoverBgColor}
              setBrandButtonHoverBgColor={setBrandButtonHoverBgColor}
              brandButtonHoverTextColor={brandButtonHoverTextColor}
              setBrandButtonHoverTextColor={setBrandButtonHoverTextColor}
            />
          )}

          {/* ━━ TERRITÓRIOS ━━ */}
          {activeTab === 'territories' && (() => {
            const allUFs = [...new Set(computedTerritories.map(t => t.uf))].sort();

            const filteredUFStats = computedUFStats.filter(s => {
              if (filterUF && filterUF !== 'all' && s.uf !== filterUF) return false;
              if (filterMunicipio) {
                const q = filterMunicipio.toLowerCase();
                if (!s.nome.toLowerCase().includes(q) && !s.uf.toLowerCase().includes(q)) return false;
              }
              return true;
            });

            return (
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
                {/* LISTA */}
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                  <Card className="border-border/40 flex flex-col h-full overflow-hidden">
                    <CardHeader className={`pb-3 border-b border-border/40 bg-card/50 ${!isDashFiltersOpen ? 'hidden lg:block' : 'block animate-in slide-in-from-top-4 duration-300'}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />Locais de Atuação
                        </CardTitle>
                        <div className="flex gap-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input 
                              placeholder="Buscar estado..." 
                              value={filterMunicipio} 
                              onChange={e => setFilterMunicipio(e.target.value)} 
                              className="h-8 text-xs pl-7 w-32 sm:w-44" 
                            />
                          </div>
                          
                          <Select value={filterUF} onValueChange={setFilterUF}>
                            <SelectTrigger className="h-8 w-24 text-[10px] font-bold uppercase bg-background border-border/40">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas UFs</SelectItem>
                              {allUFs.map(uf => (
                                <SelectItem key={uf} value={uf || 'empty'}>{uf}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {(filterUF !== 'all' || filterMunicipio) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-[10px] font-bold uppercase text-destructive hover:bg-destructive/10"
                              onClick={() => { setFilterUF('all'); setFilterMunicipio(''); }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                      {filteredUFStats.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">Nenhum estado encontrado</p>
                        </div>
                      ) : (
                        <>
                          {/* Desktop View */}
                          <div className="hidden lg:block">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/40">
                                  <TableHead className="pl-4">Estado</TableHead>
                                  <TableHead className="w-12">UF</TableHead>
                                  <TableHead className="text-center">Clientes</TableHead>
                                  <TableHead className="text-center">Usuários</TableHead>
                                  <TableHead>Responsáveis</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredUFStats.map(s => (
                                  <TableRow 
                                    key={s.uf} 
                                    className="border-border/30 hover:bg-primary/5 cursor-pointer transition-colors group"
                                    onClick={() => { setSelectedUFDetail(s.uf); setIsUFDetailOpen(true); }}
                                  >
                                    <TableCell className="text-xs font-bold pl-4 uppercase tracking-wider group-hover:text-primary transition-colors">
                                      {s.nome}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">{s.uf}</TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {s.clientCount}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-[10px] font-bold bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
                                        {s.userIds.length}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {s.userIds && s.userIds.length === 0 ? (
                                          <span className="text-[10px] text-muted-foreground italic">Sem usuário</span>
                                        ) : s.userIds && s.userIds.slice(0, 3).map(id => {
                                          const u = users.find(u => u.id === id);
                                          return (
                                            <span key={id} className="text-[9px] px-1.5 py-0.5 rounded-md border border-border/50 bg-background/50 flex items-center gap-1 font-bold uppercase truncate max-w-[120px]">
                                              {u ? u.username : `ID: ${id}`}
                                            </span>
                                          );
                                        })}
                                        {s.userIds && s.userIds.length > 3 && (
                                          <span className="text-[9px] font-bold text-primary/60">+{s.userIds.length - 3}</span>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Mobile View */}
                          <div className="lg:hidden divide-y divide-border/40">
                            {filteredTerritories.map(t => (
                              <div 
                                key={t.id} 
                                className="p-4 active:bg-secondary/20 transition-colors flex items-center justify-between gap-4"
                                onClick={() => {
                                  setSelectedTerritory({
                                    id: t.id,
                                    municipio: t.municipio,
                                    uf: t.uf,
                                    modo: t.modo,
                                    userId: t.userId,
                                    userIds: t.userId ? [t.userId] : [],
                                    clientCount: 0 
                                  });
                                  setIsTerritoryDetailOpen(true);
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                                      {t.uf}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold">Território</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-foreground truncate">{t.municipio || 'Estado Inteiro'}</h4>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {t.userId ? (
                                      (() => {
                                        const u = users.find(u => u.id === t.userId);
                                        return (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/40">
                                            {u ? u.username : `ID: ${t.userId}`}
                                          </span>
                                        );
                                      })()
                                    ) : (
                                      <span className="text-[9px] text-muted-foreground italic">Sem usuário</span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {/* MAPA */}
                <div className="lg:col-span-1 space-y-4 order-1 lg:order-2">
                  <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl relative z-[100]">
                    <CardHeader className="p-4 border-b border-border/10">
                      <CardTitle className="text-xs uppercase tracking-widest font-black flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        Atribuir Estado
                      </CardTitle>
                      <CardDescription className="text-[10px]">Vincule um estado inteiro a um usuário.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Estado (UF) *</label>
                        <SearchableSelect 
                          options={UF_DATA.map(uf => ({ value: uf.sigla, label: `${uf.sigla} - ${uf.nome}` }))}
                          value={selectedUF}
                          onChange={setSelectedUF}
                          placeholder="Selecione o Estado"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Usuário Responsável *</label>
                        <SearchableSelect 
                          options={users.map(u => ({ value: String(u.id), label: `${u.full_name || u.fullName || u.username} (${u.username})` }))}
                          value={selectedUserForTerritory}
                          onChange={setSelectedUserForTerritory}
                          placeholder="Selecione o Usuário"
                        />
                      </div>

                      <Button 
                        className="w-full gap-2 h-10 font-bold shadow-lg shadow-primary/20 mt-2" 
                        onClick={handleAddToStaged}
                      >
                        <Plus className="w-4 h-4" /> Adicionar à Lista
                      </Button>
                    </CardContent>
                  </Card>

                  {staged.length > 0 && (
                    <Card className="border-primary/30 bg-primary/5 animate-in zoom-in-95 duration-300">
                      <CardHeader className="p-3 border-b border-primary/10">
                        <CardTitle className="text-[10px] uppercase font-black flex items-center justify-between">
                          Pendentes de Confirmação
                          <span className="bg-primary text-white px-1.5 py-0.5 rounded text-[9px]">{staged.length}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-40 overflow-y-auto divide-y divide-primary/10 custom-scrollbar">
                          {staged.map((item, idx) => (
                            <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold truncate">{item.municipio || 'Estado Inteiro'}</p>
                                <p className="text-[9px] text-muted-foreground uppercase">{item.uf} • {users.find(u => u.id === item.userId)?.username}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => setStaged(prev => prev.filter((_, i) => i !== idx))}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="p-2 border-t border-primary/10">
                          <Button className="w-full h-8 text-[10px] font-black uppercase" onClick={handleConfirmStaged}>Confirmar Tudo</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-border/40 overflow-hidden relative z-0">
                    <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Map className="w-4 h-4 text-primary" />Mapa de Cobertura
                        </CardTitle>
                        <CardDescription className="text-xs">Clique no estado para filtrar.</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`lg:hidden h-8 px-2 text-[10px] font-bold gap-1 transition-colors ${isTerritoryMapOpen ? 'bg-primary/10 text-primary' : ''}`}
                        onClick={() => setIsTerritoryMapOpen(!isTerritoryMapOpen)}
                      >
                        {isTerritoryMapOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {isTerritoryMapOpen ? 'Fechar' : 'Abrir'}
                      </Button>
                    </CardHeader>
                    <CardContent className={`${isTerritoryMapOpen ? 'flex' : 'hidden lg:flex'} p-4 bg-primary/5 justify-center animate-in fade-in zoom-in duration-300`}>
                      <div style={{ width: '100%', maxWidth: '350px' }}>
                        <React.Suspense fallback={<Loader2 className="animate-spin" />}>
                          <MiniMapBrasil 
                            territories={computedTerritories.flatMap(t => t.userIds.map(id => ({ id: t.id, municipio: t.municipio, uf: t.uf, userId: id, modo: 'atendimento' as const })))} 
                            filterUF={filterUF === 'all' ? '' : filterUF} 
                            filterRep="" 
                            onClickUF={uf => setFilterUF(prev => prev === uf ? 'all' : uf)} 
                          />
                        </React.Suspense>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="admin-card text-center py-4 rounded-xl border border-border/50 bg-card">
                      <p className="text-2xl font-black text-primary">{allUFs.length}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-tighter">Estados Ativos</p>
                    </div>
                    <div className="admin-card text-center py-4 rounded-xl border border-border/50 bg-card">
                      <p className="text-2xl font-black text-primary">{computedTerritories.length}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-tighter">Cidades Ativas</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ━━ GRUPOS ━━ */}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="xl:col-span-1">
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader className="p-4 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest font-black">
                      <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                        <UsersRound className="w-4 h-4 text-primary" />
                      </div>
                      Novo Grupo
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">Organize sua equipe por regiões.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:pt-0">
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Nome do Grupo *</label>
                        <Input 
                          placeholder="Ex: Nordeste, São Paulo..." 
                          value={newGroupName} 
                          onChange={e => setNewGroupName(e.target.value)} 
                          className="h-10 text-sm font-semibold"
                          required 
                        />
                      </div>
                      <Button className="w-full gap-2 h-10 font-bold shadow-lg shadow-primary/20" type="submit">
                        <Plus className="w-4 h-4" /> Criar Grupo
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-4">
                <Card className="border-border/40 bg-card/30 backdrop-blur-sm shadow-xl">
                  <CardHeader className="p-4 sm:pb-3 border-b border-border/10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs sm:text-sm flex items-center gap-2 uppercase tracking-widest font-black">
                        <UsersRound className="w-4 h-4 text-primary" />
                        Grupos Criados
                      </CardTitle>
                      <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-border/40">
                        {groups.length} total
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {groups.length === 0 ? (
                      <div className="py-24 text-center text-muted-foreground">
                        <UsersRound className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium">Nenhum grupo cadastrado</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/10">
                        {groups.map(g => (
                          <div key={g.id} className="p-4 sm:px-6 sm:py-4 hover:bg-primary/5 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                                  <UsersRound className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-base font-bold text-foreground/90 truncate">{g.name}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    <User className="w-3 h-3 opacity-40" /> {g.userIds.length} usuários
                                    <span className="opacity-20">•</span>
                                    <Calendar className="w-3 h-3 opacity-40" /> {new Date(g.createdAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1 sm:gap-2 shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={`h-9 w-9 rounded-lg transition-all ${expandedGroup === g.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/10 hover:text-primary'}`}
                                  onClick={() => { setExpandedGroup(expandedGroup === g.id ? null : g.id); setGroupAddUsers(g.userIds); }}
                                >
                                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedGroup === g.id ? 'rotate-90' : ''}`} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDeleteGroup(g)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {expandedGroup === g.id && (
                              <div className="mt-5 ml-0 sm:ml-13 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between border-b border-border/10 pb-2">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gerenciar Membros</p>
                                  <span className="text-[10px] font-bold text-primary">{groupAddUsers.length} selecionados</span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                                  {users.map(u => (
                                    <label 
                                      key={u.id} 
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer group ${groupAddUsers.includes(u.id) ? 'bg-primary/10 border-primary/40 shadow-sm' : 'bg-background/40 border-border/40 hover:border-primary/30'}`}
                                    >
                                      <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" 
                                        checked={groupAddUsers.includes(u.id)} 
                                        onChange={() => setGroupAddUsers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} 
                                      />
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold truncate">{u.full_name || u.fullName || u.username}</span>
                                        <span className="text-[10px] text-muted-foreground opacity-60 font-mono">{u.username}</span>
                                      </div>
                                    </label>
                                  ))}
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button size="sm" className="gap-1.5 h-9 px-4 font-bold shadow-lg shadow-primary/20" onClick={() => handleSaveGroupUsers(g.id)}>
                                    <Save className="w-3.5 h-3.5" /> Salvar Alterações
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-9 px-4 font-bold" onClick={() => setExpandedGroup(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            )}

                            {g.userIds.length > 0 && expandedGroup !== g.id && (
                              <div className="mt-3 ml-0 sm:ml-13 flex flex-wrap gap-1.5">
                                {g.userIds.slice(0, 10).map(id => { 
                                  const u = users.find(u => u.id === id); 
                                  return u ? (
                                    <span key={id} className="text-[9px] bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40 font-bold uppercase truncate max-w-[120px]">
                                      {u.username}
                                    </span>
                                  ) : null; 
                                })}
                                {g.userIds.length > 10 && (
                                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-bold">
                                    +{g.userIds.length - 10} mais
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ━━ NOTIFICAÇÕES ━━ */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 sm:space-y-5">
              <form onSubmit={handleSendNotification} className="grid grid-cols-1 xl:grid-cols-[minmax(300px,0.9fr)_minmax(520px,1.6fr)] gap-4 sm:gap-5">
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader className="p-4 sm:pb-3 border-b border-border/10">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      Meta do Alerta
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      Defina o título e os destinatários do aviso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:pt-5 space-y-4 sm:space-y-5">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Título do Aviso</Label>
                      <Input
                        placeholder="Ex: Atualização Importante"
                        value={notifTitle}
                        onChange={e => setNotifTitle(e.target.value)}
                        className="h-10 sm:h-11 font-semibold text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Destinatários</Label>
                      <div className={`grid ${(role === 'admin' || canEdit('settings')) ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                        {(role === 'admin' || canEdit('settings')) && (
                          <button
                            type="button"
                            onClick={() => { setNotifTargetAll(true); setNotifTargetUsers([]); }}
                            className={`h-9 sm:h-10 rounded-md border text-[11px] sm:text-sm font-semibold transition-colors ${notifTargetAll
                              ? 'bg-primary/15 text-primary border-primary/40'
                              : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
                          >
                            Todos
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNotifTargetAll(false)}
                          className={`h-9 sm:h-10 rounded-md border text-[11px] sm:text-sm font-semibold transition-colors ${!notifTargetAll
                            ? 'bg-primary/15 text-primary border-primary/40'
                            : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
                        >
                          Usuários Específicos
                        </button>
                      </div>
                    </div>

                    {!notifTargetAll && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <Input
                          value={notifUserSearch}
                          onChange={e => setNotifUserSearch(e.target.value)}
                          placeholder="Buscar usuário..."
                          className="h-9 text-xs sm:text-sm"
                        />
                        <div className="rounded-md border border-border bg-background/40 max-h-40 sm:max-h-52 overflow-y-auto custom-scrollbar divide-y divide-border/30">
                          {users
                            .filter(u => {
                              // Se não for admin, filtrar por hierarquia OU categoria
                              if (role !== 'admin' && !canEdit('settings')) {
                                const currentUser = users.find(curr => curr.id === userId);
                                const subordinateIds = currentUser?.managedUsers?.map((m: any) => m.id) || [];
                                const isSubordinate = subordinateIds.includes(u.id);
                                const isSameType = u.userTypeId === currentUser?.userTypeId && u.id !== userId;
                                
                                if (!isSubordinate && !isSameType) return false;
                              }

                              const q = notifUserSearch.trim().toLowerCase();
                              if (!q) return true;
                              const name = (u.full_name || u.fullName || '').toLowerCase();
                              const username = (u.username || '').toLowerCase();
                              return name.includes(q) || username.includes(q);
                            })
                            .slice(0, 120)
                            .map(u => {
                              const checked = notifTargetUsers.includes(u.id);
                              return (
                                <label key={u.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-secondary/50">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      setNotifTargetUsers(prev => checked ? prev.filter(id => id !== u.id) : [...prev, u.id]);
                                    }}
                                    className="accent-primary"
                                  />
                                  <span className="text-[11px] sm:text-xs font-medium text-foreground truncate">
                                    {u.full_name || u.fullName || u.username}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-auto truncate">{u.username}</span>
                                </label>
                              );
                            })}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                          {notifTargetUsers.length} usuário(s) selecionado(s)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl flex flex-col">
                  <CardHeader className="p-4 sm:pb-3 border-b border-border/10">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      Conteúdo do Alerta
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      Campo de texto avançado para formatar o aviso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:pt-5 flex-1 flex flex-col">
                    <div className="quill-editor-wrapper quill-alert-editor min-h-[180px] sm:min-h-[220px] flex-1 rounded-xl border border-border/60 overflow-hidden bg-background/70 shadow-inner">
                      <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={notifMessage}
                        onChange={setNotifMessage}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Escreva sua mensagem aqui..."
                      />
                    </div>
                    <div className="pt-3 sm:pt-4">
                      <Button className="w-full gap-2 h-10 sm:h-12 text-sm sm:text-base font-bold shadow-lg shadow-primary/20" type="submit">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" /> Enviar Alerta Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>

              <Card className="border-border/40 bg-card/50 backdrop-blur-sm flex flex-col shadow-xl">
                <CardHeader className="p-4 sm:pb-3 border-b border-border/10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      Histórico
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      Alertas enviados recentemente.
                    </CardDescription>
                  </div>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 h-7 sm:h-8 gap-1 text-[10px] sm:text-xs font-bold"
                      onClick={handleClearNotifications}
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Limpar
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  {loadingNotifications ? (
                    <div className="py-12 sm:py-20 text-center flex flex-col items-center gap-2 sm:gap-3">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary opacity-50" />
                      <p className="text-[10px] sm:text-sm text-muted-foreground">Carregando...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-16 sm:py-24 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-10" />
                      <p className="text-[10px] sm:text-sm">Nenhuma mensagem enviada</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/20 overflow-y-auto max-h-[300px] sm:max-h-[420px] custom-scrollbar">
                      {notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 sm:px-6 sm:py-5 hover:bg-primary/5 transition-colors group">
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">{n.title}</h4>
                              <div
                                className="text-[11px] sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3 opacity-80"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(n.message) }}
                              />
                              <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3">
                                <span className="text-[8px] sm:text-[10px] uppercase font-black text-primary/40 tracking-widest">
                                  {n.targetAll ? 'Global' : `${Array.isArray(n.targetUserIds) ? n.targetUserIds.length : 0} usuários`}
                                </span>
                                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-border" />
                                <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] text-muted-foreground font-medium">
                                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  {new Date(n.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ━━ AUDITORIA ━━ */}
          {activeTab === 'audit' && (
            <AuditLogsPanel 
              auditLogs={auditLogs}
              reps={reps}
              loadingAudit={loadingAudit}
              fetchAuditLogs={fetchAuditLogs}
            />
          )}

          {/* ━━ PERSONALIZAÇÃO ━━ */}
          {/* ━━ TIPOS DE USUÁRIO ━━ */}
          {activeTab === 'user_types' && (role === 'admin' || canEdit('settings')) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider">Tipos de Usuário</h2>
                    <p className="text-xs text-muted-foreground">Gerencie as categorias e permissões base do sistema.</p>
                  </div>
                </div>
                <Button className="gap-2 h-11 px-6 font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={() => {
                  setEditingUserTypeId(null);
                  setUserTypeForm({ name: '', color: '#3b82f6', icon: 'User', showInMenu: false, active: true, isAdmin: false, canVisit: false });
                  setIsUserTypeModalOpen(true);
                }}>
                  <Plus className="w-4 h-4" /> Novo Tipo
                </Button>
              </div>

              {userTypes.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl bg-secondary/5">
                  <ShieldCheck className="w-16 h-16 opacity-5 mb-4" />
                  <p className="text-base font-bold uppercase tracking-widest opacity-40">Nenhum tipo cadastrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userTypes.map(type => {
                    const TypeIcon = ICON_LIST[type.icon as keyof typeof ICON_LIST] || User;
                    const isAdminType = type.isAdmin || type.name.toLowerCase() === 'admin';
                    const isDefaultUser = !isAdminType && type.name.toLowerCase() === 'usuário';
                    const cardColor = isAdminType ? '#fbbf24' : (isDefaultUser ? '#3b82f6' : type.color);

                    return (
                      <Card key={type.id} className={`group relative overflow-hidden border-border/40 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl ${!type.active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                        <div className="h-1.5 w-full absolute top-0 left-0" style={{ backgroundColor: cardColor }} />
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: cardColor }}>
                              <TypeIcon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10" onClick={() => {
                                setEditingUserTypeId(type.id);
                                setUserTypeForm({ name: type.name, color: type.color, icon: type.icon || 'User', showInMenu: type.showInMenu, active: type.active, isAdmin: type.isAdmin, canVisit: !!type.canVisit });
                                setIsUserTypeModalOpen(true);
                              }}><Pencil className="w-4 h-4" /></Button>
                              {!type.isSystemDefault && (
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUserType(type.id, type.name)}><Trash2 className="w-4 h-4" /></Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="font-black text-base uppercase tracking-tight flex items-center gap-2">
                              {type.name}
                              {isAdminType && <BadgeCheck className="w-4 h-4 text-amber-500" />}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-black uppercase tracking-tighter">
                                {users.filter(u => u.userTypeId === type.id).length} Usuários
                              </span>
                              {type.showInMenu && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black uppercase tracking-tighter flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Sidebar
                                </span>
                              )}
                              {!type.active && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-black uppercase tracking-tighter">Inativo</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ━━ BASE CLIENTE (Standalone) ━━ */}
          {activeTab === 'baserotas' && (
            (() => {
              const clientesPerm = myPermissions.find(p => p.moduleId === 'clientes');
              const canManageClientes = role === 'admin' || canEdit('settings') || !!clientesPerm?.canEdit;
              const canViewClientesActions = role === 'admin' || canAccess('settings') || !!clientesPerm?.canView || canManageClientes;
              return (
            <BaseClientePanel 
              onSwitchToReps={() => setActiveTab('reps')} 
              canView={canViewClientesActions}
              canCreate={canManageClientes}
              canEdit={canManageClientes}
              canDelete={canManageClientes}
              isMobileFilterOpen={isDashFiltersOpen}
              initialData={clientes as any}
              loading={loadingClientes}
              onRefresh={fetchClientes}
            />
              );
            })()
          )}

          {/* ━━ DATA CONNECTIONS ━━ */}
          {activeTab === 'data-connections' && role === 'admin' && (
            <DataConnectionsPanel token={token} userId={userId} />
          )}

          {/* ━━ VISITAS ━━ */}
          {activeTab === 'visitas' && (
            <SupervisorRoutesPanel />
          )}

          {activeTab === 'visitas_agendar' && (
            <VisitScheduler />
          )}

          <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                <DialogContent className={editingUserId ? "max-w-6xl p-0 border-none bg-transparent shadow-none" : "max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto custom-scrollbar"}>
                  {editingUserId ? (() => {
                    const editingUser = users.find(u => u.id === editingUserId);
                    if (!editingUser) {
                      return (
                        <div className="p-20 flex flex-col items-center justify-center bg-card rounded-xl border border-border">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                          <p className="text-sm text-muted-foreground">Carregando dados do perfil...</p>
                        </div>
                      );
                    }
                    return (
                      <>
                        <DialogHeader className="sr-only">
                          <DialogTitle>Gerenciador de Perfil - {editingUser.full_name || editingUser.fullName || 'Usuário'}</DialogTitle>
                          <DialogDescription>Configurações de perfil, permissões e histórico do usuário.</DialogDescription>
                        </DialogHeader>
                        <UserProfileManager
                          user={editingUser}
                          userTypes={userTypes}
                          allUsers={users}
                          onUpdate={fetchAll}
                          onClose={() => setIsUserModalOpen(false)}
                        />
                      </>
                    );
                  })() : (
                <>
                  <DialogHeader className="pb-3 border-b border-border/40">
                    <DialogTitle className="flex items-center gap-2 text-xl"><UserPlus className="w-5 h-5 text-primary" /> Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { handleCreateUser(e); setIsUserModalOpen(false); }} className="pt-2">
                    <Tabs defaultValue="geral" className="w-full">
                      <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Sidebar do Modal */}
                        <div className="flex flex-col items-center gap-6 w-full lg:w-48 shrink-0 pt-2 border-b lg:border-b-0 lg:border-r border-border/40 pb-6 lg:pb-0 lg:pr-6">
                          
                          {/* Foto de Perfil */}
                          <div className="flex flex-col items-center gap-2 w-full">
                            <label className="cursor-pointer w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border/60 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-all select-none group relative" style={{ borderColor: newUser.photo ? newUser.photoBorderColor : undefined, borderStyle: newUser.photo ? 'solid' : 'dashed' }}>
                              {newUser.photo ? (
                                <>
                                  <img src={newUser.photo} alt="Avatar" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-5 h-5 text-white" />
                                  </div>
                                </>
                              ) : (
                                <Camera className="w-8 h-8 text-muted-foreground opacity-40 group-hover:scale-110 transition-transform" />
                              )}
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleUserPhotoUpload(e, false)} />
                            </label>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-foreground mt-1 uppercase tracking-widest">Foto de Perfil</p>
                            </div>
                          </div>

                          {/* Menu de Abas */}
                          <TabsList className="flex flex-col w-full h-auto bg-transparent border-none gap-1 p-0">
                            <TabsTrigger value="geral" className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-xs font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-all rounded-lg">
                              <User className="w-4 h-4" /> Informações
                            </TabsTrigger>
                            <TabsTrigger value="ambiente" className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-xs font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-all rounded-lg">
                              <LayoutDashboard className="w-4 h-4" /> Ambiente
                            </TabsTrigger>
                            <TabsTrigger value="endereco" className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-xs font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-all rounded-lg">
                              <MapPin className="w-4 h-4" /> Endereço
                            </TabsTrigger>
                            <TabsTrigger value="gerenciamento" className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-xs font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-all rounded-lg">
                              <Users2 className="w-4 h-4" /> Gerenciamento
                            </TabsTrigger>
                            <TabsTrigger value="permissao" className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-xs font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-all rounded-lg">
                              <ShieldCheck className="w-4 h-4" /> Permissões
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        {/* Conteúdo das Abas */}
                        <div className="flex-1 min-w-0">
                          
                          {/* ABA: GERAL */}
                          <TabsContent value="geral" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Código *</Label><Input value={newUser.code} onChange={e => setNewUser({ ...newUser, code: e.target.value.replace(/[^a-zA-Z0-9.-]/g, '') })} required className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome Completo</Label><Input value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E-mail</Label><Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="h-9 text-xs" /></div>
                              
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Tipo de Usuário</Label>
                                <CustomSelect 
                                  options={[ { value: '', label: '— Selecionar —' }, ...userTypes.map(t => ({ value: String(t.id), label: t.name })) ]} 
                                  value={String(newUser.userTypeId)} 
                                  onChange={v => setNewUser({ ...newUser, userTypeId: v })} 
                                  placeholder="Selecione..." 
                                  className="h-9" 
                                />
                              </div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Cargo</Label><Input value={newUser.cargo} onChange={e => setNewUser({ ...newUser, cargo: e.target.value })} placeholder="Ex: Gerente" className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Nome da Empresa</Label><Input value={newUser.companyName} onChange={e => setNewUser({ ...newUser, companyName: e.target.value })} placeholder="Ex: Tech Soluções" className="h-9 text-xs" /></div>
                              
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Grupo</Label>
                                <CustomSelect options={[ { value: '', label: '— Nenhum —' }, ...groupsData.map(g => ({ value: String(g.id), label: g.name })) ]} value={String(newUser.groupId)} onChange={v => setNewUser({ ...newUser, groupId: v })} placeholder="Selecione..." className="h-9" />
                              </div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Telefone</Label><Input value={newUser.telefone} onChange={e => setNewUser({ ...newUser, telefone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data de Nasc.</Label><Input type="date" value={newUser.birthDate} onChange={e => setNewUser({ ...newUser, birthDate: e.target.value })} className="h-9 text-xs" /></div>

                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo Doc</Label>
                                <div className="flex gap-1 h-9">
                                  {(['cpf', 'cnpj'] as const).map(t => (
                                    <button key={t} type="button" onClick={() => setNewUser({ ...newUser, documentType: t, document: '' })} className={`flex-1 rounded-md text-[10px] font-bold border transition-colors ${newUser.documentType === t ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground hover:bg-secondary'}`}>
                                      {t.toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{newUser.documentType.toUpperCase()}</Label><Input value={newUser.document} onChange={e => setNewUser({ ...newUser, document: maskDoc(e.target.value, newUser.documentType) })} className="h-9 text-xs" /></div>
                              
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Senha *</Label>
                                <div className="relative">
                                  <Input type={showNewPwd ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required className="h-9 text-xs pr-9" />
                                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setShowNewPwd(!showNewPwd)}>{showNewPwd ? <EyeOff className="w-3.5 h-3.5 hover:text-primary transition-colors" /> : <Eye className="w-3.5 h-3.5 hover:text-primary transition-colors" />}</button>
                                </div>
                              </div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirmar Senha *</Label><Input type={showNewPwd ? 'text' : 'password'} value={newUser.confirmPassword} onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })} required className="h-9 text-xs" /></div>
                            </div>
                          </TabsContent>

                          {/* ABA: AMBIENTE */}
                          <TabsContent value="ambiente" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Área de Trabalho Padrão</Label>
                                <select 
                                  className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:ring-1 focus:ring-primary/40 outline-none"
                                  value={newUser.default_screen} 
                                  onChange={e => setNewUser({...newUser, default_screen: e.target.value})}
                                >
                                  <option value="mapa">Mapa Principal</option>
                                  <option value="dashboard">Dashboard</option>
                                  <option value="baserotas">Base Cliente</option>
                                  <option value="territories">Territórios</option>
                                  <option value="settings">Configurações</option>
                                </select>
                                <p className="text-[10px] text-muted-foreground italic">Define qual tela será carregada automaticamente após o login do usuário.</p>
                              </div>

                              <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/10">
                                  <div className="space-y-0.5">
                                    <Label className="text-[10px] font-bold uppercase">Habilitar Visitas</Label>
                                    <p className="text-[9px] text-muted-foreground">Permitir que este usuário realize roteiros de visita.</p>
                                  </div>
                                  <Switch 
                                    checked={newUser.canVisit}
                                    onCheckedChange={(checked) => setNewUser({ ...newUser, canVisit: checked })}
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* ABA: ENDEREÇO */}
                          <TabsContent value="endereco" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CEP</Label><Input value={newUser.cep} onChange={e => setNewUser({ ...newUser, cep: maskCEP(e.target.value) })} onBlur={() => fetchCepAdmin(newUser.cep.replace(/\D/g, ''))} maxLength={9} className="h-9 text-xs" /></div>
                              <div className="space-y-1.5 sm:col-span-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logradouro / Rua</Label><Input value={newUser.logradouro} onChange={e => setNewUser({ ...newUser, logradouro: e.target.value })} className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Número</Label><Input value={newUser.numero} onChange={e => setNewUser({ ...newUser, numero: e.target.value })} className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Complemento</Label><Input value={newUser.complemento} onChange={e => setNewUser({ ...newUser, complemento: e.target.value })} className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bairro</Label><Input value={newUser.bairro_end} onChange={e => setNewUser({ ...newUser, bairro_end: e.target.value })} className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cidade</Label><Input value={newUser.cidade} onChange={e => setNewUser({ ...newUser, cidade: e.target.value })} className="h-9 text-xs" /></div>
                              <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">UF</Label><Input value={newUser.estado_end} onChange={e => setNewUser({ ...newUser, estado_end: e.target.value })} maxLength={2} className="h-9 text-xs uppercase" /></div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Estado de Atuação</Label>
                                <select 
                                  value={newUser.assigned_state || ''} 
                                  onChange={e => setNewUser({ ...newUser, assigned_state: e.target.value })}
                                  className="w-full h-9 text-xs bg-background border border-input rounded-md px-3"
                                >
                                  <option value="">Nenhum (Brasil todo)</option>
                                  {UF_DATA.map(uf => (
                                    <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </TabsContent>

                          {/* ABA: GERENCIAMENTO */}
                          <TabsContent value="gerenciamento" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Usuários sob Gestão</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      className="w-full justify-between h-10 text-xs bg-background/50 border-border hover:bg-background/80 transition-all"
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <Users2 className="w-4 h-4 text-primary" />
                                        <span className="truncate">
                                          {newUser.managedUserIds.length === 0 
                                            ? "Nenhum usuário selecionado" 
                                            : `${newUser.managedUserIds.length} usuário(s) selecionado(s)`}
                                        </span>
                                      </div>
                                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent 
                                    className="w-[90vw] sm:w-[400px] p-0 bg-card border-border shadow-2xl z-[3000] overflow-hidden rounded-xl" 
                                    align="start"
                                  >
                                    <div className="p-3 border-b border-border/50 bg-secondary/20">
                                      <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                          type="text"
                                          placeholder="Buscar por nome ou código..."
                                          className="w-full bg-background text-xs pl-9 pr-8 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                                          onChange={(e) => {
                                            const q = e.target.value.toLowerCase();
                                            const items = document.querySelectorAll('.managed-user-item-new');
                                            items.forEach((item: any) => {
                                              const text = item.getAttribute('data-search').toLowerCase();
                                              item.style.display = text.includes(q) ? 'flex' : 'none';
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between mt-2 px-1">
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                          {newUser.managedUserIds.length} selecionados
                                        </span>
                                        <div className="flex gap-2">
                                          <button type="button" onClick={() => setNewUser({ ...newUser, managedUserIds: users.filter(u => u.id !== 0).map(u => u.id) })} className="text-[10px] font-bold text-primary hover:underline">Todos</button>
                                          <button type="button" onClick={() => setNewUser({ ...newUser, managedUserIds: [] })} className="text-[10px] font-bold text-destructive hover:underline">Limpar</button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                                      {users.filter(u => u.id !== 0).map(u => {
                                        const isSelected = newUser.managedUserIds.includes(u.id);
                                        const displayName = u.full_name || u.fullName || u.username;
                                        return (
                                          <button
                                            key={u.id}
                                            type="button"
                                            data-search={`${u.code} ${displayName}`}
                                            className={`managed-user-item-new w-full flex items-center gap-3 px-3 py-2 text-xs transition-all hover:bg-secondary group ${isSelected ? 'bg-primary/5' : ''}`}
                                            onClick={() => {
                                              const ids = [...newUser.managedUserIds];
                                              if (isSelected) setNewUser({ ...newUser, managedUserIds: ids.filter(id => id !== u.id) });
                                              else setNewUser({ ...newUser, managedUserIds: [...ids, u.id] });
                                            }}
                                          >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'border-border group-hover:border-primary/50'}`}>
                                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>
                                            <div className="flex flex-col items-start truncate">
                                              <span className={`font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground/90'}`}>{displayName}</span>
                                              {u.code && <span className="text-[10px] text-muted-foreground font-mono">{u.code}</span>}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <p className="text-[10px] text-muted-foreground italic mt-1">Este usuário poderá visualizar todos os clientes dos usuários selecionados acima.</p>
                                
                                {newUser.managedUserIds.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {newUser.managedUserIds.map(id => {
                                      const u = users.find(user => user.id === id);
                                      if (!u) return null;
                                      return (
                                        <div key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-medium animate-in fade-in zoom-in duration-200">
                                          <span className="opacity-70 font-mono">{u.code}</span>
                                          <span>{u.full_name || u.username}</span>
                                          <button type="button" onClick={() => setNewUser({ ...newUser, managedUserIds: newUser.managedUserIds.filter(mid => mid !== id) })} className="hover:text-destructive transition-colors ml-0.5"><X className="w-3 h-3" /></button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          {/* ABA: PERMISSÕES */}
                          <TabsContent value="permissao" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="section-title mb-2">Permissões de Acesso</div>
                            <p className="text-xs text-muted-foreground mb-6">Configure quais áreas do sistema este usuário pode visualizar ou gerenciar.</p>
                            
                            <div className="rounded-xl border border-border/50 bg-secondary/5 overflow-hidden">
                              <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-secondary/20">
                                  <tr>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Módulo do Sistema</th>
                                    <th className="px-6 py-4 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Visualizar</th>
                                    <th className="px-6 py-4 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Editar / Gerenciar</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {availableModules.map(mod => {
                                    const perm = newUser.permissions.find(p => p.moduleId === mod.id);
                                    return (
                                      <tr key={mod.id} className="border-b border-border/20 hover:bg-secondary/10 transition-colors">
                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-background border border-border/50 text-muted-foreground group-hover:text-primary transition-colors">
                                              {getModuleIcon(mod.id)}
                                            </div>
                                            <div>
                                              <p className="font-bold text-xs capitalize">{mod.name}</p>
                                              <p className="text-[10px] text-muted-foreground">Acesso ao módulo {mod.id}</p>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          <button 
                                            type="button" 
                                            onClick={() => handleNewUserPermissionChange(mod.id, 'canView', !perm?.canView)}
                                            className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-all ${perm?.canView ? 'bg-primary border-primary text-white' : 'border-border'}`}
                                          >
                                            {perm?.canView && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                          </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          <button 
                                            type="button" 
                                            onClick={() => handleNewUserPermissionChange(mod.id, 'canEdit', !perm?.canEdit)}
                                            className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-all ${perm?.canEdit ? 'bg-primary border-primary text-white' : 'border-border'}`}
                                          >
                                            {perm?.canEdit && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Flag de Administrador */}
                            <div className="mt-8 p-6 rounded-xl border border-border/50 bg-secondary/10 flex items-center justify-between group hover:border-primary/30 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  <ShieldCheck size={20} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider">Acesso Total (Administrador)</p>
                                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[400px]">Ao ativar esta opção, o usuário terá acesso irrestrito a todas as funções, configurações e dados do sistema, ignorando as permissões individuais acima.</p>
                                </div>
                              </div>
                              <Switch 
                                checked={newUser.role === 'admin'} 
                                onCheckedChange={(checked) => {
                                  const newRole = checked ? 'admin' : 'user';
                                  setNewUser(prev => ({
                                    ...prev,
                                    role: newRole,
                                    permissions: checked 
                                      ? prev.permissions.map(p => ({ ...p, canView: true, canEdit: true }))
                                      : prev.permissions
                                  }));
                                }} 
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic mt-2">Permissões de edição concedem automaticamente permissão de visualização.</p>
                          </TabsContent>

                        </div>
                      </div>
                    </Tabs>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-border/40 justify-end">
                      <Button variant="ghost" type="button" onClick={() => setIsUserModalOpen(false)} className="w-full sm:w-32 order-2 sm:order-1">Cancelar</Button>
                      <Button type="submit" className="w-full sm:w-48 gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all order-1 sm:order-2"><Save className="w-4 h-4" /> Cadastrar Usuário</Button>
                    </div>
                  </form>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal de Criação/Edição de Tipo de Usuário */}
          <Dialog open={isUserTypeModalOpen} onOpenChange={setIsUserTypeModalOpen}>
            <DialogContent className="max-w-[500px] w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
              <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20 shrink-0">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {editingUserTypeId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  {editingUserTypeId ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário'}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Configure as propriedades e permissões globais para este tipo de usuário.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveUserType} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex-1 p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome do Tipo</Label>
                      <Input 
                        value={userTypeForm.name} 
                        onChange={e => setUserTypeForm({ ...userTypeForm, name: e.target.value })} 
                        placeholder="Ex: Gerente, Supervisor, etc." 
                        className="h-10 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cor de Identificação</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            value={userTypeForm.color} 
                            onChange={e => setUserTypeForm({ ...userTypeForm, color: e.target.value })}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input 
                            value={userTypeForm.color} 
                            onChange={e => setUserTypeForm({ ...userTypeForm, color: e.target.value })} 
                            className="h-10 text-xs font-mono uppercase flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-background/50">
                          <Switch 
                            checked={userTypeForm.active}
                            onCheckedChange={(checked) => setUserTypeForm({ ...userTypeForm, active: checked })}
                          />
                          <span className="text-xs font-medium">{userTypeForm.active ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ícone Representativo</Label>
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 p-2 rounded-xl border border-border bg-secondary/20 max-h-[180px] overflow-y-auto custom-scrollbar">
                        {Object.entries(ICON_LIST).map(([iconName, IconComponent]) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setUserTypeForm({ ...userTypeForm, icon: iconName })}
                            className={`p-2 rounded-lg flex items-center justify-center transition-all hover:bg-primary/20 ${
                              userTypeForm.icon === iconName ? 'bg-primary text-primary-foreground ring-2 ring-primary shadow-lg' : 'bg-background hover:scale-110'
                            }`}
                            title={iconName}
                          >
                            <IconComponent className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold">Tipo Administrativo</Label>
                          <p className="text-[10px] text-muted-foreground leading-tight">Garante acesso total às configurações do sistema.</p>
                        </div>
                        <Switch 
                          checked={userTypeForm.isAdmin}
                          onCheckedChange={(checked) => setUserTypeForm({ ...userTypeForm, isAdmin: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-primary/5 hover:bg-primary/10 transition-colors">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-primary">Habilitar para Visitas</Label>
                          <p className="text-[10px] text-muted-foreground leading-tight">Usuários deste tipo aparecerão no agendamento.</p>
                        </div>
                        <Switch 
                          checked={userTypeForm.canVisit}
                          onCheckedChange={(checked) => setUserTypeForm({ ...userTypeForm, canVisit: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold">Visível no Menu</Label>
                          <p className="text-[10px] text-muted-foreground leading-tight">Exibir este tipo no menu de atalhos lateral.</p>
                        </div>
                        <Switch 
                          checked={userTypeForm.showInMenu}
                          onCheckedChange={(checked) => setUserTypeForm({ ...userTypeForm, showInMenu: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t border-border/40 shrink-0 flex flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsUserTypeModalOpen(false)} className="flex-1 text-xs font-bold uppercase tracking-widest h-11">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-11">
                    <CheckCircle2 className="w-4 h-4" />
                    {editingUserTypeId ? 'Atualizar' : 'Criar Tipo'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal de Detalhes do Território (Mobile) */}
          <Dialog open={isTerritoryDetailOpen} onOpenChange={setIsTerritoryDetailOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
              {selectedTerritory && (
                <>
                  <DialogHeader className="p-6 bg-primary/5 border-b border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-widest">
                        {selectedTerritory.uf}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        <MapPin className="w-3 h-3" />
                        TERRITÓRIO ATIVO
                      </div>
                    </div>
                    <DialogTitle className="text-xl font-black leading-tight">{selectedTerritory.municipio}</DialogTitle>
                    <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      Informações da região de atuação
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Estatísticas Rápidas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 text-center">
                        <p className="text-2xl font-black text-primary">{selectedTerritory.clientCount || 0}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Clientes</p>
                      </div>
                      <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 text-center">
                        <p className="text-2xl font-black text-primary">{(selectedTerritory.userIds || []).length}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Usuários</p>
                      </div>
                    </div>

                    {/* Lista de Usuários Responsáveis */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                        <Users2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Responsáveis com Clientes</span>
                      </div>
                      <div className="space-y-2">
                        {(!selectedTerritory.userIds || selectedTerritory.userIds.length === 0) ? (
                          <p className="text-xs text-muted-foreground italic text-center py-2">Nenhum usuário vinculado</p>
                        ) : selectedTerritory.userIds.map(id => {
                          const u = users.find(u => u.id === id);
                          const userClients = clientes.filter(c => c.userId === id && c.cidade === selectedTerritory.municipio && c.uf === selectedTerritory.uf);
                          return (
                            <div key={id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/50">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold truncate">{u ? u.full_name || u.fullName || u.username : `ID: ${id}`}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-medium">{u?.code || 'S/ COD'}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-black text-primary">{userClients.length}</p>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase">Cli.</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/20 border-t border-border/40">
                    <Button 
                      className="w-full font-bold text-xs h-10" 
                      variant="outline"
                      onClick={() => setIsTerritoryDetailOpen(false)}
                    >
                      Fechar Detalhes
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal Detalhado de UF (Novo) */}
          <Dialog open={isUFDetailOpen} onOpenChange={setIsUFDetailOpen}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Detalhes do Estado {ufDetailData?.uf || ''}</DialogTitle>
                <DialogDescription>Gestão detalhada de territórios, usuários e clientes.</DialogDescription>
              </DialogHeader>
              {ufDetailData && (
                <div className="flex flex-col bg-background" style={{ height: 'calc(90vh - 2rem)' }}>                  {/* Header do Modal */}
                  <div className="p-6 bg-primary/10 border-b border-border/40 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">
                          {ufDetailData.uf}
                        </div>
                        <div>
                          <h2 className="text-2xl font-black tracking-tight">{ufDetailData.nome}</h2>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Gestão de Territórios Estaduais</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-background/60 backdrop-blur-sm p-3 rounded-xl border border-border/40 flex flex-col items-center justify-center">
                        <p className="text-xl font-black text-primary">{ufDetailData.clientCount}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Total Clientes</p>
                      </div>
                      <div className="bg-background/60 backdrop-blur-sm p-3 rounded-xl border border-border/40 flex flex-col items-center justify-center">
                        <p className="text-xl font-black text-primary">{ufDetailData.userIds.length}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Usuários Vinculados</p>
                      </div>
                      <div className="bg-background/60 backdrop-blur-sm p-3 rounded-xl border border-border/40 flex flex-col items-center justify-center">
                        <p className="text-xl font-black text-primary">{ufDetailData.municipios.length}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Municípios Ativos</p>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo com Tabs */}
                  <div className="flex-1 overflow-hidden min-h-0">
                  <Tabs defaultValue="usuarios" className="h-full flex flex-col min-h-0">
                    
                      <div className="px-6 border-b border-border/20 bg-muted/30">
                        <TabsList className="bg-transparent h-12 gap-6 p-0">
                          <TabsTrigger value="usuarios" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-xs font-black uppercase tracking-widest border-b-2 border-transparent transition-all">
                            <UsersRound className="w-3.5 h-3.5 mr-2" /> Usuários
                          </TabsTrigger>
                          <TabsTrigger value="municipios" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-xs font-black uppercase tracking-widest border-b-2 border-transparent transition-all">
                            <MapPin className="w-3.5 h-3.5 mr-2" /> Municípios
                          </TabsTrigger>
                          <TabsTrigger value="clientes" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 text-xs font-black uppercase tracking-widest border-b-2 border-transparent transition-all">
                            <Database className="w-3.5 h-3.5 mr-2" /> Clientes
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 min-h-0">
                      {/* ABA USUÁRIOS */}
                        <TabsContent value="usuarios" className="mt-0 space-y-4">
                          {ufDetailData.userIds.length === 0 ? (
                            <div className="py-20 text-center">
                              <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                              <p className="text-sm text-muted-foreground">Nenhum usuário vinculado a este estado.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {ufDetailData.userIds.map(id => {
                                const u = users.find(user => user.id === id);
                                if (!u) return null;
                                const userCities = ufDetailData.municipios.filter(m => m.userIds.includes(id)).length;
                                const userClients = ufDetailData.municipios.reduce((acc, m) => {
                                  if (m.userIds.includes(id)) return acc + m.clientCount;
                                  return acc;
                                }, 0);

                                return (
                                  <div key={id} className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4 min-w-0">
                                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 relative">
                                        {u.photo ? <img src={u.photo} alt="Avatar" className="w-full h-full object-cover rounded-xl" /> : <User className="w-6 h-6 text-muted-foreground/30" />}
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card bg-emerald-500" />
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-black text-sm truncate">{u.full_name || u.username}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{u.username}</span>
                                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{userCities} Cidades</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => {
                                        setEditingUserId(u.id);
                                        setEditUserForm({
                                          username: u.username,
                                          fullName: u.full_name || u.fullName || '',
                                          document: u.document || u.cpf_cnpj || '',
                                          password: '',
                                          confirmPassword: '',
                                          role: u.role as 'user' | 'supervisor' | 'admin',
                                          code: u.code || '',
                                          photo: u.photo || '',
                                          photoBorderColor: (u as any).photoBorderColor || '#FFD700',
                                          telefone: u.telefone || '',
                                          birthDate: u.birth_date || u.birthDate || '',
                                          cargo: u.cargo || '',
                                          companyName: u.company_name || u.companyName || '',
                                          groupId: String(u.groupId || ''),
                                          userTypeId: String(u.userTypeId || ''),
                                          canVisit: !!(u as any).canVisit,
                                          managedUserIds: u.managedUsers?.map(m => m.id) || []
                                        });
                                        setIsUserModalOpen(true);
                                      }}>
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveUserFromUF(ufDetailData.uf, u.id)}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </TabsContent>

                        {/* ABA MUNICÍPIOS */}
                        <TabsContent value="municipios" className="mt-0">
                          <div className="rounded-xl border border-border/40 overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/20">
                                  <TableHead className="text-[10px] font-black uppercase pl-6 h-10">Município</TableHead>
                                  <TableHead className="text-[10px] font-black uppercase text-center h-10">Clientes</TableHead>
                                  <TableHead className="text-[10px] font-black uppercase h-10">Responsáveis</TableHead>
                                  <TableHead className="w-20 text-center h-10 pr-6">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {ufDetailData.municipios.map(m => (
                                  <TableRow key={m.nome} className="hover:bg-primary/5 border-border/10 transition-colors group">
                                    <TableCell className="pl-6 py-3 font-bold text-xs uppercase tracking-tight">{m.nome}</TableCell>
                                    <TableCell className="text-center py-3">
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                                        {m.clientCount}
                                      </span>
                                    </TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex flex-wrap gap-1">
                                        {m.userIds.map(id => {
                                          const u = users.find(user => user.id === id);
                                          return (
                                            <span key={id} className="text-[9px] font-black px-1.5 py-0.5 rounded-md border border-border/40 bg-background/50 uppercase">
                                              {u?.username || `ID: ${id}`}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center pr-6 py-3">
                                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                          onClick={() => {
                                            const t = territories.find(ter => ter.uf === ufDetailData.uf && ter.municipio === m.nome);
                                            if (t) handleDeleteTerritory(t.id, m.nome, t.userId!, ufDetailData.uf);
                                            else toast.error('Não foi possível localizar o ID da atribuição.');
                                          }}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        {/* ABA CLIENTES */}
                        <TabsContent value="clientes" className="mt-0">
                          <div className="rounded-xl border border-border/40 overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/20">
                                  <TableHead className="text-[10px] font-black uppercase pl-6 h-10">Cliente</TableHead>
                                  <TableHead className="text-[10px] font-black uppercase h-10">Município</TableHead>
                                  <TableHead className="text-[10px] font-black uppercase h-10">Responsável</TableHead>
                                  <TableHead className="w-20 text-center h-10 pr-6">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {clientes.filter(c => c.uf === ufDetailData.uf).slice(0, 100).map(c => {
                                  const u = users.find(user => user.id === c.userId);
                                  return (
                                    <TableRow key={c.id_cliente || c.codigo_cliente} className="hover:bg-primary/5 border-border/10 transition-colors group">
                                      <TableCell className="pl-6 py-3">
                                        <div className="min-w-0">
                                          <p className="text-xs font-black uppercase truncate">{c.nome_cliente}</p>
                                          <p className="text-[9px] text-muted-foreground font-mono">#{c.codigo_cliente || '000'}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-3 text-[10px] font-bold uppercase text-muted-foreground">{c.cidade}</TableCell>
                                      <TableCell className="py-3">
                                        <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10 uppercase">
                                          {u?.username || 'S/ USER'}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center pr-6 py-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                                {clientes.filter(c => c.uf === ufDetailData.uf).length > 100 && (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-xs text-muted-foreground font-bold italic">
                                      Exibindo apenas os primeiros 100 clientes deste estado.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  {/* Footer do Modal */}
                  <div className="p-4 bg-muted/20 border-t border-border/40 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-muted-foreground italic uppercase">
                      Clique em um item para ver mais opções ou editar.
                    </p>
                    <Button variant="outline" size="sm" className="font-black text-xs uppercase tracking-widest px-6" onClick={() => setIsUFDetailOpen(false)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal para Adicionar Usuários ao Tipo de Usuário */}
          <Dialog open={isAddUsersModalOpen} onOpenChange={setIsAddUsersModalOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Adicionar Usuários ao Tipo</DialogTitle>
                <DialogDescription>
                  Selecione os usuários que deseja adicionar a este tipo de usuário.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome..."
                      className="pl-10"
                      value={addUsersSearch}
                      onChange={(e) => setAddUsersSearch(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Filtrar por código..."
                      className="pl-10"
                      value={addUsersCodeFilter}
                      onChange={(e) => setAddUsersCodeFilter(e.target.value)}
                    />
                  </div>
                  <select
                    value={addUsersTypeFilter}
                    onChange={(e) => setAddUsersTypeFilter(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">Todos os tipos</option>
                    {userTypes.length > 0 ? (
                      userTypes.map(type => (
                        <option key={type.id} value={String(type.id)}>{type.name}</option>
                      ))
                    ) : (
                      <option value="all" disabled>Nenhum tipo criado</option>
                    )}
                  </select>
                </div>
                <div className="max-h-[400px] overflow-y-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-card sticky top-0 z-10 border-b border-border/20 shadow-sm">
                      <tr>
                        <th className="p-3 text-left font-bold text-xs uppercase">Selecionar</th>
                        <th className="p-3 text-left font-bold text-xs uppercase">Nome</th>
                        <th className="p-3 text-left font-bold text-xs uppercase">Código</th>
                        <th className="p-3 text-left font-bold text-xs uppercase">Tipo Atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(u => {
                          const name = (u.full_name || u.fullName || u.username).toLowerCase();
                          const code = (u.code || '').toLowerCase();
                          const search = addUsersSearch.toLowerCase();
                          const codeFilter = addUsersCodeFilter.toLowerCase();
                          const typeFilter = addUsersTypeFilter;

                          const matchesName = name.includes(search);
                          const matchesCode = code.includes(codeFilter);
                          const matchesType = typeFilter === 'all' || Number(u.userTypeId) === Number(typeFilter);

                          return matchesName && matchesCode && matchesType;
                        })
                        .map(u => {
                          const userType = userTypes.find(t => t.id === Number(u.userTypeId));
                          return (
                            <tr key={u.id} className="border-b hover:bg-muted/30">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={selectedUserIdsForType.includes(u.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUserIdsForType([...selectedUserIdsForType, u.id]);
                                    } else {
                                      setSelectedUserIdsForType(selectedUserIdsForType.filter(id => id !== u.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded"
                                />
                              </td>
                              <td className="p-3 font-medium">{u.full_name || u.fullName || u.username}</td>
                              <td className="p-3 text-muted-foreground">{u.code || 'S/ COD'}</td>
                              <td className="p-3">
                                {userType ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${userType.color}20`, color: userType.color }}>
                                    {userType.name}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">Sem tipo</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {selectedUserIdsForType.length} usuário{selectedUserIdsForType.length !== 1 ? 's' : ''} selecionado{selectedUserIdsForType.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAddUsersModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        const typeId = parseInt(activeTab.replace('user_type_', ''));
                        handleAddUsersToType(typeId);
                      }}
                      disabled={selectedUserIdsForType.length === 0}
                    >
                      Adicionar {selectedUserIdsForType.length} Usuário{selectedUserIdsForType.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {showCropper && tempImage && (
            <ProfileImageCropper
              imageSrc={tempImage}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setShowCropper(false);
                setTempImage('');
              }}
              initialBorderColor={cropperForEdit ? editUserForm.photoBorderColor : newUser.photoBorderColor}
            />
          )}

        </main>
      </div>
    </div>
  </>);
}

