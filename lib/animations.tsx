"use client";

import React, { forwardRef, useMemo } from "react";
import {
  motion,
  type Variants,
  type HTMLMotionProps,
} from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const cardHover = {
  rest: {
    scale: 1,
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  hover: {
    scale: 1.03,
    boxShadow:
      "0 20px 25px -5px rgb(0 0 0 / 0.15)",
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const buttonTap = {
  scale: 0.96,
};

type SectionProps =
  HTMLMotionProps<"section"> & {
    children: React.ReactNode;
    className?: string;
  };

export const MotionSection = forwardRef<
  HTMLElement,
  SectionProps
>(function MotionSection(
  { children, className, ...props },
  ref,
) {
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: "-80px",
      }}
      variants={fadeInUp}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
});

MotionSection.displayName = "MotionSection";

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        margin: "-40px",
      }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={fadeInUp}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealHeading({
  children,
  className,
  ...props
}: HTMLMotionProps<"h2"> & {
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <motion.h2
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {
          opacity: 0,
          y: 30,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.h2>
  );
}

function parseCounterValue(
  value: string,
  explicitSuffix: string,
) {
  const normalized = String(value || "").trim();

  const match = normalized.match(
    /^([+-]?[\d,]+(?:\.\d+)?)(.*)$/,
  );

  if (!match) {
    return {
      number: Number.NaN,
      suffix: explicitSuffix,
    };
  }

  const numericValue = Number(
    match[1].replace(/,/g, ""),
  );

  const suffix =
    explicitSuffix || match[2] || "";

  return {
    number: numericValue,
    suffix,
  };
}

export function AnimatedCounter({
  value,
  suffix = "",
  className,
}: {
  value: string;
  suffix?: string;
  className?: string;
}) {
  const parsedValue = useMemo(
    () => parseCounterValue(value, suffix),
    [value, suffix],
  );

  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (Number.isNaN(parsedValue.number)) {
      setCount(0);
      return;
    }

    const duration = 2000;
    const steps = 30;
    const increment =
      parsedValue.number / steps;

    let current = 0;

    const timer = setInterval(() => {
      current += increment;

      if (current >= parsedValue.number) {
        setCount(parsedValue.number);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [parsedValue.number]);

  const formattedCount = Number.isInteger(
    parsedValue.number,
  )
    ? Math.floor(count).toLocaleString()
    : count.toFixed(1);

  const output = Number.isNaN(parsedValue.number)
    ? value
    : `${formattedCount}${parsedValue.suffix}`;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {output}
    </motion.div>
  );
}