"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react";
import "react-quill/dist/quill.bubble.css"

interface PreviewProps{
    value: string 
}

export const Preview = ({ value}: PreviewProps) => {
    // We import It like this to handle NextJS Hydration Issue
    // Use Memo stores it in cache so that it does not have to be run multiple time
    const ReactQuill = useMemo(()=> dynamic(()=> import("react-quill"),{ssr:false}),[]);

    return(
        
        <ReactQuill 
            theme="bubble"
            value={value}
            readOnly
        />
        
    )
}

