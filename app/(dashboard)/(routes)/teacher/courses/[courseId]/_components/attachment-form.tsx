"use client"

import * as z from "zod"
import axios from "axios"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { File, ImageIcon, Loader2, Pencil, PlusCircle, X } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { Attachment, Course } from "@prisma/client"
import Image from "next/image"
import { FileUpload } from "@/components/file-upload"


const formSchema = z.object({
    url: z.string().min(1)
})



interface AttachmentFormProps{
    initialData:Course & {attachments: Attachment[]},
    courseId:string
}

export const AttachmentForm = ({initialData, courseId}:AttachmentFormProps) => {
    const [isEditing,setIsEditing] = useState(false);
    const [deletingId,setDeletingId] = useState<string | null>(null)

    const toggleEdit = () => setIsEditing(!isEditing)

    const router = useRouter()

    const onSubmit = async (values:z.infer<typeof formSchema> )=>{
        try{
            await axios.post(`/api/courses/${courseId}/attachments`,values);
            toast.success("Course updated");
            toggleEdit();
            
            router.refresh();

        }catch(error){  
            toast.error("Something went wrong!!")
        }
        
    }

    const onDelete = async (id:string)=>{
        try {
            setDeletingId(id);
            await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            toast.success("Attachment deleted");
            router.refresh();
        } catch (error) {
            console.log("Something Went wrong");
            toast.error("Something Went wrong!");
        }
        finally{
            setDeletingId(null);
        }
    }


    return(
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course Attachment
                < Button onClick={toggleEdit} variant="ghost">
                {isEditing && (
                    <>Cancel</>
                )}
                {!isEditing && (
                    <>
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        Add a file
                    </>
                )}
               
                    
                </Button>
            </div>

            {!isEditing && (
                <>
                    {initialData.attachments.length === 0 &&(
                        <p className="text-sm mt-2 text-slate-500 italic">
                            No attachments yet
                        </p>
                    )}
                    {initialData.attachments.length > 0 && (
                        <div className="space-y-2">
                            {initialData.attachments.map((attachemnt)=> (
                                <div 
                                    key={attachemnt.id}
                                    className="flex items-center p-3 w-full bg-sky-100 border-sky-200
                                    border text-sky-700 rounded-md"
                                >
                                    <File className="h-4 w-4 mr-2 flex-shrink-0"/>
                                    <p className="text-xs line line-clamp-1">
                                        {attachemnt.name}
                                    </p>
                                    {deletingId === attachemnt.id && (
                                        <div className="ml-auto">
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                        </div>
                                    )}
                                     {deletingId !== attachemnt.id && (
                                        <button
                                            onClick={() => onDelete(attachemnt.id)}
                                            className="ml-auto hover:opacity-75 transition">
                                            <X className="h-4 w-4"/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            
    
            {isEditing && (
               <div>
                
                    <FileUpload
                        endpoint="courseAttachment"
                        onChange={(url)=>{
                            if(url){
                                onSubmit({url:url})
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        Add attachments to help students
                    </div>
               </div>
            )}

        </div>
    )
}
