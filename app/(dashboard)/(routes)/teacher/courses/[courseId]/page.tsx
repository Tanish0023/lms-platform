import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, CircleDollarSign, File, LayoutDashboard, ListChecks } from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";

// from _components
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";
import Link from "next/link";

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
            id:params.courseId,
            userId
        },
        include: {
            chapters:{
                orderBy:{
                    position: "asc"
                }
            },
            attachments:{
                orderBy:{
                    createdAt: "desc"
                }
            }
        }
    })

    const categories = await db.category.findMany({
        orderBy:{
            name: "asc",
        },
        
    })

    if(!course){
        return redirect("/");
    }

    const requiredFields = [
        course.title,
        course.description,
        course.price,
        course.imageUrl,
        course.categoryId,
        course.chapters.some(chapter => chapter.isPublished),
    ];

    const totalFileds = requiredFields.length

    //Here the boolean function will return false for null values and lenght will ignore that
    const completedFields = requiredFields.filter(Boolean).length

    const completionText = `(${completedFields}/${totalFileds})`

    const isComplete = requiredFields.every(Boolean);

    return ( 
        <>
            {!course.isPublished && (
                <Banner
                    label="This course is unpublished. It will not be visible to the students."
                />
            )}
            <div className="p-6">
                <Link href={`/teacher/courses`} className="flex items-center text-sm hover:opacity-75 transition mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2"/>
                    Back to courses page
                </Link>
                <div className="flex items-center justify-between">
                    
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-2xl font-medium">
                            Course Setup
                        </h1>
                        <span className="text-sm text-slate-700">
                            Complete all field {completionText}
                        </span>
                    </div>
                    <Actions
                        disabled={!isComplete}
                        courseId={params.courseId}
                        isPublished={course.isPublished}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={LayoutDashboard}/>
                            <h2 className="text-xl">
                                Customize your course
                            </h2>
                        </div>
                        <TitleForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <DescriptionForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <ImageForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <CategoryForm
                            initialData={course}
                            courseId={course.id}
                            options={categories.map((category)=>(
                                {
                                    label: category.name,
                                    value: category.id
                                }
                            ))}
                        />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={ListChecks}/>
                                <h2 className="text-xl">
                                    Course Chapter
                                </h2>
                            </div>
                            <ChaptersForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={CircleDollarSign}/>
                                <h2 className="text-xl">
                                    Sell your Course
                                </h2>
                            </div>
                            <PriceForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={File}/>
                                <h2 className="text-xl">
                                    Resources and Attachments
                                </h2>
                            </div>
                            <AttachmentForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
     );
}
 
export default CourseIdPage;