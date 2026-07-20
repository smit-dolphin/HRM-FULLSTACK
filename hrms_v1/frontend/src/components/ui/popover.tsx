import React from 'react';

type PopoverContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const PopoverContext = React.createContext<PopoverContextType | null>(null);

export function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = triggerRef.current;
      const c = contentRef.current;
      if (!t || !c) return;
      if (t.contains(e.target as Node) || c.contains(e.target as Node)) return;
      setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children }: { children: React.ReactElement<any, any> }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return null;
  const { setOpen, triggerRef, open } = ctx;
  const child = children as React.ReactElement<any>;
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
    const orig = (child.props && child.props.onClick) as ((e: React.MouseEvent) => void) | undefined;
    if (orig) orig(e);
  };
  return React.cloneElement(child, {
    ref: triggerRef as any,
    onClick,
  });
}

export function PopoverContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return null;
  const { open, contentRef } = ctx;
  if (!open) return null;
  return (
    <div ref={contentRef as any} className={"absolute right-0 mt-2 z-50 w-64 rounded-md border bg-popover p-3 shadow " + (className || '')}>
      {children}
    </div>
  );
}

export default Popover;
