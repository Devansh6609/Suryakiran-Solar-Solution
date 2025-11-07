import { useState, useEffect } from "react";

interface TypewriterOptions {
  loop?: boolean;
  typeSpeed?: number;
  deleteSpeed?: number;
  delaySpeed?: number;
}

export const useTypewriter = (
  texts: string[],
  {
    loop = false,
    typeSpeed = 30,
    deleteSpeed = 20,
    delaySpeed = 2500,
  }: TypewriterOptions = {}
) => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(typeSpeed);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % texts.length;
      const fullText = texts[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? deleteSpeed : typeSpeed);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), delaySpeed);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }

      if (!loop && loopNum >= texts.length - 1 && text === fullText) {
        return;
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [
    text,
    isDeleting,
    loopNum,
    texts,
    loop,
    typeSpeed,
    deleteSpeed,
    delaySpeed,
  ]);

  return text;
};
