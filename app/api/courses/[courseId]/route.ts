import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";


const mux = new Mux({
    tokenId: process.env['MUX_TOKEN_ID'], // This is the default and can be omitted
    tokenSecret: process.env['MUX_TOKEN_SECRET'], // This is the default and can be omitted
});

export async function DELETE(
    req:Request,
    {params}:{params:{courseId:string}}
){
    try {
        const {userId} = auth();

        if(!userId){
            return new  NextResponse("Unauthorized",{status:401})
        }

        const course = await db.course.findUnique({
            where:{
                id:params.courseId,
                userId
            },
            include:{
                chapters:{
                    include:{
                        muxData:true

                    }
                }
            }
        })
        if(!course){
            return new NextResponse("Not Found",{status:404})
        }

        for (const chapter of course.chapters){
            if(chapter.muxData?.assestId){
                await mux.video.assets.delete(chapter.muxData.assestId);
            }
        }

        const deletedCourse = await db.course.delete({
            where:{
                id:params.courseId
            }
        });

        return NextResponse.json(deletedCourse)

    } catch (error) {
        console.log("[COURSE_DELETE]",error);
        return new NextResponse("Internal Error",{status:500})

    }
}

export async function PATCH(req:Request,
    {params}: {params:{courseId:string}}
){
    try{
        const {userId} = auth();
        const {courseId} = params;
        const values = await req.json();

        if(!userId){
            return new  NextResponse("Unauthorized",{status:401})
        }

        const course = await db.course.update({
            where:{
                id: courseId,
                userId
            },
            data:{
                ...values
            }
        });
        return NextResponse.json(course)

    }catch(error){
        console.log("[Course_Id]",error);
        return new NextResponse("Internal Error", {status:500})
    }
}