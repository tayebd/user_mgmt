import { Metadata } from 'next';
import TaskContent from './TaskContent';

export const metadata: Metadata = {
  title: 'Task Details',
};

export default async function TaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; taskId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <TaskContent params={resolvedParams} />
    </div>
  );
}
