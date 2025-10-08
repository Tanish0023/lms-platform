# LMS Platform

The LMS Platform is a modern, full-stack Learning Management System (LMS) built with **Next.js 14**, designed to enable teachers to create and manage video-based courses and provide students with an intuitive learning experience. The platform leverages a server-first architecture with **MongoDB** as the database, **Clerk** for authentication, **Mux** for video processing, and **Stripe** for payments.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Architecture Diagrams](#architecture-diagrams)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
  - [Teacher Workflow](#teacher-workflow)
  - [Student Workflow](#student-workflow)
- [Database Schema](#database-schema)
- [Key Design Decisions](#key-design-decisions)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Teacher Features**:
  - Create and manage video-based courses with chapters and supplementary materials.
  - Upload videos via UploadThing, processed by Mux for adaptive streaming.
  - Publish courses and chapters with validation for required fields.
  - View revenue and sales analytics.
- **Student Features**:
  - Browse and filter published courses by category or title.
  - Purchase courses via Stripe with secure checkout.
  - Track progress with chapter-level completion and visual progress bars.
  - Stream videos with Mux’s adaptive bitrate playback.
  - Celebrate course completion with confetti animations.
- **General Features**:
  - Secure authentication at the edge with Clerk.
  - Responsive and optimized UI with Next.js Server and Client Components.
  - Type-safe database operations with Prisma ORM.

## Technology Stack
- **Frontend & Backend**: Next.js 14 (App Router, Server Components, Server Actions, API Routes)
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Clerk (edge-based middleware)
- **Video Processing**: Mux (encoding, CDN streaming)
- **Payments**: Stripe (checkout sessions, webhooks)
- **File Uploads**: UploadThing (CDN storage for videos and attachments)
- **Styling**: Tailwind CSS (assumed based on modern Next.js practices)
- **Deployment**: Vercel (recommended for Next.js)

## System Architecture
The LMS Platform follows a layered architecture with clear separation of concerns:

- **Client Layer**: Users access the platform via web browsers over HTTP/HTTPS.
- **Application Layer** (Next.js 14):
  - **Server Components**: Handle server-side rendering for fast initial loads and SEO.
  - **Client Components**: Provide interactive UI elements (e.g., video players, progress bars).
  - **API Routes** (`/api/*`): Manage mutations and integrations with external services.
  - **Server Actions** (`actions/*`): Optimize server-side data fetching for read operations.
- **External Services**:
  - **Clerk**: Edge-based authentication and session management.
  - **Mux**: Video upload, encoding, and streaming via CDN.
  - **Stripe**: Payment processing and checkout sessions.
  - **UploadThing**: File uploads for videos and attachments.
- **Data Layer**: Prisma ORM provides type-safe access to a MongoDB database.

The application is organized into two route groups:
- **Dashboard Routes** (`/dashboard`): Student dashboard, course search, teacher portal, course management, and analytics.
- **Course Routes** (`/courses`): Course navigation and chapter video playback.

## Architecture Diagrams
The following diagrams illustrate the LMS Platform’s architecture. 

### High-Level System Architecture
```mermaid
graph TB
    subgraph Client_Layer
        Browser[Browser]
    end
    
    subgraph Next_js_Application
        Middleware[Clerk Middleware<br>Authentication]
        ServerComponents[Server Components<br>SSR Pages]
        ClientComponents[Client Components<br>Interactive UI]
        APIRoutes[API Routes<br>/api/*]
        ServerActions[Server Actions<br>actions/*]
    end
    
    subgraph External_Services
        Clerk[Clerk<br>Authentication]
        Mux[Mux<br>Video Processing]
        Stripe[Stripe<br>Payments]
        UploadThing[UploadThing<br>File Uploads]
    end
    
    subgraph Data_Layer
        Prisma[Prisma ORM]
        MongoDB[MongoDB Database]
    end
    
    Browser --> Middleware
    Middleware --> ServerComponents
    Middleware --> APIRoutes
    ServerComponents --> ServerActions
    ServerComponents --> ClientComponents
    ClientComponents --> APIRoutes
    
    Middleware --> Clerk
    APIRoutes --> Mux
    APIRoutes --> Stripe
    APIRoutes --> UploadThing
    
    ServerActions --> Prisma
    APIRoutes --> Prisma
    Prisma --> MongoDB
```

### Application Structure
```mermaid
graph LR
    subgraph Route_Groups
        Dashboard["(dashboard)<br/>Teacher & Student UI"]
        Course["(course)<br/>Course Viewing"]
    end
    
    subgraph Dashboard_Routes
        Root["/  Student Dashboard"]
        Search["/search  Browse Courses"]
        Teacher["/teacher  Teacher Portal"]
        TeacherCourses["/teacher/courses  Manage Courses"]
        Analytics["/teacher/analytics  Revenue Analytics"]
    end
    
    subgraph Course_Routes
        CourseView["/courses/[id]  Course Layout"]
        ChapterView["/courses/[id]/chapters/[id]  Video Player"]
    end
    
    Dashboard --> Root
    Dashboard --> Search
    Dashboard --> Teacher
    Teacher --> TeacherCourses
    Teacher --> Analytics
    
    Course --> CourseView
    CourseView --> ChapterView
```

### Data Model Architecture
```mermaid
erDiagram
    Course ||--o{ Chapter : contains
    Course ||--o{ Attachment : has
    Course ||--o{ Purchase : purchased_by
    Course }o--|| Category : belongs_to
    Chapter ||--o| MuxData : has_video
    Chapter ||--o{ UserProgress : tracked_by
    Purchase }o--|| StripeCustomer : paid_by
    
    Course {
        string id
        string userId
        string title
        string description
        float price
        boolean isPublished
        string categoryId
    }
    
    Chapter {
        string id
        string courseId
        string title
        string videoUrl
        int position
        boolean isPublished
        boolean isFree
    }
    
    MuxData {
        string id
        string chapterId
        string assestId
        string playbackId
    }
    
    Purchase {
        string id
        string userId
        string courseId
    }
    
    UserProgress {
        string id
        string userId
        string chapterId
        boolean isCompleted
    }
```

### Teacher Workflow Architecture
```mermaid
sequenceDiagram
    participant T as Teacher
    participant UI as Next.js UI
    participant API as API Routes
    participant Mux as Mux Service
    participant DB as MongoDB
    
    T->>UI: Create Course
    UI->>API: POST /api/courses
    API->>DB: Insert Course
    DB-->>UI: Course Created
    
    T->>UI: Add Chapter
    UI->>API: POST /api/courses/[id]/chapters
    API->>DB: Insert Chapter
    
    T->>UI: Upload Video
    UI->>API: PATCH /api/courses/[id]/chapters/[id]
    API->>Mux: Create Video Asset
    Mux-->>API: Return playbackId
    API->>DB: Store MuxData
    
    T->>UI: Publish Course
    UI->>API: PATCH /api/courses/[id]/publish
    API->>DB: Validate & Set isPublished=true
    DB-->>UI: Course Published
```

### Student Workflow Architecture
```mermaid
sequenceDiagram
    participant S as Student
    participant UI as Next.js UI
    participant Actions as Server Actions
    participant API as API Routes
    participant Stripe as Stripe
    participant DB as MongoDB
    
    S->>UI: Browse Courses
    UI->>Actions: getCourses()
    Actions->>DB: Query Published Courses
    DB-->>UI: Display Courses
    
    S->>UI: Select Course
    UI->>API: POST /api/courses/[id]/checkout
    API->>Stripe: Create Checkout Session
    Stripe-->>S: Redirect to Payment
    
    S->>Stripe: Complete Payment
    Stripe->>API: Webhook: payment_success
    API->>DB: Create Purchase Record
    
    S->>UI: View Chapter
    UI->>Actions: getChapter()
    Actions->>DB: Check Purchase & Progress
    DB-->>UI: Display Video Player
    
    S->>UI: Mark Complete
    UI->>API: PUT /api/courses/[id]/chapters/[id]/progress
    API->>DB: Update UserProgress
```

### Authentication & Authorization Flow
```mermaid
graph TB
    Request["HTTP Request"] --> Middleware["Clerk Middleware"]
    Middleware --> Auth{"Authenticated?"}
    Auth -->|No| Login["Redirect to Sign In"]
    Auth -->|Yes| ServerComponent["Server Component"]
    
    ServerComponent --> CheckAuth["auth() Helper"]
    CheckAuth --> UserId{"userId exists?"}
    UserId -->|No| Redirect["Redirect to /"]
    UserId -->|Yes| CheckOwnership{"Check Resource Ownership"}
    
    CheckOwnership -->|Owner| AllowAccess["Allow Access"]
    CheckOwnership -->|Not Owner| Deny["Return 401"]
    
    AllowAccess --> RenderPage["Render Page"]
```

### Video Processing Pipeline
```mermaid
graph LR
    Upload[Video Upload] --> UploadThing[UploadThing<br>File Storage]
    UploadThing --> VideoURL[Get Video URL]
    VideoURL --> API[API Route<br>PATCH chapter]
    API --> DeleteOld[Delete Old<br>Mux Asset]
    DeleteOld --> CreateNew[Create New<br>Mux Asset]
    CreateNew --> Process[Mux Processing<br>Encoding & Optimization]
    Process --> Store[Store playbackId<br>in Database]
    Store --> Player[Mux Player<br>Streaming Playback]
```

### Progress Tracking System
```mermaid
graph TB
    Student[Student Watches Chapter] --> Complete[Mark Complete]
    Complete --> API[PUT /api/.../progress]
    API --> Upsert[Upsert UserProgress]
    Upsert --> Calculate[Calculate Course Progress]
    
    Calculate --> Count1[Count Total<br>Published Chapters]
    Calculate --> Count2[Count Completed<br>Chapters]
    
    Count1 --> Formula[Progress = <br>completed / total * 100]
    Count2 --> Formula
    
    Formula --> Display[Display Progress Bar]
    Formula --> Categorize{Progress = 100?}
    Categorize -->|Yes| Completed[Completed Courses]
    Categorize -->|No| InProgress[In Progress Courses]
```

## Setup Instructions

### Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local or cloud instance (e.g., MongoDB Atlas)
- **Accounts and API Keys**:
  - Clerk (authentication)
  - Mux (video processing)
  - Stripe (payments)
  - UploadThing (file uploads)

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/lms-platform.git
   cd lms-platform
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Next.js
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # MongoDB
   DATABASE_URL=your_mongodb_connection_string

   # Mux
   MUX_TOKEN_ID=your_mux_token_id
   MUX_TOKEN_SECRET=your_mux_token_secret

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # UploadThing
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id

   # Next.js App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set Up Prisma**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

6. **Configure Webhooks**:
   - Set up Stripe webhooks for payment success events at `/api/webhooks/stripe`.
   - Ensure the webhook URL is configured in the Stripe dashboard.

## Usage

### Teacher Workflow
1. **Sign In**: Authenticate via Clerk to access the teacher portal (`/teacher`).
2. **Create a Course**:
   - Navigate to `/teacher/courses` and fill out the course creation form (title, description, price, category).
   - Courses are unpublished by default.
3. **Add Chapters**:
   - Add chapters with titles, descriptions, and videos via the course management interface.
   - Upload videos through UploadThing; Mux processes them for streaming.
4. **Publish Content**:
   - Publish individual chapters and the course once all required fields are complete and at least one chapter is published.
5. **View Analytics**:
   - Access revenue and sales data at `/teacher/analytics`.

### Student Workflow
1. **Browse Courses**:
   - Visit `/search` to browse published courses, filter by category, or search by title.
2. **Purchase a Course**:
   - Select a course and proceed to Stripe’s checkout page.
   - Upon successful payment, gain access to all course content.
3. **View Content**:
   - Navigate to `/courses/[id]` to view course chapters.
   - Free chapters are accessible without purchase; others require a purchase record.
4. **Track Progress**:
   - Mark chapters as complete to update progress.
   - View progress in the course sidebar and dashboard, with confetti animations for course completion.

## Database Schema
The MongoDB schema, managed via Prisma, includes the following entities:
- **Course**: Stores metadata (title, description, price, publication status, category, owner user ID).
- **Chapter**: Represents lessons (title, video URL, position, publication status, free preview flag).
- **MuxData**: Stores Mux video metadata (asset ID, playback ID) linked to chapters.
- **UserProgress**: Tracks chapter completion with unique user-chapter constraints.
- **Purchase**: Records course purchases with unique user-course constraints.
- **Category**: Organizes courses for browsing.
- **Attachment**: Stores supplementary materials (e.g., PDFs).
- **StripeCustomer**: Links Clerk user IDs to Stripe customer IDs.

Relationships use cascade deletion to maintain data integrity (e.g., deleting a chapter removes associated progress and Mux data).

## Key Design Decisions
- **Server-First Architecture**: Uses Next.js Server Components and Server Actions for fast initial loads, SEO, and reduced client-side JavaScript.
- **Edge Authentication**: Clerk middleware authenticates requests at the edge for security and performance.
- **Delegated Video Processing**: Mux handles video encoding and streaming, simplifying infrastructure.
- **Granular Progress Tracking**: Chapter-level progress enables precise metrics and resume functionality.
- **Cascade Deletion**: Ensures referential integrity by automatically removing related data (e.g., progress records, Mux assets) when chapters or courses are deleted.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

