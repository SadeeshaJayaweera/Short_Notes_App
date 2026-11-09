import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const tagFilter = searchParams.get('tag');

    // Fetch active notes
    const where: any = {
      userId,
      deletedAt: null,
    };
    if (folderId) where.folderId = folderId;

    const notes = await prisma.note.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        noteType: true,
        folderId: true,
        folder: {
          select: { name: true, color: true },
        },
        tags: {
          select: { tag: { select: { id: true, name: true, color: true } } },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const noteIds = new Set(notes.map((n) => n.id));

    // Fetch explicit relationships
    const relationships = await prisma.noteRelationship.findMany({
      where: {
        sourceNoteId: { in: Array.from(noteIds) },
        targetNoteId: { in: Array.from(noteIds) },
      },
    });

    // Build edges
    const edges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
      context?: string | null;
    }> = [];

    const edgeSet = new Set<string>();

    // 1. Explicit relationships
    relationships.forEach((rel) => {
      const key = `${rel.sourceNoteId}->${rel.targetNoteId}`;
      edgeSet.add(key);
      edges.push({
        id: rel.id,
        source: rel.sourceNoteId,
        target: rel.targetNoteId,
        type: rel.relationshipType,
        context: rel.context,
      });
    });

    // 2. Wikilink style references [[Title]]
    const titleToIdMap = new Map<string, string>();
    notes.forEach((n) => {
      titleToIdMap.set(n.title.toLowerCase().trim(), n.id);
    });

    notes.forEach((note) => {
      const matches = note.content?.match(/\[\[(.*?)\]\]/g);
      if (matches) {
        matches.forEach((m) => {
          const rawTargetTitle = m.slice(2, -2).trim().toLowerCase();
          const targetId = titleToIdMap.get(rawTargetTitle);
          if (targetId && targetId !== note.id) {
            const key = `${note.id}->${targetId}`;
            if (!edgeSet.has(key)) {
              edgeSet.add(key);
              edges.push({
                id: `link-${note.id}-${targetId}`,
                source: note.id,
                target: targetId,
                type: 'references',
                context: `Linked via [[${rawTargetTitle}]]`,
              });
            }
          }
        });
      }
    });

    // 3. Shared Tag connections (implicit semantic relationships)
    const tagToNotes = new Map<string, string[]>();
    notes.forEach((n) => {
      n.tags.forEach((t) => {
        const tagName = t.tag.name.toLowerCase();
        if (!tagToNotes.has(tagName)) tagToNotes.set(tagName, []);
        tagToNotes.get(tagName)!.push(n.id);
      });
    });

    tagToNotes.forEach((ids, tagName) => {
      if (ids.length >= 2 && ids.length <= 15) {
        for (let i = 0; i < ids.length; i++) {
          for (let j = i + 1; j < ids.length; j++) {
            const key = `${ids[i]}<->${ids[j]}`;
            const reverseKey = `${ids[j]}<->${ids[i]}`;
            if (!edgeSet.has(key) && !edgeSet.has(reverseKey)) {
              edgeSet.add(key);
              edges.push({
                id: `tag-${tagName}-${ids[i]}-${ids[j]}`,
                source: ids[i],
                target: ids[j],
                type: 'related_to',
                context: `Shared tag: #${tagName}`,
              });
            }
          }
        }
      }
    });

    // Compute node degree
    const degreeMap = new Map<string, number>();
    edges.forEach((e) => {
      degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
    });

    // Format nodes
    const nodes = notes.map((note) => ({
      id: note.id,
      title: note.title,
      summary: note.summary,
      noteType: note.noteType,
      folderName: note.folder?.name || 'Unorganized',
      folderColor: note.folder?.color || 'blue',
      tags: note.tags.map((t) => t.tag.name),
      updatedAt: note.updatedAt,
      connections: degreeMap.get(note.id) || 0,
    }));

    const isolatedCount = nodes.filter((n) => n.connections === 0).length;

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        edges,
        stats: {
          totalNotes: nodes.length,
          totalRelationships: edges.length,
          isolatedNotes: isolatedCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sourceNoteId, targetNoteId, relationshipType, context } = body;

    if (!sourceNoteId || !targetNoteId) {
      return NextResponse.json({ message: 'Source and target note IDs are required' }, { status: 400 });
    }

    if (sourceNoteId === targetNoteId) {
      return NextResponse.json({ message: 'Cannot connect a note to itself' }, { status: 400 });
    }

    // Verify ownership of both notes
    const [source, target] = await Promise.all([
      prisma.note.findUnique({ where: { id: sourceNoteId } }),
      prisma.note.findUnique({ where: { id: targetNoteId } }),
    ]);

    if (!source || source.userId !== session.user.id || !target || target.userId !== session.user.id) {
      return NextResponse.json({ message: 'Note not found or access denied' }, { status: 404 });
    }

    const relationship = await prisma.noteRelationship.upsert({
      where: {
        sourceNoteId_targetNoteId_relationshipType: {
          sourceNoteId,
          targetNoteId,
          relationshipType: relationshipType || 'references',
        },
      },
      create: {
        sourceNoteId,
        targetNoteId,
        relationshipType: relationshipType || 'references',
        context: context || null,
      },
      update: {
        context: context || null,
      },
    });

    return NextResponse.json({ success: true, data: relationship }, { status: 201 });
  } catch (error) {
    console.error('Error creating note relationship:', error);
    return NextResponse.json({ message: 'Failed to create relationship' }, { status: 500 });
  }
}

