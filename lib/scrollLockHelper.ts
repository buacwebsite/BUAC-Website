"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

interface PreviousBodyStyles {
  overflow: string;
  touchAction: string;
  overscrollBehavior: string;
  paddingRight: string;
}

interface PreviousHtmlStyles {
  overflow: string;
  overscrollBehavior: string;
}

export function useScrollLock(
  lock: boolean,
) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lock) {
      return;
    }

    const body = document.body;
    const html =
      document.documentElement;

    const previousBodyStyles: PreviousBodyStyles =
      {
        overflow: body.style.overflow,
        touchAction:
          body.style.touchAction,
        overscrollBehavior:
          body.style.overscrollBehavior,
        paddingRight:
          body.style.paddingRight,
      };

    const previousHtmlStyles: PreviousHtmlStyles =
      {
        overflow: html.style.overflow,
        overscrollBehavior:
          html.style
            .overscrollBehavior,
      };

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    lenis?.stop();

    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.overscrollBehavior =
      "none";

    html.style.overflow = "hidden";
    html.style.overscrollBehavior =
      "none";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow =
        previousBodyStyles.overflow;

      body.style.touchAction =
        previousBodyStyles.touchAction;

      body.style.overscrollBehavior =
        previousBodyStyles.overscrollBehavior;

      body.style.paddingRight =
        previousBodyStyles.paddingRight;

      html.style.overflow =
        previousHtmlStyles.overflow;

      html.style.overscrollBehavior =
        previousHtmlStyles.overscrollBehavior;

      lenis?.start();
    };
  }, [lock, lenis]);
}