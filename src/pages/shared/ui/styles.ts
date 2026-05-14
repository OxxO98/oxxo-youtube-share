import type { CSSProperties } from 'react';

export const sharedShellStyle : CSSProperties = {
    height : '100dvh',
    width : '100dvw',
    background : '#070707',
    color : '#f5f5f5'
}

export const sharedHeaderStyle : CSSProperties = {
    padding: 0,
    height : 56,
    lineHeight : '56px',
    background : '#050505',
    border : 'none',
    boxShadow : '0 8px 24px rgba(0, 0, 0, 0.24)',
    zIndex : 2
}

export const sharedHeaderMobileStyle : CSSProperties = {
    ...sharedHeaderStyle,
    height : 40,
    paddingTop : 8,
    lineHeight : '32px',
}