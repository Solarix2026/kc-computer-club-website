/* eslint-disable prettier/prettier */
import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

export interface ClubSettings {
  id: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutEmail: string;
  aboutLocation: string;
  aboutMeetingTime: string;
  website?: string;
  logoUrl?: string;
  activeMembers: number;
  yearlyActivities: number;
  awardProjects: number;
  partners: number;
  githubUrl: string;
  discordUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

// GET club settings
export async function GET() {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'clubSettings'
    );

    if (response.documents && response.documents.length > 0) {
      return Response.json(response.documents[0]);
    }

    // Return default settings if none exist
    return Response.json({
      error: 'No settings found',
      message: 'Please create club settings first',
    });
  } catch (error: unknown) {
    const err = error as { code?: number; type?: string; message?: string };
    console.error('Failed to fetch club settings:', error);
    
    // If collection doesn't exist, return error with init instructions
    if (err.code === 404 || err.type === 'collection_not_found') {
      return Response.json(
        {
          error: 'Collection not found',
          message: 'Please initialize the database first by visiting /api/init',
          initUrl: '/api/init',
        },
        { status: 404 }
      );
    }

    return Response.json(
      { error: 'Failed to fetch club settings', message: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST/PUT club settings (create or update)
export async function POST(request: Request) {
  try {
    const settings: Partial<ClubSettings> = await request.json();

    // Try to get existing settings
    const existing = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'clubSettings'
    );

    let result;
    if (existing.documents && existing.documents.length > 0) {
      // Update existing
      result = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'clubSettings',
        existing.documents[0].$id,
        settings
      );
    } else {
      // Create new
      result = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'clubSettings',
        'unique()',
        settings
      );
    }

    return Response.json(result);
  } catch (error: unknown) {
    const err = error as { code?: number; type?: string; message?: string };
    console.error('Failed to save club settings:', error);

    // If collection doesn't exist, return error with init instructions
    if (err.code === 404 || err.type === 'collection_not_found') {
      return Response.json(
        {
          error: 'Collection not found',
          message: 'Please initialize the database first by visiting /api/init',
          initUrl: '/api/init',
        },
        { status: 404 }
      );
    }

    return Response.json(
      { error: 'Failed to save club settings', message: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
