import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    {params}:{params:{courseId:string,chapterId:string}}
){
    try {
        const {userId} = auth();
        if(!userId){
            return new NextResponse("Unauthorized",{status:401});
        }

        const {isCompleted} = await req.json();

        const userProgress = await db.userProgress.upsert({
            where:{
                chapterId_userId:{
                    userId,
                    chapterId:params.chapterId,
                }
            },
            update:{
                isCompleted
            },
            create:{
                userId,
                chapterId: params.chapterId,
                isCompleted
            }
        })

        return NextResponse.json(userProgress);

    } catch (error) {
        console.log("[CHAPTER_ID_PROGRESS]",error);
        return new NextResponse("Internal Error",{status:500});
    }
}