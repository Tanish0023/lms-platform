"use client"

import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./seach-input";

export const NavbarRoutes = ()=>{
    const pathName = usePathname();

    //To check for teacher and then we can update accordingly
    const isTeacherPage = pathName?.startsWith("/teacher");

    // Used to display chapters in the sidebar
    const isPlayerPage = pathName?.includes("/chapter")

    const isSearchPage = pathName === "/search"

    return(
        <>
            {isSearchPage && (
                <div className="hidden md:block">
                    <SearchInput/>
                </div>
            )}
            <div className="flex gap-x-2 ml-auto">
                {isTeacherPage || isPlayerPage ? (
                    <Link href="/">
                        <Button size="sm" variant="ghost">
                            <LogOut className="h-4 w-4 mr-2"/>
                            Exit
                        </Button>
                    </Link>
                ):(
                    <Link href="/teacher/courses">
                        <Button size="sm" variant="ghost">
                            Teacher Mode
                        </Button>
                    </Link>
                )}
                <UserButton/>
            </div>
        </>
    )

}