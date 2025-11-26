import { memo, type ReactNode } from "react";
import type { CSSProperties } from "react";
import "../../styles/glass.css";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const GlassCardComponent = ({
  children,
  className = "",
  style
}: GlassCardProps) => {
  return <div className={`glass glass-card ${className}`} style={style}>{children}</div>;
};

export const GlassCard = memo(GlassCardComponent);

