# **App Name**: Dirección en acción

## Core Features:

- User Authentication and Roles: Secure authentication system with role-based access control for students and teachers using Firebase Auth (email and Google). Teachers have administrative privileges.
- Game Configuration: Allow teachers to create games, setting parameters such as the number of teams, rounds, initial funds, and moral values. Customizable investment and crisis catalogs, with adjustable difficulty for AI rivals, and parameters for game rules. Option to toggle public leaderboard.
- Customizable Catalogs and Events: Teachers can add and edit investments and crisis events (with five response options each), showing students only the cost and hiding consequences. Students can select multiple options per crisis and justify their choices.
- Student Dashboard and Decision Forms: Student interface to view KPIs, access narrative briefings, input decisions in finance, reputation, and personal areas, and respond to crisis events.
- Teacher Dashboard and Monitoring Tools: Teacher interface to monitor team progress, close rounds, review AI-generated reports, and manually adjust results before publication.
- Asynchronous Round Processing: The game engine processes each round's data, calculates KPIs and market attractiveness model, and communicates with Gemini AI for report generation upon teacher's action to 'Process Round.' Notifications alert the teacher when reports are ready.
- Complete Business Logic: Implement the Market Attractiveness Model (50% grade average, 30% relative price, 20% marketing investment) and distribute 50 new students. Recalculate PEB and XP, applying penalties for overload, subsidy delays, loan interest, strikes, etc.
- AI-Powered Debriefing Reports: Utilize Gemini to generate comprehensive reports for teachers, including decision analysis, mayeutic questions, and pedagogical suggestions. Tool will propose mayeutic questions and pedagogical suggestions, with teacher control to revise/adjust results before publishing.
- Gamification and Achievements: Implement a badge system ('The Financier', 'The Public Relations', 'The Team') based on team performance, with an option for teachers to enable a leaderboard. Allow exceeding 100% PEB (up to 110%).

## Style Guidelines:

- Primary color: HSL(210, 60%, 50%) converted to RGB hex value: #478BE0, a strong blue to inspire confidence, forward thinking, and responsibility, core to the mission of a business simulation.
- Background color: HSL(210, 20%, 95%) converted to RGB hex value: #F0F4FA. Very light, providing contrast to the primary.
- Accent color: HSL(180, 50%, 50%) converted to RGB hex value: #40BFBF, an analogous color to the primary which adds flair while remaining appropriate for a business application.
- Body and headline font: 'PT Sans' (sans-serif) for clarity and modern look throughout the application.
- Use clean, professional icons related to finance, reputation, and education. Avoid images or logos of real schools; use generic, abstract illustrations for the narrative and icons.
- Employ a responsive design with clear navigation (lateral for students, superior for admins) to accommodate various devices.
- Incorporate subtle transitions and animations to enhance user experience without being distracting.