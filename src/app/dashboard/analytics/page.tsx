import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Get total notes
  const totalNotes = await prisma.note.count({
    where: { userId },
  });

  const totalFolders = await prisma.folder.count({
    where: { userId },
  });

  // Notes by sentiment
  const notesBySentiment = await prisma.note.groupBy({
    by: ['sentiment'],
    where: { userId },
    _count: {
      id: true,
    },
  });

  // Top tags
  const tagsData = await prisma.noteTag.findMany({
    where: { note: { userId } },
    include: { tag: true },
  });
  
  const tagCounts: Record<string, number> = {};
  tagsData.forEach((nt: any) => {
    tagCounts[nt.tag.name] = (tagCounts[nt.tag.name] || 0) + 1;
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
      <p className="text-muted-foreground">Detailed insights into your note-taking habits.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
          <h3 className="tracking-tight text-sm font-medium">Total Notes</h3>
          <p className="text-2xl font-bold">{totalNotes}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-2 p-6">
          <h3 className="tracking-tight text-sm font-medium">Total Folders</h3>
          <p className="text-2xl font-bold">{totalFolders}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-xl font-medium mb-4">Sentiment Analysis</h3>
          <div className="space-y-4">
            {notesBySentiment.map((s: any) => (
              <div key={s.sentiment || 'unrated'} className="flex items-center justify-between">
                <span className="capitalize text-muted-foreground">{s.sentiment || 'Unrated'}</span>
                <span className="font-medium">{s._count.id}</span>
              </div>
            ))}
            {notesBySentiment.length === 0 && <p className="text-sm text-muted-foreground">No sentiment data available.</p>}
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-xl font-medium mb-4">Top Tags</h3>
          <div className="space-y-4">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center justify-between">
                <span className="bg-secondary px-2 py-1 rounded-md text-sm text-secondary-foreground">{tag}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {topTags.length === 0 && <p className="text-sm text-muted-foreground">No tags available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
