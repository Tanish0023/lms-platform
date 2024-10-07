"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css"

interface EditorProps{
    onChange: (value:string) => void;
    value: string 
}

export const Editor = ({onChange, value}: EditorProps) => {
    // We import It like this to handle NextJS Hydration Issue
    // Use Memo stores it in cache so that it does not have to be run multiple time
    const ReactQuill = useMemo(()=> dynamic(()=> import("react-quill"),{ssr:false}),[]);

    return(
        <div className="bg-white">
            <ReactQuill 
                theme="snow"
                value={value}
                onChange={onChange}
            />
        </div>
    )
}

