"use client"

import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useSearchParams,useRouter, usePathname } from "next/navigation"
import queryString from "query-string"

export const SearchInput = () => {
    const [value,setValue] = useState("");
    const deboundedValue = useDebounce(value)

    const searchParams = useSearchParams();
    const router= useRouter();
    const pathName = usePathname()

    const currentCategoryId = searchParams.get("categoryId")

    useEffect(()=>{
        const url = queryString.stringifyUrl({
            url:pathName,
            query:{
                categoryId: currentCategoryId,
                title: deboundedValue
            }

        },{
            skipEmptyString: true,
            skipNull: true
        });

        router.push(url)
    },[deboundedValue,currentCategoryId,router,pathName])

    return(
        <div className="relative">
            <Search
                className="h-4 w-4 absolute top-3 left-3 text-slate-600"
            />
            <Input
                onChange={(e)=>setValue(e.target.value)}
                value={value}
                className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
                placeholder="Search for a course"
            />
        </div>
    )
}
