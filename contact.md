#### Feature Overview
The Journal App is a web application for creating, managing, and digitizing journal entries, built with Next.js, Tailwind CSS, and Firebase. The new feature involves adding three static pages (`Contact Us`, `Terms and Conditions`, and `Refund and Cancellation`) for regulatory purposes. These pages will:
- Have static content tailored to the Journal App’s purpose (digitizing journal entries).
- Follow the app’s existing UI and theme (e.g., Tailwind CSS classes, light/dark mode support).
- Be accessible via URLs matching the existing structure (e.g., `/contactus`, `/termsandconditions`, `/refundandcancellation` to align with `/forgot-password`, `/new-entry`, etc.).
- Include breadcrumbs linking back to the landing page.
- Be linked in the existing footer component (`components/footer.tsx`) across all pages.
- Be publicly accessible without authentication, similar to the landing page.

#### Implementation Plan

1. **Create Static Page Components**
   - Create three new page components in the `app/` directory for `Contact Us`, `Terms and Conditions`, and `Refund and Cancellation`.
   - Each page will:
     - Use the same layout structure as `app/landing/page.tsx` (header, main content, footer).
     - Include a breadcrumb navigation linking back to the landing page (`/landing`).
     - Use Tailwind CSS classes for styling, matching the app’s theme (e.g., `bg-gray-50`, `dark:bg-gray-900`, `text-gray-800`, `dark:text-gray-200`).
     - Contain static content relevant to the Journal App (e.g., contact details, terms of use, refund policies).
   - **Suggested Content**:
     - **Contact Us**: Provide an email address (`support@journaldigitizer.com`), a brief description of support availability, and a link to the privacy policy.
     - **Terms and Conditions**: Outline user responsibilities, intellectual property, app usage rules, and liability disclaimers tailored to journal digitization.
     - **Refund and Cancellation**: Specify that the app is free or describe refund policies for premium features (if applicable), and cancellation procedures for accounts.
   - **Files Impacted**:
     - `app/contactus/page.tsx` (new file)
     - `app/termsandconditions/page.tsx` (new file)
     - `app/refundandcancellation/page.tsx` (new file)

2. **Add Breadcrumb Navigation**
   - Create a reusable breadcrumb component to display navigation links (e.g., `Home > Contact Us`).
   - Include the breadcrumb component at the top of each new page, linking back to the landing page (`/landing`).
   - Use existing UI components (`components/ui/breadcrumb.tsx`) and style with Tailwind CSS to match the app’s theme.
   - **Files Impacted**:
     - `components/ui/breadcrumb.tsx` (modify to ensure it supports simple navigation)
     - `app/contactus/page.tsx` (include breadcrumb)
     - `app/termsandconditions/page.tsx` (include breadcrumb)
     - `app/refundandcancellation/page.tsx` (include breadcrumb)

3. **Update Footer Component**
   - Modify the existing `components/footer.tsx` to include links to the three new pages.
   - Add a navigation section with links to `Contact Us`, `Terms and Conditions`, and `Refund and Cancellation` using Tailwind CSS for styling (e.g., flexbox for alignment, hover effects).
   - Ensure the footer remains consistent across light and dark modes (e.g., `text-gray-500`, `dark:text-gray-400`).
   - **Files Impacted**:
     - `components/footer.tsx`

4. **Ensure Public Accessibility**
   - Verify that the new pages are publicly accessible without authentication, similar to `app/landing/page.tsx`.
   - Ensure no `ProtectedRoute` wrapper (from `components/auth/protected-route.tsx`) is applied to these routes.
   - Update `next.config.mjs` if necessary to ensure proper routing for the new pages (though this is likely not needed given Next.js file-based routing).
   - **Files Impacted**:
     - `next.config.mjs` (optional, only if routing issues arise)

5. **Test and Validate**
   - Test the new pages to ensure they render correctly in both light and dark modes.
   - Verify that breadcrumb navigation works and links back to the landing page.
   - Confirm that footer links are accessible from all pages and navigate correctly.
   - Check responsiveness (e.g., mobile vs. desktop) using the app’s existing responsive utilities (e.g., `sm:`, `md:` prefixes in Tailwind).
   - Validate that no authentication is required to access the new pages.
   - **Files Impacted**:
     - None (testing phase, no code changes)

#### Configuration or Database Migrations
- **Configuration**: No changes to Firebase configuration (`lib/firebase.ts`) or environment variables (`.env.local.example`) are required, as these are static pages.
- **Database Migrations**: No database changes are needed, as the pages contain static content and do not interact with the `journalEntries` table in Dexie (`lib/db.ts`).
- **Routing**: The Next.js file-based routing system will automatically handle the new pages based on their file names (`contactus`, `termsandconditions`, `refundandcancellation`).

#### Notes on Architecture and Conventions
- The new pages will follow the existing pattern of client-side rendering (`"use client"`) as seen in `app/landing/page.tsx` and other pages.
- Styling will adhere to the app’s Tailwind CSS conventions defined in `app/globals.css` (e.g., `--background`, `--foreground`, `--card` variables for theming).
- The breadcrumb component will leverage the existing `@radix-ui/react-breadcrumb` dependency (from `package.json`) to maintain consistency with other UI components.
- The footer update will use a flexbox layout to align links, consistent with the app’s design (e.g., `flex`, `justify-center` in Tailwind).
- The URL structure (`/contactus`, `/termsandconditions`, `/refundandcancellation`) matches the app’s existing convention of using lowercase, concatenated words (e.g., `/forgot-password`, `/new-entry`).

### Summary of Files Impacted
- **New Files**:
  - `app/contactus/page.tsx`
  - `app/termsandconditions/page.tsx`
  - `app/refundandcancellation/page.tsx`
- **Modified Files**:
  - `components/footer.tsx`
  - `components/ui/breadcrumb.tsx`
  - `next.config.mjs` (optional, only if routing adjustments are needed)