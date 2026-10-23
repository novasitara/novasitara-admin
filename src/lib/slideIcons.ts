import { Box, Briefcase, Cloud, Code2, Globe, Layers, Shield, Sparkles, Users, Users2 } from 'lucide-react';

/** Must match SLIDE_ICONS in novasitara-api and the website's MarketFocusSlider. */
export const SLIDE_ICONS = { sparkles: Sparkles, layers: Layers, box: Box, users2: Users2, code2: Code2, users: Users, briefcase: Briefcase, globe: Globe, cloud: Cloud, shield: Shield };
export type SlideIcon = keyof typeof SLIDE_ICONS;
