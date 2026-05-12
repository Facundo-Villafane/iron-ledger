import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function ColorCode({ children, ...props }) {
  const text = typeof children === 'string' ? children.trim() : '';

  if (HEX_RE.test(text)) {
    return (
      <code
        {...props}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            backgroundColor: text,
            border: '1px solid rgba(128,128,128,0.4)',
            flexShrink: 0,
          }}
        />
        {text}
      </code>
    );
  }

  return <code {...props}>{children}</code>;
}

export default {
  ...MDXComponents,
  code: ColorCode,
};
