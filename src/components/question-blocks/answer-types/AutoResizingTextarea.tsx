import React, { useRef, useLayoutEffect } from 'react';

export interface AutoResizingTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  title?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  dataBlockId?: string;
  dataOptId?: string;
}

export const AutoResizingTextarea: React.FC<AutoResizingTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className,
  maxLength,
  title,
  onFocus,
  onBlur,
  dataBlockId,
  dataOptId
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const adjustHeight = () => {
      el.style.height = 'auto';
      el.style.height = `${Math.max(20, el.scrollHeight)}px`;
    };

    adjustHeight();

    const ro = new ResizeObserver(() => {
      adjustHeight();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      cols={1}
      value={value}
      maxLength={maxLength}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
      onChange={(e) => {
        onChange(e.target.value.replace(/\n/g, ' '));
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      data-block-id={dataBlockId}
      data-opt-id={dataOptId}
      placeholder={placeholder}
      className={`resize-none overflow-hidden leading-tight min-w-0 w-full whitespace-pre-wrap ${className || ''}`}
      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
      title={title}
    />
  );
};
