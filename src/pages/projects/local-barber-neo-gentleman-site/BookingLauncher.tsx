import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";

// ✅ podmień na swój realny komponent
import BookOnline from "../../../BookingWidget";



type Snap = "mid" | "full";

type Props = {
  ctaLabel?: string;
  desktopBp?: number;
  initialSnap?: Snap;
  stickyCtaLabel?: string;
  confirmSelector?: string;
  forceStickyCta?: boolean;
};

function usePrefersReducedMotionSSR() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const set = () => setReduce(!!mq.matches);
    set();
    mq.addEventListener?.("change", set);
    return () => mq.removeEventListener?.("change", set);
  }, []);
  return reduce;
}

function useMedia(query: string) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setOk(m.matches);
    on();
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, [query]);
  return ok;
}

function useViewportH() {
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const read = () => {
      const vv = window.visualViewport;
      setVh(vv?.height ?? window.innerHeight);
    };
    read();
    window.addEventListener("resize", read);
    window.visualViewport?.addEventListener("resize", read);
    return () => {
      window.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("resize", read);
    };
  }, []);
  return vh || 800;
}

function lockScroll(on: boolean) {
  const html = document.documentElement;
  const body = document.body;

  if (!on) {
    const y = body.dataset.bwScrollY;
    if (y) {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      html.style.overflow = "";
      body.style.overflow = "";
      window.scrollTo(0, Number(y));
      delete body.dataset.bwScrollY;
    }
    html.classList.remove("bm-noScroll");
    body.classList.remove("bm-noScroll");
    return;
  }

  const scrollY = window.scrollY || 0;
  body.dataset.bwScrollY = String(scrollY);

  html.classList.add("bm-noScroll");
  body.classList.add("bm-noScroll");

  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
}

export default function BookingLauncher({
  ctaLabel = "Book online",
  desktopBp = 900,
  initialSnap = "full",
  stickyCtaLabel = "Confirm booking",
  confirmSelector,
  forceStickyCta = false,
}: Props) {
  const reduce = usePrefersReducedMotionSSR();
  const isDesktop = useMedia(`(min-width: ${desktopBp}px)`);
  const vh = useViewportH();

  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<Snap>(initialSnap);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const y = useMotionValue(0);
  const x = useMotionValue(0);

  const snapY = useMemo(() => {
    const full = Math.round(vh * (1 - 0.92)); // 8% top
    const mid = Math.round(vh * (1 - 0.40));  // 60% top
    const closed = Math.round(vh + 24);
    return { full, mid, closed };
  }, [vh]);

  const drawer = useMemo(() => ({ w: 480, closed: 520 }), []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isDesktop) {
      x.set(0);
      y.set(0);
    } else {
      y.set(snap === "full" ? snapY.full : snapY.mid);
    }
    requestAnimationFrame(() => sheetRef.current?.focus());
  }, [open, isDesktop, snap, snapY.full, snapY.mid, x, y]);

  const sheetTween = reduce
    ? { type: "tween" as const, duration: 0.22 }
    : { type: "spring" as const, stiffness: 380, damping: 36, mass: 0.9 };

  const layoutId = reduce ? undefined : "booking-sheet";

  const [hasInternalFooter, setHasInternalFooter] = useState(false);
  useEffect(() => {
    if (!open) return;
    const root = contentRef.current;
    if (!root) return;
    const found =
      !!root.querySelector(".bmw__footerLite") ||
      !!root.querySelector(".bmw__btnPrimary") ||
      !!root.querySelector("button[type='submit']");
    setHasInternalFooter(found);
  }, [open]);

  const shouldShowSticky = forceStickyCta ? true : !hasInternalFooter;

  const triggerConfirm = () => {
    const root = contentRef.current;
    if (!root) return;

    if (confirmSelector) {
      const el = root.querySelector(confirmSelector) as HTMLElement | null;
      if (el) return el.click();
    }
    const el =
      (root.querySelector("button[type='submit']") as HTMLElement | null) ||
      (root.querySelector(".bmw__btnPrimary") as HTMLElement | null) ||
      (root.querySelector("button") as HTMLElement | null);
    el?.click();
  };

  const onMobileDragEnd = (_: any, info: { velocity: { y: number } }) => {
    const cur = y.get();
    const fastDown = info.velocity.y > 900;

    if (fastDown && cur > snapY.mid) return setOpen(false);
    if (cur > snapY.mid + (snapY.closed - snapY.mid) * 0.45) return setOpen(false);

    const distFull = Math.abs(cur - snapY.full);
    const distMid = Math.abs(cur - snapY.mid);
    setSnap(distFull <= distMid ? "full" : "mid");
  };

  const onDesktopDragEnd = (_: any, info: { velocity: { x: number } }) => {
    const cur = x.get();
    const fastRight = info.velocity.x > 900;
    if (fastRight || cur > drawer.w * 0.45) return setOpen(false);
    x.set(0);
  };

  return (
    <>
      {/* ✅ To jest trigger na PC (i mobile też) */}
      {!open && (
        <motion.button
          type="button"
          className="bw-launcher__cta"
          layoutId={layoutId}
          onClick={() => {
            setSnap(initialSnap);
            setOpen(true);
          }}
          whileTap={reduce ? undefined : { scale: 0.985 }}
        >
          <span className="bw-launcher__ctaTxt">{ctaLabel}</span>
          <span className="bw-launcher__ctaIcon" aria-hidden="true">→</span>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <div className="bw-launcher__portal" role="presentation">
            <motion.button
              type="button"
              className="bw-launcher__overlay"
              aria-label="Close booking"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.18 } }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
            />

            <motion.div
              ref={sheetRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Booking"
              className={`bw-launcher__sheet ${isDesktop ? "is-desktop" : "is-mobile"}`}
              layoutId={layoutId}
              style={isDesktop ? { x } : { y }}
              initial={
                reduce
                  ? isDesktop
                    ? { x: drawer.closed, opacity: 0 }
                    : { y: snapY.closed, opacity: 0 }
                  : false
              }
              animate={
                reduce
                  ? isDesktop
                    ? { x: 0, opacity: 1, transition: sheetTween }
                    : { y: snap === "full" ? snapY.full : snapY.mid, opacity: 1, transition: sheetTween }
                  : undefined
              }
              exit={
                reduce
                  ? isDesktop
                    ? { x: drawer.closed, opacity: 0, transition: sheetTween }
                    : { y: snapY.closed, opacity: 0, transition: sheetTween }
                  : undefined
              }
              drag={reduce ? false : isDesktop ? "x" : "y"}
              dragElastic={reduce ? 0 : 0.08}
              dragMomentum={false}
              dragConstraints={
                reduce
                  ? undefined
                  : isDesktop
                    ? { left: 0, right: drawer.closed }
                    : { top: snapY.full, bottom: snapY.closed }
              }
              onDragEnd={reduce ? undefined : isDesktop ? onDesktopDragEnd : onMobileDragEnd}
            >
              <div className="bw-launcher__chrome">
                {!isDesktop ? <div className="bw-launcher__handle" aria-hidden="true" /> : null}
                <div className="bw-launcher__title">Booking</div>
                <button type="button" className="bw-launcher__close" onClick={() => setOpen(false)} aria-label="Close">
                  ×
                </button>
              </div>

              <div className="bw-launcher__body" ref={contentRef}>
                {/* ✅ BookOnline bez zmian */}
                <BookOnline />
              </div>

              {shouldShowSticky && (
                <div className="bw-launcher__sticky">
                  <button type="button" className="bw-launcher__stickyBtn" onClick={triggerConfirm}>
                    {stickyCtaLabel}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
