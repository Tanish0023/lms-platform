import { db } from "@/lib/db";
import { Attachment, Chapter } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    // Validate input parameters (optional)
    if (!userId || !courseId || !chapterId) {
      throw new Error("Invalid input parameters");
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    const course = await db.course.findUnique({
      where: {
        isPublished: true,
        id: courseId,
      },
      select: {
        price: true,
      },
    });

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    let muxData = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    // Fetch attachments (if purchased)
    if(purchase){
        attachments = purchase
        ? await db.attachment.findMany({
            where: {
              courseId,
            },
          })
        : [];
    }

    // Fetch Mux data and next chapter (if free or purchased)
    if(chapter.isFree || purchase) {
        [muxData, nextChapter] = await Promise.all([
            await db.muxData.findUnique({
              where: {
                chapterId,
              },
            }),
            await db.chapter.findFirst({
              where: {
                courseId,
                isPublished: true,
                position: {
                  gt: chapter?.position,
                },
              },
              orderBy: {
                position: "asc",
              },
            }),
          ]);
    }


    const userProgress = await db.userProgress.findUnique({
      where: {
        chapterId_userId: {
          chapterId,
          userId,
        },
      },
    });

    return {
      chapter,
      course,
      muxData,
      attachments,
      userProgress,
      nextChapter,
      purchase,
    };
  } catch (error) {
    console.error("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchased: null,
    };
  }
};