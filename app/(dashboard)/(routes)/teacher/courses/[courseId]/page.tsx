import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";

const CourseIdPage = async ({params}:{
    params:{courseId:string}
}) => {
    const {userId} = auth();

    if(!userId){
        return redirect("/")
    }

    if((params.courseId).length === 24 && /^[a-f0-9]+$/.test(params.courseId)){
        
    }else{
        return redirect("/")
    }

    const course = await db.course.findUnique({
        where:{
            id:params.courseId
        }
    })

    if(!course){
        return redirect("/");
    }

    const requiredFields = [
        course.title,
        course.description,
        course.price,
        course.imageUrl,
        course.categoryId
    ];

    const totalFileds = requiredFields.length

    //Here the boolean function will return false for null values and lenght will ignore that
    const completedFields = requiredFields.filter(Boolean).length

    const completionText = `(${completedFields}/${totalFileds})`

    return ( 
        <div className="p-6">
            <div className="flex items-center-justify-between">
                <div className="flex flex-col gap-y-2">
                    <h1 className="text-2xl font-medium">
                        Course Setup
                    </h1>
                    <span className="text-sm text-slate-700">
                        Complete all field {completionText}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={LayoutDashboard}/>
                        <h2 className="text-xl">
                            Customize your course
                        </h2>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default CourseIdPage;