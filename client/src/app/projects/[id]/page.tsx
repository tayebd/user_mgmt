// /app/projects/[id]/page.tsx
import { Metadata } from 'next';
import ProjectContent from "./ProjectContent";

export const metadata: Metadata = {
  title: 'Project Details',
};

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ]);
  
  return <ProjectContent id={resolvedParams.id} />;
}