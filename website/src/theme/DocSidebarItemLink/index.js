import React from 'react';
import OriginalDocSidebarItemLink from '@theme-original/DocSidebarItemLink';
import lastModified from '@site/src/data/last-modified.json';

const BADGE_STYLE = {
  marginLeft: '6px',
  fontSize: '9px',
  padding: '1px 5px',
  borderRadius: '8px',
  backgroundColor: '#e0a855',
  color: '#1a1a2a',
  fontWeight: 'bold',
  letterSpacing: '0.04em',
  verticalAlign: 'middle',
  flexShrink: 0,
};

export default function DocSidebarItemLink(props) {
  const docId = props.item?.docId;
  const meta = docId ? lastModified[docId] : null;

  if (!meta?.isNew) {
    return <OriginalDocSidebarItemLink {...props} />;
  }

  const item = {
    ...props.item,
    label: (
      <>
        {props.item.label}
        <span style={BADGE_STYLE} aria-label="actualizado recientemente">
          NUEVO
        </span>
      </>
    ),
  };

  return <OriginalDocSidebarItemLink {...props} item={item} />;
}
