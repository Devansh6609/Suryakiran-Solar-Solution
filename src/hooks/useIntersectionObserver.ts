import { useState, useEffect, RefObject } from "react";

interface ObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  ref: RefObject<HTMLElement>,
  options: ObserverOptions = {
    threshold: 0.1,
    rootMargin: "0px",
    triggerOnce: true,
  }
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (options.triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else {
          if (!options.triggerOnce) {
            setIntersecting(false);
          }
        }
      },
      {
        threshold: options.threshold,
        rootMargin: options.rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isIntersecting;
}
